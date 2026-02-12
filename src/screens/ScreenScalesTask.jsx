import React from "react";
import { useParams } from "react-router-dom";
import ExpressionScales from "../widgets/ExpressionScales.jsx";
import FooterNav from "../widgets/FooterNav.jsx";

function pickNext(pool, prevId) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  // чтобы не повторялось сразу то же самое
  let next = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (next.id === prevId && guard < 10) {
    next = pool[Math.floor(Math.random() * pool.length)];
    guard += 1;
  }
  return next;
}

function getFooterPx() {
  // читаем CSS var --footer-h с :root
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--footer-h")
    .trim();

  const n = parseFloat(raw);
  const footerH = Number.isFinite(n) ? n : 96;

  // safe-area для iOS
  // env() нельзя прочитать напрямую, но можно измерить через тест-элемент
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;left:0;right:0;bottom:0;height:constant(safe-area-inset-bottom);height:env(safe-area-inset-bottom);pointer-events:none;opacity:0;";
  document.body.appendChild(probe);
  const safe = probe.getBoundingClientRect().height || 0;
  document.body.removeChild(probe);

  // небольшой запас, чтобы точно не прилипало
  return footerH + safe + 16;
}

export default function ScreenScalesTask() {
  const { grade } = useParams();

  // Пулы примеров (можешь расширять)
  const pool = React.useMemo(() => {
    if (grade === "1-2") {
      return [
        { id: "s12-1", a: 16, b: 9 },
        { id: "s12-3", a: 34, b: 19 },
      ];
    }

    return [
      { id: "s34-1", a: 374, b: 159 },
      { id: "s34-2", a: 585, b: 229 },
    ];
  }, [grade]);

  const cfg = React.useMemo(
    () => ({
      title: "⚖️ Вычисли удобным способом",
      hint: "Запиши новое выражение. Вычисли",
    }),
    []
  );

  const [current, setCurrent] = React.useState(() => pickNext(pool, null));
  const [solved, setSolved] = React.useState(false);
  const [solvedCount, setSolvedCount] = React.useState(0);

  // ключ нужен, чтобы ExpressionScales гарантированно сбрасывался при смене примера
  const [taskKey, setTaskKey] = React.useState(1);

  // ref на блок с кнопкой "Решать ещё"
  const nextBtnWrapRef = React.useRef(null);

  // если сменили grade → сбросить на новый пул
  React.useEffect(() => {
    const first = pickNext(pool, null);
    setCurrent(first);
    setSolved(false);
    setSolvedCount(0);
    setTaskKey((k) => k + 1);
  }, [pool]);

  const scrollToNextButton = React.useCallback(() => {
    const scroller = document.querySelector(".content"); // твой scroll container
    const target = nextBtnWrapRef.current;
    if (!scroller || !target) return;

    const footerPx = getFooterPx();

    // ждём, чтобы:
    // 1) появилась кнопка
    // 2) пересчитались высоты
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scrollerRect = scroller.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        // хотим, чтобы низ кнопки был ВЫШЕ низа видимой области на footerPx
        const visibleBottom = scrollerRect.bottom - footerPx;
        const delta = targetRect.bottom - visibleBottom;

        if (delta > 0) {
          const nextTop = scroller.scrollTop + delta;
          scroller.scrollTo({ top: nextTop, behavior: "smooth" });
        } else {
          // если уже влезает — всё равно чуть подтянем "в безопасную зону"
          // чтобы не было ощущения, что кнопку подпирает футер
          const bump = 8;
          scroller.scrollTo({
            top: Math.max(0, scroller.scrollTop - bump),
            behavior: "smooth",
          });
        }
      });
    });

    // страховка: на iOS visualViewport иногда меняет высоту чуть позже
    setTimeout(() => {
      const scroller2 = document.querySelector(".content");
      const target2 = nextBtnWrapRef.current;
      if (!scroller2 || !target2) return;

      const footerPx2 = getFooterPx();
      const scrollerRect2 = scroller2.getBoundingClientRect();
      const targetRect2 = target2.getBoundingClientRect();

      const visibleBottom2 = scrollerRect2.bottom - footerPx2;
      const delta2 = targetRect2.bottom - visibleBottom2;

      if (delta2 > 0) {
        scroller2.scrollTo({
          top: scroller2.scrollTop + delta2,
          behavior: "smooth",
        });
      }
    }, 180);
  }, []);

  function handleSolved() {
    setSolved(true);
    setSolvedCount((c) => c + 1);

    // кнопка появится после рендера — скроллим сразу после
    setTimeout(scrollToNextButton, 0);
  }

  function handleNext() {
    const next = pickNext(pool, current?.id ?? null);
    setCurrent(next);
    setSolved(false);
    setTaskKey((k) => k + 1);
  }

  if (!current) return null;

  return (
    <section className="panel panel--task">
      <div className="taskHeader">
        <div>
          <div className="h1">{cfg.title}</div>
          <div className="hint">{cfg.hint}</div>
        </div>
      </div>

      {/* ОДНА карточка */}
      <div className="stack">
        <ExpressionScales
          key={taskKey}
          a={current.a}
          b={current.b}
          isActive={true}
          onSolved={handleSolved}
        />
      </div>

      {/* Кнопка "Решать ещё" появляется только после решения */}
      {solved && solvedCount < 2 ? (
        <>
          <div
            ref={nextBtnWrapRef}
            className="answerRow"
            style={{ marginTop: 16 }}
          >
            <button className="btn-primary" type="button" onClick={handleNext}>
              Решать ещё
            </button>
          </div>

          {/* КЛЮЧ: запас снизу, чтобы можно было реально докрутить кнопку над fixed футером */}
          <div
            aria-hidden="true"
            style={{
              height: "calc(var(--footer-h) + 28px + env(safe-area-inset-bottom))",
            }}
          />
        </>
      ) : null}

      <FooterNav />
    </section>
  );
}