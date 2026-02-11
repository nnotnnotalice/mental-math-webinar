import React, { useMemo, useState } from "react";

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export default function ExpressionDnd({
  label,
  initial,
  movable,
  accepted,
  answer,
  onSolved,
  isActive,
  enter
}) {
  const [slots, setSlots] = useState(initial);
  const [dragValue, setDragValue] = useState(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [status, setStatus] = useState({ ok: false, msg: "" });

  const [solved, setSolved] = useState(false);
  const interactive = isActive && !solved;
  const inputRef = React.useRef(null);

  const isArrangementOk = useMemo(() => {
    if (solved) return false;
    return accepted.some((acc) => arraysEqual(acc, slots));
  }, [accepted, slots, solved]);

  // показываем инпут только после верной перестановки
  React.useEffect(() => {
    if (solved) return;

    if (isArrangementOk) {
      setInputVisible(true);
    } else {
      setInputVisible(false);
      setUserAnswer("");
      setStatus({ ok: false, msg: "" });
    }
  }, [isArrangementOk, solved]);

  // === АВТООЧИСТКА ИНПУТА ПОСЛЕ ОШИБКИ ===
React.useEffect(() => {
  if (!inputVisible) return;
  if (status.ok) return;

  if (status.msg === "Упс! Попробуй ещё") {
  setUserAnswer("");
  requestAnimationFrame(() => {
    inputRef.current?.focus?.();
  });
}
}, [status.msg, status.ok, inputVisible]);

  function onDragStart(value) {
  if (!interactive) return;
  if (isArrangementOk) return; // 🔒 блокируем после успеха
  setDragValue(value);
}

  function onDrop(targetIndex) {
  if (!interactive) return;
  if (isArrangementOk) return; // 🔒 блокируем после успеха
  if (dragValue === null) return;
  if (dragValue !== movable) return;

    // Перетаскивать можно только movable
    if (dragValue !== movable) return;

    const fromIndex = slots.findIndex((x) => x === dragValue);
    if (fromIndex === -1) return;

    // swap movable with target
    const next = [...slots];
    const tmp = next[targetIndex];
    next[targetIndex] = dragValue;
    next[fromIndex] = tmp;

    setSlots(next);
    setDragValue(null);
    setStatus({ ok: false, msg: "" });
  }

  return (
    <div
  className={
    "exprCard " +
    (isActive && !solved ? "exprCard--active" : "") +
    (!isActive ? " exprCard--inactive" : "") +
    (enter ? " exprCard--enter" : "") +
    (solved ? " exprCard--withMark" : "")
  }
>
      {label ? <div className="exprLabel">{label}</div> : null}

      {/* СЛЕВА: галочка после решения */}
      {solved ? (
  <div className="exprSolvedMark" aria-hidden="true">✓</div>
) : null}
<div className="exprBody"></div>
      {/* Строка выражения */}
      <div
  className="exprRow exprRow--main"
  role="group"
  aria-label="Выражение"
>
        {slots.map((value, idx) => {
          const isMovable = value === movable;

          return (
            <React.Fragment key={idx}>
              <div
                className={"slot " + (isArrangementOk ? "slot--ok" : "")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(idx)}
              >
                <div
  className={
    "token " +
    (isMovable && !solved && !isArrangementOk
      ? "token--movable"
      : "token--fixed")
  }
  draggable={isMovable && interactive && !isArrangementOk}
  onDragStart={() => onDragStart(value)}
>
  {value}
</div>
              </div>

              {idx < slots.length - 1 ? <div className="plus">+</div> : null}
            </React.Fragment>
          );
        })}

        {solved ? <div className="exprEquals">= {answer}</div> : null}
      {inputVisible ? (
  <>
    <span className="exprEquals">=</span>

    <div className="exprInlineAnswer">
      <input
  ref={inputRef}
  className={"answerInput " + (status.ok ? "answerInput--ok" : "")}
  inputMode="numeric"
  placeholder="?"
  value={userAnswer}
  onChange={(e) => {
    const v = e.target.value;
    setUserAnswer(v);
    if (status.msg) setStatus({ ok: false, msg: "" });

    const n = Number(String(v).replace(",", "."));
    if (!Number.isFinite(n)) {
      setStatus({ ok: false, msg: "" }); // не ругаемся на пустое/минус/запятую и т.п.
      return;
    }

    // ✅ если ответ совпал — решаем
    if (n === answer) {
      setStatus({ ok: true, msg: "" });
      setSolved(true);
      setInputVisible(false);
      if (typeof onSolved === "function") onSolved();
      return;
    }

    // ✅ чтобы не ругаться на "2" когда надо "25":
    const expectedLen = String(answer).length;
    const typedLen = String(v).length;

    if (typedLen < expectedLen) {
      setStatus({ ok: false, msg: "" }); // ещё печатает — молчим
      return;
    }

    // ❌ если длина уже как у ответа, но неверно — ошибка
    setStatus({ ok: false, msg: "Упс! Попробуй ещё" });
  }}
/>
    </div>
  </>
) : null}
      </div>

      {/* Хинт НИЖЕ выражения */}
     {!solved && (
  <div className="exprHintRow">
    {status.msg && !status.ok ? (
      <span className="exprHint exprHint--warn">
        {status.msg}
      </span>
    ) : isArrangementOk ? (
      <span className="exprHint exprHint--ok">
        Круглое число найдено!
      </span>
    ) : null}
  </div>
)}
    </div>
  );
}