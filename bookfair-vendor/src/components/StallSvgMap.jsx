import React, { useMemo } from "react";

/////////////////// LAYOUT & MAP SIZE ///////////////////
const ROAD_THICKNESS = 48;
const EXTRA_LEFT     = ROAD_THICKNESS;
const EXTRA_BOTTOM   = ROAD_THICKNESS;

const VIEW_W = 1200 + EXTRA_LEFT;
const VIEW_H = 800  + EXTRA_BOTTOM;

/////////////////// MAP CONTENT /////////////////////////
const HALLS = {
  N: { x: 60, y: 30, w: 230, h: 110, r: 12, capacity: 8, label: "HALL N" },
  M: { x: 60, y: 150, w: 170, h: 120, r: 12, capacity: 6, label: "HALL M" },
  L: { x: 400, y: 30, w: 170, h: 120, r: 12, capacity: 6, label: "HALL L" },

  P: { x: 260, y: 220, w: 140, h: 105, r: 12, capacity: 5, label: "HALL P" },
  Q: { x: 420, y: 220, w: 140, h: 105, r: 12, capacity: 5, label: "HALL Q" },

  R: { x: 60, y: 465, w: 240, h: 120, r: 12, capacity: 8, label: "HALL R" },

  K: { x: 340, y: 360, w: 180, h: 240, r: 16, capacity: 10, label: "HALL K" },
  J: { x: 540, y: 360, w: 180, h: 240, r: 16, capacity: 10, label: "HALL J" },

  A: { x: 650, y: 60, w: 230, h: 230, r: 22, capacity: 24, label: "HALL A" },
  B: { x: 900, y: 60, w: 230, h: 230, r: 22, capacity: 24, label: "HALL B" },

  C: { x: 750, y: 400, w: 200, h: 270, r: 18, capacity: 12, label: "HALL C" },
  D: { x: 970, y: 400, w: 200, h: 270, r: 18, capacity: 12, label: "HALL D" },

  H: { x: 60, y: 600, w: 280, h: 170, r: 18, capacity: 20, label: "HALL H" },
};

const AMENITIES = [
  { x: 860, y: 320, w: 140, h: 44, label: "Public Toilet", kind: "TOILET" },
  { x: 950, y: 710, w: 220, h: 60, label: "Cafeteria", kind: "CAFE" },
];

const ENTRANCE       = { x: 470, y: 740, w: 230, h: 44, label: "Entrance" };
const ENTRANCE_LEFT  = { x: 0,   y: 345, w: 180, h: 44, label: "Entrance 2" };
const POND           = { cx: 210, cy: 370, rx: 70, ry: 30, label: "Pond" };

const COLORS = {
  AVAILABLE: "#22c55e",
  IN_PROGRESS: "#f59e0b",
  BOOKED: "#ef4444",
  MAP_BG: "#eef2f7",
  HALL_FILL: "#f8fafc",
  HALL_STROKE: "#94a3b8",
  STROKE: "#334155",
  SELECT_STROKE: "#78350f",
  ROAD: "#374151",
  LANE: "#e5e7eb",
};

const HALL_LABEL_SIZE = 20;
const TOP_LABEL_PAD   = 28;
const CELL_PAD        = 12;
const CELL_GAP        = 8;
const SIZE_TAG        = { SMALL: "S", MEDIUM: "M", LARGE: "L" };

function layoutCells(capacity) {
  const cols = Math.ceil(Math.sqrt(capacity));
  const rows = Math.ceil(capacity / cols);
  return { rows, cols };
}

function Hall({ box }) {
  return (
    <>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={box.r}
        ry={box.r}
        fill={COLORS.HALL_FILL}
        stroke={COLORS.HALL_STROKE}
        strokeWidth="3"
      />
      <text
        x={box.x + box.w / 2}
        y={box.y + 6}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={HALL_LABEL_SIZE}
        fontWeight="800"
        fill="#1f2937"
        stroke="#e2e8f0"
        strokeWidth="3"
        style={{ paintOrder: "stroke fill" }}
      >
        {box.label}
      </text>
    </>
  );
}

function Amenity({ a }) {
  const fill   = a.kind === "TOILET" ? "#bfdbfe" : "#fde68a";
  const stroke = a.kind === "TOILET" ? "#60a5fa" : "#f59e0b";
  return (
    <>
      <rect x={a.x} y={a.y} width={a.w} height={a.h} rx="10" ry="10" fill={fill} stroke={stroke} strokeWidth="2" />
      <text
        x={a.x + a.w / 2}
        y={a.y + a.h / 2 + 3}
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill="#1f2937"
      >
        {a.label}
      </text>
    </>
  );
}

