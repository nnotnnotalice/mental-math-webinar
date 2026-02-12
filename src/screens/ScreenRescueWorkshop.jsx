import React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";

import ExpressionDnd from "../widgets/ExpressionDnd";
import ExpressionHammer from "../widgets/ExpressionHammer";
import ExpressionMagnet from "../widgets/ExpressionMagnet";
import ExpressionScales from "../widgets/ExpressionScales";
import IconButton from "../ui/IconButton.jsx";

const TOOL_META = {
  wrench: { icon: "🔧", title: "Ключ" },
  hammer: { icon: "🔨", title: "Молоток" },
  magnet: { icon: "🧲", title: "Магнит" },
  scales: { icon: "⚖️", title: "Весы" },
};

function formatSolvedLine(task, toolKey) {
  const minus = "−";

  if (toolKey === "wrench" && task.wrench) {
    const arr = task.wrench.accepted?.[0] || task.wrench.initial || [];
    return `${arr.join(" + ")} = ${task.wrench.answer}`;
  }

  if (toolKey === "hammer" && task.hammer) {
    const { a, op, b } = task.hammer.expr;
    const sign = op === "–" ? minus : op;

    const correct =
      task.hammer.options?.find((o) => o.correct) || task.hammer.options?.[0];

    if (!correct) return `${a} ${sign} ${b} = ${task.hammer.expected}`;
    return `${a} ${sign} ${correct.x} ${sign} ${correct.y} = ${task.hammer.expected}`;
  }

  if (toolKey === "magnet" && task.magnet) {
    const [a, opRaw, b] = task.magnet.expr;
    const donor = task.magnet.clickable;
    const receiver = donor === a ? b : a;

    if (opRaw === "+") {
      const donorMinus = donor - 1;
      const receiverPlus = receiver + 1;
      const total = a + b;
      return `${receiverPlus} + ${donorMinus} = ${total}`;
    }

    const op = opRaw === "–" ? minus : opRaw;
    const total = opRaw === "–" ? a - b : a + b;
    return `${a} ${op} ${b} = ${total}`;
  }

  if (toolKey === "scales" && task.scales) {
    const { a, b } = task.scales;
    const total = a - b;
    return `${a + 1} ${minus} ${b + 1} = ${total}`;
  }

  return "";
}

