import React from "react";
import { useNavigate } from "react-router-dom";

export default function ScreenChooseGrade() {
  const nav = useNavigate();

  return (
    <section className="panel">
      <h1 className="h1">Выбери свой класс</h1>

      <div className="gradeGrid">
        <button
          className="gradeBtn"
          onClick={() => nav("/tools/1-2")}
        >
          1 – 2
        </button>

        <button
          className="gradeBtn"
          onClick={() => nav("/tools/3-4")}
        >
          3 – 4
        </button>
      </div>
    </section>
  );
}