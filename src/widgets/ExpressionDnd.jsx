import React, { useMemo, useState, useEffect, useRef } from "react";

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
  enter,
}) {
  const [slots, setSlots] = useState(initial);
  const [dragValue, setDragValue] = useState(null);

  // mobile tap-to-move
  const [pickedIndex, setPickedIndex] = useState(null);

  const [inputVisible, setInputVisible] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [status, setStatus] = useState({ ok: false, msg: "" });

  const [solved, setSolved] = useState(false);
  const interactive = isActive && !solved;
  const inputRef = useRef(null);

  // ✅ IMPORTANT: tap mode (phone + tablet) must react to resize/orientation changes
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqTabletOrPhone = window.matchMedia("(max-width: 1024px)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");

    const update = () => {
      const hasTouch =
        "ontouchstart" in window ||
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

      setIsMobile(
        !!mqTabletOrPhone.matches && (!!mqCoarse.matches || hasTouch)
      );
    };

    update();

    // Safari < 14 uses addListener/removeListener
    if (mqTabletOrPhone.addEventListener) {
      mqTabletOrPhone.addEventListener("change", update);
      mqCoarse.addEventListener("change", update);
    } else {
      mqTabletOrPhone.addListener(update);
      mqCoarse.addListener(update);
    }

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      if (mqTabletOrPhone.removeEventListener) {
        mqTabletOrPhone.removeEventListener("change", update);
        mqCoarse.removeEventListener("change", update);
      } else {
        mqTabletOrPhone.removeListener(update);
        mqCoarse.removeListener(update);
      }

      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // если родитель подкидывает новый initial (другая карточка/пример) — сбрасываем
  useEffect(() => {
    setSlots(initial);
    setDragValue(null);
    setPickedIndex(null);
    setInputVisible(false);
    setUserAnswer("");
    setStatus({ ok: false, msg: "" });
    setSolved(false);
  }, [initial]);

  const isArrangementOk = useMemo(() => {
    if (solved) return false;
    return accepted.some((acc) => arraysEqual(acc, slots));
  }, [accepted, slots, solved]);

  // показываем инпут только после верной перестановки
  useEffect(() => {
    if (solved) return;

    if (isArrangementOk) {
      setInputVisible(true);
    } else {
      setInputVisible(false);
      setUserAnswer("");
      setStatus({ ok: false, msg: "" });
    }
  }, [isArrangementOk, solved]);

  // сброс выбора на мобилке при смене состояния/успехе/переключении карточки
  useEffect(() => {
    setPickedIndex(null);
  }, [isArrangementOk, isActive, solved]);

  // автоочистка инпута после ошибки
  useEffect(() => {
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

    const fromIndex = slots.findIndex((x) => x === dragValue);
    if (fromIndex === -1) return;

    const next = [...slots];
    const tmp = next[targetIndex];
    next[targetIndex] = dragValue;
    next[fromIndex] = tmp;

    setSlots(next);
    setDragValue(null);
    setStatus({ ok: false, msg: "" });
  }

  function onSlotTap(targetIndex) {
    if (!interactive) return;
    if (!isMobile) return;
    if (isArrangementOk) return;

    // 1) Если ещё ничего не выбрано — выбираем movable, если тапнули по нему
    if (pickedIndex === null) {
      if (slots[targetIndex] !== movable) return;
      setPickedIndex(targetIndex);
      return;
    }

    // 2) Если уже выбрано — меняем местами выбранный movable с таргет-слотом
    if (slots[pickedIndex] !== movable) {
      setPickedIndex(null);
      return;
    }

    // тап по самому выбранному — просто снимаем выбор
    if (targetIndex === pickedIndex) {
      setPickedIndex(null);
      return;
    }

    const next = [...slots];
    const tmp = next[targetIndex];
    next[targetIndex] = next[pickedIndex];
    next[pickedIndex] = tmp;

    setSlots(next);
    setPickedIndex(null);
    setStatus({ ok: false, msg: "" });
  }

  const cardClass =
    "exprCard " +
    (isActive && !solved ? "exprCard--active" : "") +
    (!isActive ? " exprCard--inactive" : "") +
    (enter ? " exprCard--enter" : "") +
    (solved ? " exprCard--withMark" : "");

  return (
    <div className={cardClass}>
      {label ? <div className="exprLabel">{label}</div> : null}

      {solved ? (
        <div className="exprSolvedMark" aria-hidden="true">
          ✓
        </div>
      ) : null}

      <div className="exprRow exprRow--main" role="group" aria-label="Выражение">
        {slots.map((value, idx) => {
          const isMovable = value === movable;
          const picked = isMobile && pickedIndex === idx;
          const canReceive = isMobile && pickedIndex !== null && idx !== pickedIndex;

          return (
            <React.Fragment key={idx}>
              <div
                className={
                  "slot " +
                  (isArrangementOk ? "slot--ok " : "") +
                  (picked ? "slot--picked " : "") +
                  (canReceive ? "slot--target " : "")
                }
                onDragOver={!isMobile ? (e) => e.preventDefault() : undefined}
                onDrop={!isMobile ? () => onDrop(idx) : undefined}
                onClick={isMobile ? () => onSlotTap(idx) : undefined}
                role={isMobile ? "button" : undefined}
                aria-label={
                  isMobile
                    ? picked
                      ? "Выбрано. Нажми на другой слот, чтобы перенести"
                      : canReceive
                        ? "Нажми, чтобы поставить сюда"
                        : "Слот"
                    : undefined
                }
              >
                <div
                  className={
                    "token " +
                    (isMovable && !solved && !isArrangementOk
                      ? "token--movable"
                      : "token--fixed") +
                    (picked ? " token--picked" : "")
                  }
                  draggable={!isMobile && isMovable && interactive && !isArrangementOk}
                  onDragStart={() => !isMobile && onDragStart(value)}
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
                    setStatus({ ok: false, msg: "" });
                    return;
                  }

                  if (n === answer) {
                    setStatus({ ok: true, msg: "" });
                    setSolved(true);
                    setInputVisible(false);
                    if (typeof onSolved === "function") onSolved();
                    return;
                  }

                  const expectedLen = String(answer).length;
                  const typedLen = String(v).length;

                  if (typedLen < expectedLen) {
                    setStatus({ ok: false, msg: "" });
                    return;
                  }

                  setStatus({ ok: false, msg: "Упс! Попробуй ещё" });
                }}
              />
            </div>
          </>
        ) : null}
      </div>

      {!solved && (
        <div className="exprHintRow">
          {status.msg && !status.ok ? (
            <span className="exprHint exprHint--warn">{status.msg}</span>
          ) : isArrangementOk ? (
            <span className="exprHint exprHint--ok">Круглое число найдено!</span>
          ) : isMobile && interactive && !isArrangementOk ? (
            pickedIndex === null ? (
              <span className="exprHint">Нажми на выделенное число</span>
            ) : (
              <span className="exprHint">Нажми, куда перенести</span>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}
