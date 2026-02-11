import React from "react";
import Scales from "../components/Scales.jsx";

function toNum(v) {
  const n = Number(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

// 0: b' (b+1)
// 1: a' (a+1)
// 2: result (a' - b')
// 3: solved
export default function ExpressionScales({ label, a, b, isActive, onSolved }) {
  const [vals, setVals] = React.useState(["", "", ""]);
  const [ok, setOk] = React.useState([false, false, false]);
  const [solved, setSolved] = React.useState(false);

  const refs = React.useRef([]);
const wrapRef = React.useRef(null);
const [unitToPx, setUnitToPx] = React.useState(1);

// viewBox высота у твоего SVG = 283 (см. Scales.jsx viewBox="0 0 584 283")
const VIEWBOX_H = 268;

React.useLayoutEffect(() => {
  function measure() {
    const svg = wrapRef.current?.querySelector?.("svg");
    if (!svg) return;
    const h = svg.getBoundingClientRect().height;
    if (h > 0) setUnitToPx(h / VIEWBOX_H);
  }

  measure();
  window.addEventListener("resize", measure);
  return () => window.removeEventListener("resize", measure);
}, []);
  const interactive = isActive && !solved;

  const expectedB = React.useMemo(() => b + 1, [b]);
  const expectedA = React.useMemo(() => a + 1, [a]);
  const expected = React.useMemo(() => expectedA - expectedB, [expectedA, expectedB]);

  const activeStep = ok[0] ? (ok[1] ? 2 : 1) : 0;

  function resetAll() {
    setVals(["", "", ""]);
    setOk([false, false, false]);
    setSolved(false);
  }

  React.useEffect(() => {
    if (!isActive) return;
    resetAll();
    requestAnimationFrame(() => refs.current[0]?.focus?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, a, b]);

  function focusIndex(i) {
    requestAnimationFrame(() => {
      refs.current[i]?.focus?.();
      refs.current[i]?.select?.();
    });
  }

  function expectedForIndex(i) {
    if (i === 0) return expectedB;
    if (i === 1) return expectedA;
    return expected;
  }

  function validateIndex(i, raw) {
    const n = toNum(raw);
    const exp = expectedForIndex(i);
    return n !== null && n === exp;
  }

  function onChangeIndex(i, raw) {
    if (!interactive) return;

    const v = String(raw).replace(/[^\d-]/g, "");

    const nextVals = [...vals];
    nextVals[i] = v;
    setVals(nextVals);

    const isCorrect = validateIndex(i, v);

    const nextOk = [...ok];
    nextOk[i] = isCorrect;
    setOk(nextOk);

    if (isCorrect) {
      if (i < 2) focusIndex(i + 1);
      else {
        setSolved(true);
        if (typeof onSolved === "function") onSolved();
      }
    }
  }

  function onKeyDownIndex(i, e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!interactive) return;

    if (ok[i]) {
      if (i < 2) focusIndex(i + 1);
      return;
    }

    const isCorrect = validateIndex(i, vals[i]);
    const nextOk = [...ok];
    nextOk[i] = isCorrect;
    setOk(nextOk);

    if (isCorrect) {
      if (i < 2) focusIndex(i + 1);
      else {
        setSolved(true);
        if (typeof onSolved === "function") onSolved();
      }
    }
  }

  const bowlLevel = solved
    ? "BALANCED"
    : activeStep === 0
    ? "LOW"
    : activeStep === 1
    ? "MID"
    : "HIGH";

    // ExpressionScales.jsx

const shiftUnitsMap = {
  LOW: 30,
  MID: 26,
  HIGH: 15,
  BALANCED: 0,
};

const rightShiftUnits = shiftUnitsMap[bowlLevel] ?? 0;
const rightShiftPx = rightShiftUnits * unitToPx;

  const hlB = interactive && !solved && activeStep === 0;
  const hlA = interactive && !solved && activeStep === 1;
  const hlRes = (interactive && !solved && activeStep === 2) || solved;

  const cardClass =
    "exprCard scalesCard " +
    (isActive && !solved ? "exprCard--active" : "") +
    (!isActive ? " exprCard--inactive" : "") +
    (solved ? " exprCard--withMark" : "");

  return (
  <div className={cardClass}>
    {label ? <div className="exprLabel">{label}</div> : null}

    {solved ? (
      <div className="exprSolvedMark" aria-hidden="true">
        ✓
      </div>
    ) : null}

      <div ref={wrapRef} className="scalesWrap" role="group" aria-label="Весы">
  <Scales bowlLevel={bowlLevel} />

       <div
  className="scalesOverlay"
  data-level={bowlLevel}
style={{ "--rightShift": `${rightShiftPx}px` }}
>
    
          {/* ЛЕВАЯ ЧАША */}
          <div className="overlayLeft overlayLeft--row">
            <span className={"cupChip " + (hlA ? "cupChip--hl" : "")}>{a}</span>
            <span className="chipOp"> − </span>
            <span className={"cupChip " + (hlB ? "cupChip--hl" : "")}>{b}</span>
            <span className="chipOp"> = </span>
            <span
              className={
                "cupChip cupChip--result " +
                (hlRes ? "cupChip--hl" : "") +
                (solved ? "" : "cupChip--ghost")
              }
            >
              {solved ? expected : " "}
            </span>
          </div>

          {/* ПРАВАЯ ЧАША */}
          <div className="overlayRight">
            {activeStep === 0 ? <div className="hint hint--b">{b} + 1</div> : null}
            {activeStep === 1 ? <div className="hint hint--a">{a} + 1</div> : null}

            <div className="rightExprRow">
              {/* a' */}
              <input
                ref={(el) => (refs.current[1] = el)}
                className={"cupInput " + (ok[1] ? "magnetInput--ok " : "")}
                inputMode="numeric"
                 placeholder="?"
                value={vals[1]}
                onChange={(e) => onChangeIndex(1, e.target.value)}
                onKeyDown={(e) => onKeyDownIndex(1, e)}
                disabled={!(interactive && activeStep === 1) || ok[1]}
              />

              <span className="chipOp"> − </span>

              {/* b' */}
              <input
                ref={(el) => (refs.current[0] = el)}
                className={"cupInput " + (ok[0] ? "magnetInput--ok " : "")}
                inputMode="numeric"
                 placeholder="?"
                value={vals[0]}
                onChange={(e) => onChangeIndex(0, e.target.value)}
                onKeyDown={(e) => onKeyDownIndex(0, e)}
                disabled={!(interactive && activeStep === 0) || ok[0]}
              />

              <span className="chipOp"> = </span>

              {/* result */}
              <input
                ref={(el) => (refs.current[2] = el)}
                className={"cupInput cupInput--result " + (ok[2] ? "magnetInput--ok " : "")}
                inputMode="numeric"
                 placeholder="?"
                value={vals[2]}
                onChange={(e) => onChangeIndex(2, e.target.value)}
                onKeyDown={(e) => onKeyDownIndex(2, e)}
                disabled={!(interactive && activeStep === 2) || ok[2]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}