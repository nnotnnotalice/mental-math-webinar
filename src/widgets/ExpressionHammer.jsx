import React from "react";

/**
 * props:
 * - expr: { a:number, op:'+'|'-', b:number }
 * - clickable: number (какое число кликабельное: b)
 * - options: Array<{ id:string, x:number, y:number, correct:boolean }>
 * - expected: number (итог ответа после разбиения)
 * - isActive: boolean (разрешено ли работать с этим выражением)
 * - onSolved: () => void
 */
export default function ExpressionHammer({
  label,
  showLabel = false,
  expr,
  clickable,
  options,
  expected,
  isActive,
  onSolved
}) {
  const { a, op, b } = expr || {};

  const [picked, setPicked] = React.useState(null); // {x,y,correct}
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const [solved, setSolved] = React.useState(false);
  const [status, setStatus] = React.useState({ ok: false, msg: "" });
  const pickBtnRef = React.useRef(null);
  const [menuPos, setMenuPos] = React.useState({ left: 0, top: 0, width: 0 });
  const inputRef = React.useRef(null);

  const solvedNotifiedRef = React.useRef(false);

function finishSolved() {
  setSolved((prev) => {
    if (prev) return prev;
    return true;
  });
}

  React.useEffect(() => {
  // если показываем ошибку — чистим инпут
  if (status?.ok) return;

  if (status?.msg === "Упс! Попробуй ещё" || status?.msg === "Введи число") {
    setAnswer("");
    requestAnimationFrame(() => {
      inputRef.current?.focus?.();
    });
  }
}, [status?.msg, status?.ok]);

  // закрывать меню, если кликнули вне
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
   const shuffledOptions = React.useMemo(() => {
  const arr = Array.isArray(options) ? [...options] : [];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}, [options]);

React.useEffect(() => {
  if (!solved) return;
  if (solvedNotifiedRef.current) return;
  solvedNotifiedRef.current = true;

  if (typeof onSolved === "function") onSolved();
}, [solved, onSolved]);

  function pickOption(opt) {
    if (!isActive || solved) return;
    setPicked(opt);
    setMenuOpen(false);

    // если выбрали неверную пару — сбрасываем ввод и показываем подсказку
    if (!opt.correct) {
      setStatus({ ok: false, msg: "Упс! Попробуй ещё" });
      setAnswer("");
    } else {
      setStatus({ ok: false, msg: "" });
    }
  }

  function checkAnswer() {
    const n = Number(String(answer).replace(",", "."));
    if (!Number.isFinite(n)) {
      setStatus({ ok: false, msg: "Введи число" });
      setAnswer("");
      return;
    }
   if (n === expected) {
  setSolved(true);
  setStatus({ ok: true, msg: "" }); // галочку рисуем отдельно, не через msg
  if (typeof onSolved === "function") onSolved();
} else {
  setStatus({ ok: false, msg: "Упс! Попробуй ещё" });
  setAnswer("");
}
  }

  // Сколько показывать строк:
  // 1) Всегда показываем исходное выражение (a op b, где b кликабельное)
  // 2) Если picked?.correct === true — показываем “разбитое” выражение + инпут
  const showExpanded = picked && picked.correct;

  // Чтобы после решения не было активной обводки, просто считаем active = isActive && !solved
  const cardClass =
    "exprCard " +
    (isActive && !solved ? "exprCard--active" : "exprCard--inactive");

  return (
  <div
    className={cardClass + (solved ? " exprCard--withMark" : "")}
    ref={wrapRef}
  >

{showLabel && label ? <div className="exprLabel">{label}</div> : null}

    {/* ✅ галочка слева (как в «Ключе») */}
    {solved ? <div className="exprSolvedMark" aria-hidden="true">✓</div> : null}

    <div className="exprBody"></div>
      {/* Строка 1: исходное выражение */}
      <div className="exprRow" role="group" aria-label="Выражение">
        <span className="token token--fixed">{a}</span>

        <span className="plus">{op}</span>

        {/* кликабельное число */}
        <button
  ref={pickBtnRef}
  type="button"
  className={"token pickToken " + (isActive && !solved ? "" : "pickToken--disabled")}
  onClick={() => {
    if (!isActive || solved) return;

    // позиционируем меню относительно карточки
    const btn = pickBtnRef.current;
    const wrap = wrapRef.current;
    if (btn && wrap) {
      const bRect = btn.getBoundingClientRect();
      const wRect = wrap.getBoundingClientRect();
      setMenuPos({
        left: bRect.left - wRect.left,
        top: bRect.bottom - wRect.top + 10, // небольшой отступ вниз
        width: bRect.width
      });
    }

    setMenuOpen((v) => !v);
  }}
>
  {b}
</button>

        {solved ? <div className="exprEquals">= {expected}</div> : null}
      </div>

      {/* Меню вариантов (появляется по клику на число) */}
      {menuOpen ? (
  <div
    className="pickMenu"
    role="menu"
    aria-label="Выбор разложения"
    style={{
      left: menuPos.left,
      top: menuPos.top,
      minWidth: Math.max(160, menuPos.width) // короткие, но не слишком
    }}
  >
    {shuffledOptions.map((opt) => (
      <button
        key={opt.id}
        type="button"
        className="pickMenu__item"
        onClick={() => pickOption(opt)}
      >
        {opt.x} и {opt.y}
      </button>
    ))}
  </div>
) : null}

      {/* Строка 2: разложение + инпут (только если выбрали верную пару) */}
      {showExpanded ? (
        <div className="exprRow exprRow--expanded" role="group" aria-label="Разложение">
          <span className="token token--fixed">{a}</span>

          <span className="plus">{op}</span>

          <span className="token token--fixed">{picked.x}</span>

          <span className="plus">{op}</span>

          <span className="token token--fixed">{picked.y}</span>

          <span className="exprEquals">=</span>

          {!solved ? (
<>
   <input
  ref={inputRef}
  className={"answerInput " + (status.ok ? "answerInput--ok" : "")}
  inputMode="numeric"
  placeholder="?"
  value={answer}
  onChange={(e) => {
    const v = e.target.value;
    setAnswer(v);

    const n = Number(String(v).replace(",", "."));
    if (!Number.isFinite(n)) {
      // не ругаемся на каждый символ, просто ждём нормальное число
      setStatus({ ok: false, msg: "" });
      return;
    }

    if (!Number.isFinite(n)) {
  setStatus({ ok: false, msg: "" });
  return;
}

const expectedStr = String(expected);
const valueStr = String(v);

// если ввели правильный полный ответ
if (n === expected) {
  setStatus({ ok: true, msg: "" });
  finishSolved();
  return;
}

// если число ещё "не дописано" — молчим
if (valueStr.length < expectedStr.length) {
  setStatus({ ok: false, msg: "" });
  return;
}

// если длина совпадает, но число неверное — тогда ошибка
setStatus({ ok: false, msg: "Упс! Попробуй ещё" });
setAnswer("");
  }}
/>
  </>
) : (
  <div className="exprEquals exprEquals--final">{expected}</div>
)}
        </div>
      ) : null}

      {/* Статус (✅ / ошибки) */}
      {status.msg ? (
        <div className={"status " + (status.ok ? "status--ok" : "status--warn")}>
          {status.msg}
        </div>
      ) : null}
    </div>
  );
}