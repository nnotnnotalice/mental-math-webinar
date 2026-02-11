import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export default function FooterNav() {
  const nav = useNavigate();
  const { grade } = useParams();
  const location = useLocation();

  // если HashRouter — берём путь из hash
  const rawPath =
    location.pathname === "/" && location.hash
      ? location.hash.replace("#", "")
      : location.pathname;

  const parts = rawPath.split("/").filter(Boolean);
  const currentTool = parts[0] === "task" ? (parts[2] || "") : "";
  const isRescue = currentTool === "rescue";

  console.log("rawPath:", rawPath);
  console.log("location:", location);
  console.log("full href:", window.location.href);

  const tools = [
    { key: "wrench", label: "Ключ", icon: "🔧" },
    { key: "magnet", label: "Магнит", icon: "🧲" },
    { key: "scales", label: "Весы", icon: "⚖️" },
    { key: "hammer", label: "Молоток", icon: "🔨" },
  ];

  const visibleTools = tools.filter((t) => t.key !== currentTool);

  function goToTool(toolKey) {
    if (!grade) return nav("/grade");
    nav(`/task/${grade}/${toolKey}`);
  }

  return (
    <nav className="footerNav" aria-label="Инструменты">
      {visibleTools.map((t) => (
        <button
          key={t.key}
          type="button"
          className="footerBtn"
          onClick={() => goToTool(t.key)}
        >
          <span className="footerBtn__icon" aria-hidden="true">{t.icon}</span>
          <span className="footerBtn__text">{t.label}</span>
        </button>
      ))}

      {!isRescue && (
  <button
    type="button"
    className="footerBtn"
    onClick={() => {
      if (!grade) return nav("/grade");
      nav(`/task/${grade}/rescue`);
    }}
  >
    <span className="footerBtn__icon" aria-hidden="true">💧</span>
    <span className="footerBtn__text">Спаси мастерскую</span>
  </button>
)}

      <button type="button" className="footerBtn" onClick={() => nav("/grade")}>
        <span className="footerBtn__icon" aria-hidden="true">🎓</span>
        <span className="footerBtn__text">Выбрать класс</span>
      </button>
    </nav>
  );
}