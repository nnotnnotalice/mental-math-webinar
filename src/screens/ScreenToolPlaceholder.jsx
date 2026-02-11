import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import FooterNav from "../widgets/FooterNav.jsx";

const MAP = {
  magnet: { title: "Магнит", icon: "🧲" },
  scales: { title: "Весы", icon: "⚖️" },
  hammer: { title: "Молоток", icon: "🔨" },
  
};

export default function ScreenToolPlaceholder({ tool }) {
  const nav = useNavigate();
  const { grade } = useParams();
  const meta = MAP[tool] ?? { title: tool, icon: "🧰" };

  return (
    <section className="panel panel--task">
      <div className="taskHeader">
        <div>
          <div className="crumb">Инструмент: <b>{meta.title} {meta.icon}</b></div>
          <h1 className="h1">🚨 ЭТО ТОЧНО PLACEHOLDER 🚨</h1>
          <div className="hint">Пока заглушка. Мы добавим механику позже.</div>
        </div>

        <button className="linkBtn" type="button" onClick={() => nav(`/tools/${grade}`)}>
          ← Спаси мастерскую
        </button>
      </div>

      <FooterNav grade={grade} active={tool} />
    </section>
  );
}