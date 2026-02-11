import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GRADES, WRENCH_TASKS } from "../data.js";
import ExpressionDnd from "../widgets/ExpressionDnd.jsx";
import FooterNav from "../widgets/FooterNav.jsx";

export default function ScreenWrenchTask() {
  const [enterIdx, setEnterIdx] = React.useState(0);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const cardRefs = React.useRef([]);
  const { grade } = useParams();
  const tasks = WRENCH_TASKS[grade] ?? [];

  return (
    <section className="panel panel--task">
      <div className="taskHeader">
        <div>
          <h1 className="h1">🔧 Вычисли удобным способом</h1>
          <div className="hint">Перемести выделенное число, чтобы получить круглое</div>
        </div>
      </div>

      <div className="stack">
       {tasks.map((t, idx) => (
  <div
    key={t.id}
    ref={(el) => (cardRefs.current[idx] = el)}
  >
    <ExpressionDnd
  initial={t.initial}
  movable={t.movable}
  accepted={t.accepted}
  answer={t.answer}
  isActive={idx === activeIdx}
  enter={idx === enterIdx}
 onSolved={() => {
  // если это последняя карточка — просто "снимаем" активность
  if (idx >= tasks.length - 1) {
    setActiveIdx(-1);
    return;
  }

  const next = idx + 1;
  setActiveIdx(next);
  setEnterIdx(next);

  // прокрутка к следующей карточке
  setTimeout(() => {
    cardRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 120);
}}
/>
  </div>
))}
      </div>

<FooterNav />
    </section>
  );
}