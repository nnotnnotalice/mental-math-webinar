import React from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { GRADES, TOOLS } from "../data.js";
import IconButton from "../ui/IconButton.jsx";

export default function ScreenChooseTool() {
  const nav = useNavigate();
  const { grade } = useParams();

  // если вдруг зашли без grade — не даём строить кривые ссылки типа /task/undefined/...
  if (!grade) return <Navigate to="/grade" replace />;

  const gradeLabel = GRADES[grade]?.label ?? grade;
  const safeGrade = encodeURIComponent(grade);

  // ВАЖНО: убираем "chooser" из общего списка инструментов
  const tools = TOOLS.filter((t) => t.key !== "chooser");

  return (
  <section className="panel">
    <div className="taskHeader taskHeader--withBack">
    <button
  type="button"
  className="circleBackBtn"
  onClick={() => nav("/grade")}
>
  <svg
    className="circleBackBtn__icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
</button>

      <h1 className="h1">Выбери инструмент</h1>
    </div>

    {/* если хочешь, можешь показывать подпись класса */}
    {/* <div className="hint">{gradeLabel}</div> */}

    <div className="grid3">
      {tools.map((t) => {
        const path = `/task/${safeGrade}/${t.key}`;
        return (
          <IconButton
            key={t.key}
            icon={t.icon}
            title={t.label}
            onClick={() => nav(path)}
          />
        );
      })}

      <IconButton
        key="rescue"
        icon="💧"
        title="Спаси мастерскую"
        onClick={() => nav(`/task/${safeGrade}/rescue`)}
      />
    </div>

    {/* ⛔️ УДАЛЯЕМ старую кнопку */}
    {/* <div className="actions">
      <button className="linkBtn" type="button" onClick={() => nav("/grade")}>
        Назад
      </button>
    </div> */}
  </section>
);
}