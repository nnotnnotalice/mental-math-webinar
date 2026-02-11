import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ScreenChooseGrade from "./screens/ScreenChooseGrade.jsx";
import ScreenChooseTool from "./screens/ScreenChooseTool.jsx";
import ScreenWrenchTask from "./screens/ScreenWrenchTask.jsx";
import ScreenHammerTask from "./screens/ScreenHammerTask.jsx";
import ScreenMagnetTask from "./screens/ScreenMagnetTask.jsx";
import ScreenScalesTask from "./screens/ScreenScalesTask.jsx";
import ScreenToolPlaceholder from "./screens/ScreenToolPlaceholder.jsx";
import Scales from "./components/Scales";
import ScreenRescueWorkshop from "./screens/ScreenRescueWorkshop";

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__title">Считаю в уме</div>
      </header>

      <main className="content">

        <Routes>
          <Route path="/" element={<Navigate to="/grade" replace />} />
          <Route path="/grade" element={<ScreenChooseGrade />} />
          <Route path="/tools/:grade" element={<ScreenChooseTool />} />

          {/* Задания */}
          <Route path="/task/:grade/wrench" element={<ScreenWrenchTask />} />
          <Route path="/task/:grade/hammer" element={<ScreenHammerTask />} />
          <Route path="/task/:grade/magnet" element={<ScreenMagnetTask />} />
          <Route path="/task/:grade/scales" element={<ScreenScalesTask />} />
          <Route path="/task/:grade/rescue" element={<ScreenRescueWorkshop />} />

          {/* Заглушки */}
          <Route
            path="/task/:grade/saw"
            element={<ScreenToolPlaceholder tool="saw" />}
          />

          {/* всегда последним */}
          <Route path="*" element={<Navigate to="/grade" replace />} />
        </Routes>
      </main>
    </div>
  );
}