import React from "react";
import { useParams } from "react-router-dom";
import ExpressionMagnet from "../widgets/ExpressionMagnet.jsx";
import FooterNav from "../widgets/FooterNav.jsx";

export default function ScreenMagnetTask() {
  const { grade } = useParams();

  const cfg = React.useMemo(() => {
    if (grade === "1-2") {
      return {
        title: "🧲 Вычисли удобным способом",
        hint: "Нажми на число, откуда нужно забрать единицу",
        items: [
          { id: "m12-1", expr: [9, "+", 7], clickable: 7 },
          { id: "m12-2", expr: [5, "+", 19], clickable: 5 },
        ],
      };
    }
    return {
      title: "🧲 Вычисли удобным способом",
      hint: "Нажми на число, откуда нужно забрать единицу",
      items: [
        { id: "m34-1", expr: [349, "+", 6], clickable: 6 },
        { id: "m34-2", expr: [7, "+", 669], clickable: 7 },
      ],
    };
  }, [grade]);

  // активируем первую карточку; после решения переключаем на следующую
  const [activeIndex, setActiveIndex] = React.useState(0);
  const cardRefs = React.useRef([]);

  return (
    <section className="panel panel--task">
      <div className="taskHeader">
        <div>
          <div className="h1">{cfg.title}</div>
          <div className="hint">{cfg.hint}</div>
        </div>
      </div>

      <div className="stack">
        {cfg.items.map((it, idx) => (
          <div key={it.id} ref={(el) => (cardRefs.current[idx] = el)}>
            <ExpressionMagnet
              expr={it.expr}
              clickable={it.clickable}
              isActive={idx === activeIndex}
              onSolved={() => {
                // последняя карточка -> снимаем активность
                if (idx >= cfg.items.length - 1) {
                  setActiveIndex(-1);
                  return;
                }

                const next = idx + 1;
                setActiveIndex(next);

                // ✅ автоскролл к следующей карточке после перерендера
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    cardRefs.current[next]?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  });
                });
              }}
            />
          </div>
        ))}
      </div>

      <FooterNav />
    </section>
  );
}