import React from "react";

function pairsEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a[0] === b[0] && a[1] === b[1];
}

function renderTokens(tokens, clickable, onClick, disabled) {
  return tokens.map((t, i) => {
    const key = `${t}-${i}`;

    if (t === "+" || t === "–" || t === "-" || t === "=") {
      return (
        <span key={key} className="plus">
          {t}
        </span>
      );
    }

    const isClickable = t === clickable;

    return (
      <span key={key} className="slot">
        <span
          className={
            "token " +
            (isClickable ? "token--movable" : "token--fixed") +
            (disabled ? " token--disabled" : "")
          }
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable && !disabled ? 0 : -1}
          onClick={isClickable && !disabled ? onClick : undefined}
          onKeyDown={(e) => {
            if (!isClickable || disabled) return;
            if (e.key === "Enter" || e.key === " ") onClick?.();
          }}
          title={isClickable ? "Нажми и выбери разложение" : ""}
        >
          {t}
        </span>
      </span>
    );
  });
}

export default function ExpressionPick({
  original,
  clickable,
  options,
  correct,
  expanded,
  answer,
  isActive,
  enter,
  onSolved,
}) {
  const [picked, setPicked] = React.useState(null);
  const [unlocked, setUnlocked] = React.useState(false);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [solved, setSolved] = React.useState(false);
  const [status, setStatus] = React.useState({ ok: false, msg: "" });
  const [open, setOpen] = React.useState(false);

  const disabled = !isActive || solved;

  function handlePick(valueStr) {
    if (disabled) return;
    if (!valueStr) return;

    const [a, b] = valueStr.split("|").map((x) => Number(x));
    const pair = [a, b];
    setPicked(pair);

    if (pairsEqual(pair, correct)) {
      setUnlocked(true);
      setStatus({ ok: true, msg: "" });
      setOpen(false);
    } else {
      setUnlocked(false);
      setStatus({ ok: false, msg: "Упс! Попробуй ещё" });
    }
  }

  function checkAnswer() {
    const n = Number(String(userAnswer).replace(",", "."));
    if (!Number.isFinite(n)) {
      setStatus({ ok: false, msg: "Введи число" });
      return;
    }
    if (n === answer) {
      setSolved(true);
      setStatus({ ok: true, msg: "✅" });
      if (typeof onSolved === "function") onSolved();
    } else {
      setStatus({ ok: false, msg: "Упс! Попробуй ещё" });
    }
  }

  return (
    <div
      className={
        "exprCard " +
        (isActive ? "exprCard--active" : "exprCard--inactive") +
        (enter ? " exprCard--enter" : "")
      }
    >
      {solved ? <div className="exprSolvedMark" aria-hidden="true">✓</div> : null}

      {/* 👇 ВАЖНО: добавили exprRow--main */}
      <div className="exprRow exprRow--main" role="group" aria-label="Выражение">
        {renderTokens(original, clickable, () => setOpen((v) => !v), disabled)}

        {unlocked && !solved ? (
  <>
    <span className="plus">=</span>

    <span className="exprInlineAnswer">
      <input
        className={"answerInput " + (status.ok ? "answerInput--ok" : "")}
        inputMode="numeric"
        placeholder="?"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") checkAnswer();
        }}
      />
      <button className="btn-primary" type="button" onClick={checkAnswer}>
        Проверить
      </button>
    </span>
  </>
) : null}

        {solved ? <div className="exprEquals">= {answer}</div> : null}
      </div>

      {open && !solved ? (
        <div className="pickRow">
          <select
            className="pickSelect"
            value={picked ? `${picked[0]}|${picked[1]}` : ""}
            onChange={(e) => handlePick(e.target.value)}
          >
            <option value="" disabled>
              Выбери разложение
            </option>
            {options.map(([a, b]) => (
              <option key={`${a}|${b}`} value={`${a}|${b}`}>
                {a} и {b}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {status.msg && !solved ? (
        <div className={"status " + (status.ok ? "status--ok" : "status--warn")}>
          {status.msg}
        </div>
      ) : null}
    </div>
  );
}