function Entrance({ e }) {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const arrowX = e.x + e.w - 18;
  return (
    <g>
      <rect x={e.x} y={e.y} width={e.w} height={e.h} rx="12" ry="12" fill="#86efac" stroke="#16a34a" strokeWidth="3" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fontWeight="900"
        fill="#064e3b"
        pointerEvents="none"
      >
        ENTRANCE 1
      </text>
      <text
        x={arrowX}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fontWeight="900"
        fill="#065f46"
        pointerEvents="none"
      >
        ↑
      </text>
    </g>
  );
}

function EntranceSmallLeft({ e }) {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const arrowX = e.x + e.w - 16;
  return (
    <g transform={`rotate(90 ${cx} ${cy})`}>
      <rect x={e.x} y={e.y} width={e.w} height={e.h} rx="12" ry="12" fill="#bbf7d0" stroke="#16a34a" strokeWidth="3" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="900"
        fill="#064e3b"
        pointerEvents="none"
      >
        ENTRANCE 2
      </text>
      <text
        x={arrowX}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fontWeight="900"
        fill="#065f46"
        pointerEvents="none"
      >
        ↑
      </text>
    </g>
  );
}

function Pond({ p }) {
  return (
    <g>
      <defs>
        <radialGradient id="pondGrad" cx="50%" cy="40%" r="70%">
          <stop offset="0%"   stopColor="#93c5fd" stopOpacity="0.95" />
          <stop offset="70%"  stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="url(#pondGrad)" stroke="#1d4ed8" strokeWidth="2" opacity="0.95" />
      <ellipse cx={p.cx} cy={p.cy} rx={p.rx - 8}  ry={p.ry - 6}  fill="none" stroke="#eff6ff" strokeOpacity="0.5" />
      <ellipse cx={p.cx} cy={p.cy} rx={p.rx - 16} ry={p.ry - 12} fill="none" stroke="#eff6ff" strokeOpacity="0.35" />
      <text x={p.cx} y={p.cy + p.ry + 16} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1f2937">
        {p.label}
      </text>
    </g>
  );
}

/////////////////// TICKET COUNTER (narrower) ///////////////////
function TicketCounter({ x, y, w = 96, h = 44, label = "Ticket Counter" }) {
  const awningH   = Math.min(16, Math.max(12, Math.floor(h * 0.28)));
  const windowPad = 8;
  const winX      = x + windowPad;
  const winY      = y + awningH + 6;
  const winW      = w - windowPad * 2;
  const winH      = h - awningH - 12;
  const labelFont = Math.max(8, Math.min(10, Math.floor(w / 11)));

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" ry="8" fill="#fff7ed" stroke="#ea580c" strokeWidth="2" />
      <rect x={x} y={y} width={w} height={awningH} fill="#fdba74" />
      {Array.from({ length: Math.ceil(w / 8) }).map((_, i) => (
        <rect key={i} x={x + i * 8} y={y} width={4} height={awningH} fill="#fb923c" />
      ))}
      <rect x={winX} y={winY} width={winW} height={winH} rx="4" ry="4" fill="#e5e7eb" stroke="#94a3b8" />
      <text
        x={x + w / 2}
        y={y + awningH / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={labelFont}
        fontWeight="900"
        fill="#1f2937"
      >
        {label}
      </text>
    </g>
  );
}

