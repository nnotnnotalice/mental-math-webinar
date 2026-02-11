import React from "react";

function toNum(v) {
  const n = Number(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

export default function ExpressionMagnet({
  label,
  expr,            // [a, "+", b]
  clickable,       // число-донор (у кого забираем 1)
  isActive,
  onSolved
}) {
  const a = expr?.[0];
  const op = expr?.[1] ?? "+";
  const b = expr?.[2];

  const [pickedValue, setPickedValue] = React.useState(null);
  const [wrongPick, setWrongPick] = React.useState(false);

  const [vals, setVals] = React.useState(["", "", ""]);
  const [ok, setOk] = React.useState([false, false, false]);
  const [solved, setSolved] = React.useState(false);

  const refs = React.useRef([]);
  const prevExprKey = React.useRef("");
  const solvedNotifiedRef = React.useRef(false);

  // донор — clickable (у кого забираем 1)
// позиции сохраняем как в исходном выражении: слева = a', справа = b'
const donor = clickable;
const isDonorLeft = donor === a;

const aPrime = isDonorLeft ? a - 1 : a + 1;
const bPrime = isDonorLeft ? b + 1 : b - 1;

// индексы инпутов: 0 = левый (a'), 1 = правый (b'), 2 = результат
const donorIdx = isDonorLeft ? 0 : 1;
const recvIdx = isDonorLeft ? 1 : 0;

function nextIndex(i) {
  if (i === donorIdx) return recvIdx;
  if (i === recvIdx) return 2;
  return 2;
}

  // итог
const total =
  op === "+"
    ? aPrime + bPrime
    : op === "-"
    ? aPrime - bPrime
    : aPrime + bPrime;

// шаги: 0 — донор, 1 — получатель, 2 — результат
const activeStep = ok[donorIdx] ? (ok[recvIdx] ? 2 : 1) : 0;

const bubbleText =
  activeStep === 0
    ? `${donor} − 1`
    : activeStep === 1
    ? `${isDonorLeft ? b : a} + 1`
    : `${aPrime} ${op} ${bPrime} = ?`;

  function resetAll() {
    setPickedValue(null);
    setWrongPick(false);
    setVals(["", "", ""]);
    setOk([false, false, false]);
    setSolved(false);

     solvedNotifiedRef.current = false;
  }

  React.useEffect(() => {
    const key = `${a}|${op}|${b}|${clickable}`;
    const changedExpr = prevExprKey.current && prevExprKey.current !== key;
    prevExprKey.current = key;

    if (changedExpr) {
      resetAll();
      return;
    }

    if (isActive && !solved) {
      setPickedValue(null);
      setWrongPick(false);
      setVals(["", "", ""]);
      setOk([false, false, false]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, a, op, b, clickable]);

  React.useEffect(() => {
  if (!solved) return;
  if (solvedNotifiedRef.current) return;

  solvedNotifiedRef.current = true;

  if (typeof onSolved === "function") {
    onSolved();
  }
}, [solved, onSolved]);

  function focusStep(i) {
    requestAnimationFrame(() => {
      refs.current[i]?.focus?.();
      refs.current[i]?.select?.();
    });
  }

  function expectedForStep(i) {
  if (i === 0) return aPrime;   // левый инпут = a'
  if (i === 1) return bPrime;   // правый инпут = b'
  return total;                // результат
}

  function validateStep(i, rawValue) {
    const n = toNum(rawValue);
    const exp = expectedForStep(i);
    return n !== null && n === exp;
  }

  function handlePick(value) {
    if (!isActive || solved) return;

    if (value === clickable) {
      setPickedValue(value);
      setWrongPick(false);
      focusStep(donorIdx);
    } else {
      setPickedValue(null);
      setWrongPick(true);
    }
  }

   function finishSolved() {
  setSolved(true);
}

  function onChangeStep(i, v) {
    if (!isActive || solved) return;
    if (!pickedValue) return;

    const nextVals = [...vals];
    nextVals[i] = v;
    setVals(nextVals);

    const isCorrect = validateStep(i, v);

    const nextOk = [...ok];
    nextOk[i] = isCorrect;
    setOk(nextOk);

    if (isCorrect) {
  const nxt = nextIndex(i);
  if (nxt !== 2) {
    focusStep(nxt);
  } else {
    // фокусим результат (2) перед финалом
    focusStep(2);
  }

  if (i === 2) finishSolved();
}
}

  function onKeyDownStep(i, e) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (!isActive || solved) return;
    if (!pickedValue) return;

    // если уже верно — переход
    if (ok[i]) {
  if (i === 2) finishSolved();
  else focusStep(nextIndex(i));
  return;
}

    // иначе — проверим
    const current = vals[i];
    const isCorrect = validateStep(i, current);

    const nextOk = [...ok];
    nextOk[i] = isCorrect;
    setOk(nextOk);

    if (isCorrect) {
  const nxt = nextIndex(i);
  if (nxt !== 2) focusStep(nxt);
  else focusStep(2);

  if (i === 2) finishSolved();
}
}

  // ---------- ВЫВОД “ЦЕПОЧКИ” ДЛЯ SOLVED ----------
  // 1) исходное выражение с ответом
  // 2) преобразованное выражение с ответом
  // Для +: (receiver+1) + (donor-1)
  // Для -: порядок стараемся сохранять (на практике у тебя будет +)
  const solvedLine1 = { left: a, op, right: b, result: total };
const solvedLine2 = { left: aPrime, op, right: bPrime, result: total };

  return (
  <div
    className={
      "exprCard magnetCard " +
      (!isActive ? "exprCard--inactive " : "") +
      (solved ? "exprCard--withMark exprCard--solved " : "")
    }
  >
    {label ? <div className="exprLabel">{label}</div> : null}

    {/* СЛЕВА: галочка после решения */}
    {solved ? (
      <div className="exprSolvedMark" aria-hidden="true">
        ✓
      </div>
    ) : null}

      {/* ====== SOLVED VIEW (как в молотке/ключе) ====== */}
      {solved ? (
        <div>
          {/* строка 1: исходное */}
          <div className="exprRow" role="group" aria-label="Решённое выражение">
            <div className="slot">
              <div className="token token--disabled">{solvedLine1.left}</div>
            </div>

            <div className="plus">{solvedLine1.op}</div>

            <div className="slot">
              <div className="token token--disabled">{solvedLine1.right}</div>
            </div>

            <div className="exprEquals">= {solvedLine1.result}</div>
          </div>

          {/* строка 2: преобразование */}
          <div className="exprRow exprRow--expanded" role="group" aria-label="Преобразование">
            <div className="slot">
              <div className="token token--disabled">{solvedLine2.left}</div>
            </div>

            <div className="plus">{solvedLine2.op}</div>

            <div className="slot">
              <div className="token token--disabled">{solvedLine2.right}</div>
            </div>

            <div className="exprEquals">= {solvedLine2.result}</div>
          </div>
        </div>
      ) : (
        <>
          {/* ====== NORMAL VIEW ====== */}
          <div className="exprRow" role="group" aria-label="Выражение">
            <div className="slot" onClick={() => handlePick(a)} role="button" tabIndex={0}>
              <div
                className={
                  "token magPick " +
                  (pickedValue === a ? "magPick--picked " : "") +
                  (a === clickable ? "magPick--donor " : "")
                }
              >
                {a}
              </div>
            </div>

            <div className="plus">{op}</div>

            <div className="slot" onClick={() => handlePick(b)} role="button" tabIndex={0}>
              <div
                className={
                  "token magPick " +
                  (pickedValue === b ? "magPick--picked " : "") +
                  (b === clickable ? "magPick--donor " : "")
                }
              >
                {b}
              </div>
            </div>
          </div>

          {wrongPick && !pickedValue ? (
            <div className="exprHintRow">
              <span className="exprHint">Забери единицу у другого числа</span>
            </div>
          ) : null}

          {pickedValue ? (
            <div className="magnetSteps">
              <div className="magnetInputs">
                {/* STEP 1 */}
                <div className="magnetCell">
                  {activeStep === 0 && donorIdx === 0 ? <div className="magnetBubble">{bubbleText}</div> : null}
{activeStep === 1 && recvIdx === 0 ? <div className="magnetBubble">{bubbleText}</div> : null}
                  <input
                    ref={(el) => (refs.current[0] = el)}
                    className={"magnetInput " + (ok[0] ? "magnetInput--ok" : "")}
                    inputMode="numeric"
                    placeholder="?"
                    value={vals[0]}
                    onChange={(e) => onChangeStep(0, e.target.value)}
                    onKeyDown={(e) => onKeyDownStep(0, e)}
                  />
                </div>

                <span className="magnetOp">+</span>

                {/* STEP 2 */}
                <div className="magnetCell">
                 {activeStep === 0 && donorIdx === 1 ? <div className="magnetBubble">{bubbleText}</div> : null}
{activeStep === 1 && recvIdx === 1 ? <div className="magnetBubble">{bubbleText}</div> : null}
                  <input
                    ref={(el) => (refs.current[1] = el)}
                    className={"magnetInput " + (ok[1] ? "magnetInput--ok" : "")}
                    inputMode="numeric"
                    placeholder="?"
                    value={vals[1]}
                    onChange={(e) => onChangeStep(1, e.target.value)}
                    onKeyDown={(e) => onKeyDownStep(1, e)}
                  />
                </div>

                <span className="magnetOp">=</span>

                {/* STEP 3 */}
                {/* STEP 3 */}
<div className="magnetCell">
  <input
    ref={(el) => (refs.current[2] = el)}
    className={"magnetInput " + (ok[2] ? "magnetInput--ok" : "")}
    inputMode="numeric"
    placeholder="?"
    value={vals[2]}
    onChange={(e) => onChangeStep(2, e.target.value)}
  />
</div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}