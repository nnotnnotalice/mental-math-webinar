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
      hint: "Запиши новое выражение и вычисли",
    }),
    []
  );

  const [current, setCurrent] = React.useState(() => pickNext(pool, null));
  const [solved, setSolved] = React.useState(false);
  const [solvedCount, setSolvedCount] = React.useState(0);

  // ключ нужен, чтобы ExpressionScales гарантированно сбрасывался при смене примера
  const [taskKey, setTaskKey] = React.useState(1);

  // если сменили grade → сбросить на новый пул
  React.useEffect(() => {
    const first = pickNext(pool, null);
    setCurrent(first);
    setSolved(false);
    setSolvedCount(0);
    setTaskKey((k) => k + 1);
  }, [pool]);

  function handleSolved() {
  setSolved(true);
  setSolvedCount((c) => c + 1);
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
  <div className="answerRow" style={{ marginTop: 16 }}>
    <button className="btn-primary" type="button" onClick={handleNext}>
      Решать ещё
    </button>
  </div>
) : null}

      <FooterNav />
    </section>
  );
}