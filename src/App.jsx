import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ScreenChooseGrade from "./screens/ScreenChooseGrade.jsx";
import ScreenChooseTool from "./screens/ScreenChooseTool.jsx";
import ScreenWrenchTask from "./screens/ScreenWrenchTask.jsx";
import ScreenHammerTask from "./screens/ScreenHammerTask.jsx";
import ScreenMagnetTask from "./screens/ScreenMagnetTask.jsx";
import ScreenScalesTask from "./screens/ScreenScalesTask.jsx";
import ScreenToolPlaceholder from "./screens/ScreenToolPlaceholder.jsx";
import ScreenRescueWorkshop from "./screens/ScreenRescueWorkshop";

function AppShell() {
  const location = useLocation();

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // ✅ флаг платформы для CSS
    document.documentElement.classList.toggle("ios", isIOS);

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    // iOS: запоминаем "нормальную" высоту visualViewport (когда клавы нет)
    let baseVVH = vv.height;

    // последний сфокусированный инпут для автоскролла
    let pendingEl = null;

    const setVars = () => {
      // 1) vvh
      const vvh = Math.round(vv.height * 0.01 * 1000) / 1000;
      document.documentElement.style.setProperty("--vvh", `${vvh}px`);

      // 2) kb
      let kb = 0;

      if (isIOS) {
        // если клава закрыта — обновляем базу
        if (Math.abs(vv.height - baseVVH) < 20) {
          baseVVH = vv.height;
        }
        kb = Math.max(0, baseVVH - vv.height);

        // ✅ для iOS НЕ даём padding снизу от --kb (это и даёт белую полосу)
        document.documentElement.style.setProperty("--kb", `0px`);
      } else {
        kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        const kbRounded = Math.round(clamp(kb, 0, 700));
        document.documentElement.style.setProperty("--kb", `${kbRounded}px`);
      }

      // toggle kbd-open оставляем
      const open = kb > 80;
      document.documentElement.classList.toggle("kbd-open", open);

      // 3) AUTOSCROLL
      if (pendingEl && document.activeElement === pendingEl) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            pendingEl.scrollIntoView({
              behavior: isIOS ? "auto" : "smooth",
              block: "center",
              inline: "nearest",
            });
          });
        });
        pendingEl = null;
      }
    };

    setVars();

    const onFocusIn = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLElement)) return;
      if (!el.matches("input, textarea, [contenteditable='true']")) return;

      pendingEl = el;

      if (isIOS) {
        requestAnimationFrame(setVars);
        setTimeout(setVars, 60);
        setTimeout(setVars, 160);
      } else {
        requestAnimationFrame(setVars);
      }
    };

    const onFocusOut = () => {
      if (isIOS) {
        setTimeout(setVars, 80);
        setTimeout(setVars, 200);
      } else {
        requestAnimationFrame(setVars);
      }
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    vv.addEventListener("resize", setVars);
    vv.addEventListener("scroll", setVars);
    window.addEventListener("resize", setVars);
    window.addEventListener("orientationchange", setVars);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      vv.removeEventListener("resize", setVars);
      vv.removeEventListener("scroll", setVars);
      window.removeEventListener("resize", setVars);
      window.removeEventListener("orientationchange", setVars);

      document.documentElement.classList.remove("ios");
      document.documentElement.classList.remove("kbd-open");
      document.documentElement.style.removeProperty("--vvh");
      document.documentElement.style.removeProperty("--kb");
    };
  }, []);

  // ✅ ВКЛ/ВЫКЛ режим "footer после виджетов" только на iOS и только на task-экранах
  useEffect(() => {
    const isIOS = document.documentElement.classList.contains("ios");
    if (!isIOS) return;

    const path = location.pathname || "";
    const isWidgetScreen = path.startsWith("/task/"); // wrench/hammer/magnet/scales/rescue/placeholder

    document.documentElement.classList.toggle("widgets", isWidgetScreen);

    return () => {
      // на всякий, чтобы не "залипало"
      document.documentElement.classList.remove("widgets");
    };
  }, [location.pathname]);

  return (
    <>
      <div className="app">
        <header className="topbar">
          <div className="topbar__title">Считаю в уме</div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/grade" replace />} />
            <Route path="/grade" element={<ScreenChooseGrade />} />
            <Route path="/tools/:grade" element={<ScreenChooseTool />} />

            <Route path="/task/:grade/wrench" element={<ScreenWrenchTask />} />
            <Route path="/task/:grade/hammer" element={<ScreenHammerTask />} />
            <Route path="/task/:grade/magnet" element={<ScreenMagnetTask />} />
            <Route path="/task/:grade/scales" element={<ScreenScalesTask />} />
            <Route path="/task/:grade/rescue" element={<ScreenRescueWorkshop />} />

            <Route
              path="/task/:grade/saw"
              element={<ScreenToolPlaceholder tool="saw" />}
            />

            <Route path="*" element={<Navigate to="/grade" replace />} />
          </Routes>
        </main>
      </div>

      <div className="rotateGate" aria-live="polite">
        <div className="rotateGate__card">
          <div className="rotateGate__title">Поверни телефон вертикально</div>
          <div className="rotateGate__text">
            Задание работает только в портретной ориентации.
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return <AppShell />;
}