/////////////////// OUTER ROADS (FULL EDGE, OUTSIDE) ///////////////////
function Roads() {
  const left = { x: 0, y: 0, w: 48, h: VIEW_H, name: "MALALASEKARA MAWATHA" };
  const bottom = { x: 0, y: VIEW_H - 48, w: VIEW_W, h: 48, name: "BAUDDHALOKA MAWATHA" };

  const leftCenter   = { x: left.x + left.w / 2, y: left.y + left.h / 2 };
  const bottomCenter = { x: bottom.x + bottom.w / 2, y: bottom.y + bottom.h / 2 };

  return (
    <g>
      <g>
        <rect x={left.x} y={left.y} width={left.w} height={left.h} fill={COLORS.ROAD} />
        <line
          x1={leftCenter.x}
          y1={left.y + 12}
          x2={leftCenter.x}
          y2={left.y + left.h - 12}
          stroke={COLORS.LANE}
          strokeWidth="2"
          strokeDasharray="10 8"
          strokeOpacity="0.9"
        />
        <text
          x={leftCenter.x}
          y={leftCenter.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="900"
          fill="#f9fafb"
          stroke="#111827"
          strokeWidth="2"
          transform={`rotate(-90 ${leftCenter.x} ${leftCenter.y})`}
          style={{ paintOrder: "stroke fill" }}
        >
          {left.name}
        </text>
      </g>

      <g>
        <rect x={bottom.x} y={bottom.y} width={bottom.w} height={bottom.h} fill={COLORS.ROAD} />
        <line
          x1={bottom.x + 12}
          y1={bottom.y + bottom.h / 2}
          x2={bottom.x + bottom.w - 12}
          y2={bottom.y + bottom.h / 2}
          stroke={COLORS.LANE}
          strokeWidth="2"
          strokeDasharray="10 8"
          strokeOpacity="0.9"
        />
        <text
          x={bottomCenter.x}
          y={bottomCenter.y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="900"
          fill="#f9fafb"
          stroke="#111827"
          strokeWidth="2"
          style={{ paintOrder: "stroke fill" }}
        >
          {bottom.name}
        </text>
      </g>
    </g>
  );
}

/////////////////// MAIN ///////////////////
export default function StallSvgMap({ stalls, selectedIds, onToggle }) {
  const positions = useMemo(() => {
    const out = [];
    const counters = {};
    Object.entries(HALLS).forEach(([hallKey, b]) => {
      const { rows, cols } = layoutCells(b.capacity);
      const innerW = b.w - CELL_PAD * 2 - CELL_GAP * (cols - 1);
      const innerH = b.h - (TOP_LABEL_PAD + CELL_PAD) - CELL_GAP * (rows - 1);
      const cellW  = innerW / cols;
      const cellH  = innerH / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nextIndex = (counters[hallKey] || 0) + 1;
          if (nextIndex > b.capacity) break;
          counters[hallKey] = nextIndex;

          const x = b.x + CELL_PAD + c * (cellW + CELL_GAP);
          const y = b.y + TOP_LABEL_PAD + r * (cellH + CELL_GAP);
          out.push({ hall: hallKey, idxInHall: nextIndex, x, y, w: cellW, h: cellH });
        }
      }
    });
    return out.slice(0, 150);
  }, []);

  const sizeLabels = useMemo(() => {
    const c = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
    return stalls.slice(0, 150).map((s) => {
      c[s.size] = (c[s.size] || 0) + 1;
      const tag = SIZE_TAG[s.size] ?? "?";
      return `${tag}-${c[s.size]}`;
    });
  }, [stalls]);

  // === Ticket counters ===
  // Entrance 1: above & left side of the entrance bar
  const T1_W = 100, T1_H = 44;
  const TICKET1 = {
    x: ENTRANCE.x + 12,
    y: ENTRANCE.y - (T1_H + 12),
    w: T1_W,
    h: T1_H,
    label: "Ticket Counter",
  };

  // Entrance 2: keep X near the entrance, set Y just ABOVE the pond
  const cx2 = ENTRANCE_LEFT.x + ENTRANCE_LEFT.w / 2;
  const cy2 = ENTRANCE_LEFT.y + ENTRANCE_LEFT.h / 2;
  const T2_W = 92, T2_H = 42;
  const pondTop = POND.cy - POND.ry;            // top edge of the pond
  const GAP_ABOVE_POND = 10;                    // small gap
  const TICKET2 = {
    x: cx2 + 30,                                // (X unchanged)
    y: pondTop - T2_H - GAP_ABOVE_POND,         // <<< moved above the pond
    w: T2_W,
    h: T2_H,
    label: "Ticket Counter",
  };

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        role="img"
        aria-label="Bookfair halls with stalls"
        style={{ display: "block", height: "auto", background: COLORS.MAP_BG, borderRadius: 12 }}
      >
        <Roads />

        <g transform={`translate(${EXTRA_LEFT}, 0)`}>
          <rect x="16" y="16" width={1200 - 32} height={800 - 32} fill="none" stroke="#cbd5e1" strokeWidth="2" rx="14" />

          <Pond p={POND} />

          {Object.values(HALLS).map((b, i) => <Hall key={i} box={b} />)}

          {AMENITIES.map((a, i) => <Amenity key={i} a={a} />)}

          <TicketCounter {...TICKET1} />
          <TicketCounter {...TICKET2} />

          <Entrance e={ENTRANCE} />
          <EntranceSmallLeft e={ENTRANCE_LEFT} />

          {stalls.slice(0, 150).map((stall, i) => {
            const p = positions[i];
            if (!p) return null;

            const isBooked   = stall.status === "BOOKED";
            const isSelected = selectedIds.has(stall.id);
            const fill = isBooked ? COLORS.BOOKED : (isSelected ? COLORS.IN_PROGRESS : COLORS.AVAILABLE);

            const codeTop = sizeLabels[i];

            return (
              <g key={stall.id} onClick={() => !isBooked && onToggle(stall, codeTop)} style={{ cursor: isBooked ? "not-allowed" : "pointer" }}>
                <rect
                  x={p.x} y={p.y} width={p.w} height={p.h}
                  rx={6} ry={6}
                  fill={fill}
                  stroke={isSelected ? COLORS.SELECT_STROKE : COLORS.STROKE}
                  strokeWidth={isSelected ? 3 : 1.5}
                  opacity={isBooked ? 0.85 : 1}
                />
                <text
                  x={p.x + p.w / 2}
                  y={p.y + 3}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                  fontSize="11"
                  fontWeight="800"
                  fill="#ffffff"
                  pointerEvents="none"
                >
                  {codeTop}
                </text>
                <title>{`${codeTop} — ${stall.size} — ${isBooked ? "Booked" : isSelected ? "In progress" : "Available"}`}</title>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
