import React from "react";

export default function IconButton({
  icon,
  title,
  subtitle,
  onClick,
  disabled,
  type = "button",
}) {
  return (
    <button
      type={type}
      className="iconBtn"
      onClick={onClick}
      disabled={disabled}
    >
      {icon ? (
        <span className="iconBtn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}

      <span className="iconBtn__text">
        <span className="iconBtn__title">{title}</span>
        {subtitle ? <span className="iconBtn__subtitle">{subtitle}</span> : null}
      </span>
    </button>
  );
}
