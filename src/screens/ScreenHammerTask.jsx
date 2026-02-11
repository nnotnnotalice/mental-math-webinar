import React from "react";
import { useParams } from "react-router-dom";
import ExpressionHammer from "../widgets/ExpressionHammer.jsx";
import FooterNav from "../widgets/FooterNav.jsx";

export default function ScreenHammerTask() {
  const { grade } = useParams(); // "1-2" или "3-4"

  const cfg = React.useMemo(() => {
    if (grade === "1-2") {
      return {
        title: "🔨 Вычисли удобным способом",
        hint: "Нажми на выделенное число, чтобы довести другое до круглого",
        items: [
          {
            expr: { a: 18, op: "+", b: 7 },
            clickable: 7,
            expected: 25,
            options: [
              { id: "a1", x: 2, y: 5, correct: true },
              { id: "a2", x: 4, y: 3, correct: false },
              { id: "a3", x: 1, y: 6, correct: false }
            ]
          },
          {
            expr: { a: 21, op: "-", b: 6 },
            clickable: 6,
            expected: 15,
            options: [
              { id: "b1", x: 2, y: 4, correct: false },
              { id: "b2", x: 3, y: 3, correct: false },
              { id: "b3", x: 1, y: 5, correct: true }
            ]
          }
        ]
      };
    }

    // 3-4
    return {
      title: "🔨 Вычисли удобным способом",
      hint: "Нажми на выделенное число, чтобы довести другое до круглого",
      items: [
        {
          expr: { a: 143, op: "+", b: 8 },
          clickable: 8,
          expected: 151,
          options: [
  { id: "c1", x: 4, y: 4, correct: false },
  { id: "c2", x: 7, y: 1, correct: true },   // верный
  { id: "c3", x: 3, y: 5, correct: false }
]
        },
        {
          expr: { a: 245, op: "-", b: 7 },
          clickable: 7,
          expected: 238,
          options: [
  { id: "d1", x: 5, y: 2, correct: true }, // верный
  { id: "d2", x: 3, y: 4, correct: false },
  { id: "d3", x: 1, y: 6, correct: false }    
]
        }
      ]
    };
  }, [grade]);

  const [solved1, setSolved1] = React.useState(false);

  return (
  <section className="panel panel--task">
    <div className="taskHeader">
      <div>
        <div className="h1">{cfg.title}</div>
        <div className="hint">{cfg.hint}</div>
      </div>
    </div>

    <div className="stack">
      <ExpressionHammer
        expr={cfg.items[0].expr}
        clickable={cfg.items[0].clickable}
        options={cfg.items[0].options}
        expected={cfg.items[0].expected}
        isActive={true}
        onSolved={() => setSolved1(true)}
      />

      <ExpressionHammer
        expr={cfg.items[1].expr}
        clickable={cfg.items[1].clickable}
        options={cfg.items[1].options}
        expected={cfg.items[1].expected}
        isActive={solved1}
        onSolved={() => {}}
      />
    </div>

    <FooterNav />
  </section>
);
}