export default function ScreenRescueWorkshop() {
  const { grade } = useParams();
  const navigate = useNavigate();

  if (!grade) return <Navigate to="/grade" replace />;

  const tasks = grade === "1-2" ? TASKS_12 : TASKS_34;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [chosenByIdx, setChosenByIdx] = React.useState({});
  const [badPickByIdx, setBadPickByIdx] = React.useState({});
  const [solvedByIdx, setSolvedByIdx] = React.useState({});

  const panelRef = React.useRef(null);
  const headerRef = React.useRef(null);
  const missionRefs = React.useRef([]);

  const [headerH, setHeaderH] = React.useState(0);

  React.useLayoutEffect(() => {
    const measure = () => {
      const h = headerRef.current?.getBoundingClientRect().height ?? 0;
      setHeaderH(Math.ceil(h));
    };
    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  function goBack() {
    navigate(`/tools/${encodeURIComponent(grade)}`);
  }

  function chooseTool(idx, toolKey, task) {
    const hasCfg =
      (toolKey === "wrench" && !!task.wrench) ||
      (toolKey === "hammer" && !!task.hammer) ||
      (toolKey === "magnet" && !!task.magnet) ||
      (toolKey === "scales" && !!task.scales);

    if (!hasCfg) {
      setBadPickByIdx((prev) => ({ ...prev, [idx]: toolKey }));
      return;
    }

    setBadPickByIdx((prev) => ({ ...prev, [idx]: null }));
    setChosenByIdx((prev) => ({ ...prev, [idx]: toolKey }));
  }

  function handleSolved(idx) {
    const task = tasks[idx];
    const toolKey = chosenByIdx[idx];
    const line = formatSolvedLine(task, toolKey);

    setSolvedByIdx((prev) => ({
      ...prev,
      [idx]: { toolKey, line },
    }));

    setActiveIndex((cur) => (idx === cur ? cur + 1 : cur));
  }

  const visibleTasks =
    activeIndex >= tasks.length ? tasks : tasks.slice(0, activeIndex + 1);

  // -----------------------------
  // Scroll helpers (ONLY inside .content)
  // -----------------------------
  const getScroller = () => document.querySelector(".content");

  const scrollByInsideContent = React.useCallback((delta) => {
    const scroller = getScroller();
    if (!scroller) return;
    scroller.scrollTo({
      top: scroller.scrollTop + delta,
      behavior: "smooth",
    });
  }, []);

  // докрутка вниз, чтобы элемент полностью влез по низу (меню/выпадашка)
  const ensureFullyVisibleAtBottom = React.useCallback(
    (el) => {
      if (!el) return;

      const vv = window.visualViewport;
      const viewH = vv?.height ?? window.innerHeight;

      const footer = document.querySelector(".footerNav");
      const footerTop = footer?.getBoundingClientRect().top ?? viewH;
      const usableBottom = Math.min(viewH, footerTop);

      const r = el.getBoundingClientRect();
      const padding = 12;

      const overflowBottom = r.bottom - usableBottom + padding;
      if (overflowBottom > 0) scrollByInsideContent(overflowBottom);
    },
    [scrollByInsideContent]
  );

  // переход к следующей миссии: просто scrollIntoView,
  // а “чтобы не под шапку” решаем scroll-margin-top (см. ниже)
  React.useEffect(() => {
    const nextEl = missionRefs.current[activeIndex];
    if (!nextEl) return;

    const t = setTimeout(() => {
      nextEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => clearTimeout(t);
  }, [activeIndex]);

  // следим за появлением pickMenu (молоток) и докручиваем ТОЛЬКО ВНИЗ
  React.useEffect(() => {
    const root = panelRef.current;
    if (!root) return;

    const mo = new MutationObserver(() => {
      const menu = root.querySelector(".pickMenu");
      if (menu) ensureFullyVisibleAtBottom(menu);
    });

    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [ensureFullyVisibleAtBottom]);

  return (
    <section ref={panelRef} className="panel panel--task rescueWorkshop">
      {/* HEADER — sticky, чтобы назад не пропадал */}
      <div
        ref={headerRef}
        className="taskHeader taskHeader--withBack"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fff",
          paddingTop: 6,
          paddingBottom: 6,
          borderBottom: "1px solid rgba(229,231,235,0.9)",
        }}
      >
        <button type="button" className="circleBackBtn" onClick={goBack}>
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

        <div className="h1">Выбери инструмент, чтобы решить выражение</div>
      </div>

      {/* BODY */}
      <div className="rescueBody">
        <div className="stack">
          {visibleTasks.map((task, idx) => {
            const isCurrent = idx === activeIndex;

            const chosenTool = chosenByIdx[idx] ?? null;
            const badPick = badPickByIdx[idx] ?? null;
            const solvedInfo = solvedByIdx[idx] ?? null;

            const isWorking = isCurrent && !!chosenTool && !solvedInfo;
            const isPast = idx < activeIndex;

            const offered = task.offeredTools || [];
            const wrenchCfg = task.wrench || null;
            const hammerCfg = task.hammer || null;
            const magnetCfg = task.magnet || null;
            const scalesCfg = task.scales || null;

            return (
              <div
                key={task.id || idx}
                ref={(el) => (missionRefs.current[idx] = el)}
                className={
                  "rescueMission " + (isPast ? "rescueMission--done" : "")
                }
                // ✅ ВОТ ЭТО КЛЮЧ: чтобы выражение не уезжало под sticky header
                style={{ scrollMarginTop: headerH + 12 }}
              >
                {/* ✅ РЕЗУЛЬТАТ */}
                {solvedInfo ? (
                  <div className="rescueSolvedBlock">
                    <div className="rescueSolvedCheck" aria-hidden="true">
                      ✓
                    </div>

                    <div className="rescueSolvedContent">
                      <div className="rescueExpression rescueExpression--done">
                        {task.label} ={" "}
                        {String(solvedInfo.line).split("=").pop().trim()}
                      </div>
                      <div className="rescueSolvedText">{solvedInfo.line}</div>
                    </div>
                  </div>
                ) : null}

                {/* ВЫБОР ИНСТРУМЕНТА */}
                {!solvedInfo && !isWorking ? (
                  <>
                    <div className="rescueExpression">{task.label}</div>

                    {isCurrent ? (
                      <div
                        className="grid3"
                        style={{ marginTop: 8, marginBottom: 16 }}
                      >
                        {offered.includes("wrench") ? (
                          <div>
                            <IconButton
                              icon={TOOL_META.wrench.icon}
                              title={TOOL_META.wrench.title}
                              onClick={() => chooseTool(idx, "wrench", task)}
                            />
                            {badPick === "wrench" ? (
                              <div className="toolHint">
                                Этот инструмент не подходит
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {offered.includes("hammer") ? (
                          <div>
                            <IconButton
                              icon={TOOL_META.hammer.icon}
                              title={TOOL_META.hammer.title}
                              onClick={() => chooseTool(idx, "hammer", task)}
                            />
                            {badPick === "hammer" ? (
                              <div className="toolHint">
                                Этот инструмент не подходит
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {offered.includes("magnet") ? (
                          <div>
                            <IconButton
                              icon={TOOL_META.magnet.icon}
                              title={TOOL_META.magnet.title}
                              onClick={() => chooseTool(idx, "magnet", task)}
                            />
                            {badPick === "magnet" ? (
                              <div className="toolHint">
                                Этот инструмент не подходит
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {offered.includes("scales") ? (
                          <div>
                            <IconButton
                              icon={TOOL_META.scales.icon}
                              title={TOOL_META.scales.title}
                              onClick={() => chooseTool(idx, "scales", task)}
                            />
                            {badPick === "scales" ? (
                              <div className="toolHint">
                                Этот инструмент не подходит
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : null}

                {/* МЕХАНИКА */}
                {isWorking ? (
                  <div className="stack" style={{ marginTop: 0 }}>
                    {chosenTool === "wrench" && wrenchCfg ? (
                      <ExpressionDnd
                        key={`${task.id}-wrench`}
                        {...wrenchCfg}
                        isActive={isCurrent}
                        onSolved={() => handleSolved(idx)}
                        enter={isCurrent}
                      />
                    ) : null}

                    {chosenTool === "hammer" && hammerCfg ? (
                      <ExpressionHammer
                        key={`${task.id}-hammer`}
                        {...hammerCfg}
                        label={hammerCfg?.label}
                        showLabel
                        isActive={isCurrent}
                        onSolved={() => handleSolved(idx)}
                      />
                    ) : null}

                    {chosenTool === "magnet" && magnetCfg ? (
                      <ExpressionMagnet
                        key={`${task.id}-magnet`}
                        label={magnetCfg?.label}
                        {...magnetCfg}
                        isActive={isCurrent}
                        onSolved={() => handleSolved(idx)}
                      />
                    ) : null}

                    {chosenTool === "scales" && scalesCfg ? (
                      <ExpressionScales
                        key={`${task.id}-scales`}
                        label={scalesCfg?.label}
                        {...scalesCfg}
                        isActive={isCurrent}
                        onSolved={() => handleSolved(idx)}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================
   ДАННЫЕ МИССИЙ (3 на класс)
   ========================= */

const TASKS_12 = [
  {
    id: "r12-1",
    label: "8 + 9 + 2",
    offeredTools: ["wrench", "hammer", "magnet"],
    wrench: {
      label: "🔧 Перемести выделенное число, чтобы получить круглое",
      initial: [8, 9, 2],
      movable: 2,
      accepted: [
        [8, 2, 9],
        [2, 8, 9],
      ],
      answer: 19,
    },
  },
  {
    id: "r12-2",
    label: "19 + 3",
    offeredTools: ["hammer", "magnet"],
    hammer: {
      label: "🔨 Нажми на выделенное число, чтобы довести другое до круглого",
      expr: { a: 19, op: "+", b: 3 },
      clickable: 3,
      expected: 22,
      options: [
        { id: "h1", x: 1, y: 2, correct: true },
        { id: "h2", x: 2, y: 1, correct: false },
      ],
    },
    magnet: {
      label: "🧲 Забери единицу у одного числа и добавь к другому. Вычисли",
      expr: [19, "+", 3],
      clickable: 3,
    },
  },
  {
    id: "r12-3",
    label: "13 − 9",
    offeredTools: ["scales", "hammer", "wrench"],
    scales: {
      label: "⚖️ Запиши новое выражение. Вычисли",
      a: 13,
      b: 9,
    },
    hammer: {
      label: "🔨 Нажми на выделенное число, чтобы довести другое до круглого",
      expr: { a: 13, op: "–", b: 9 },
      clickable: 9,
      expected: 4,
      options: [
        { id: "h1", x: 3, y: 6, correct: true },
        { id: "h2", x: 1, y: 8, correct: false },
        { id: "h3", x: 4, y: 5, correct: false },
      ],
    },
  },
];

const TASKS_34 = [
  {
    id: "r34-1",
    label: "43 + 25 + 17",
    offeredTools: ["wrench", "hammer", "magnet"],
    wrench: {
      label: "🔧 Перемести выделенное число, чтобы получить круглое",
      initial: [43, 25, 17],
      movable: 17,
      accepted: [
        [43, 17, 25],
        [17, 43, 25],
      ],
      answer: 85,
    },
  },
  {
    id: "r34-2",
    label: "69 + 5",
    offeredTools: ["hammer", "magnet"],
    hammer: {
      label: "🔨 Нажми на выделенное число, чтобы довести другое до круглого",
      expr: { a: 69, op: "+", b: 5 },
      clickable: 5,
      expected: 74,
      options: [
        { id: "h1", x: 1, y: 4, correct: true },
        { id: "h2", x: 2, y: 3, correct: false },
        { id: "h3", x: 5, y: 0, correct: false },
      ],
    },
    magnet: {
      label: "🧲 Забери единицу у одного числа и добавь к другому. Вычисли",
      expr: [69, "+", 5],
      clickable: 5,
    },
  },
  {
    id: "r34-3",
    label: "285 − 29",
    offeredTools: ["scales", "wrench"],
    scales: {
      label: "⚖️ Запиши новое выражение. Вычисли",
      a: 285,
      b: 29,
    },
  },
];