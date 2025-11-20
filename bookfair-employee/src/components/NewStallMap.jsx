import React, { useMemo } from "react";

/////////////////// LAYOUT & MAP SIZE ///////////////////
const ROAD_THICKNESS = 48;
const EXTRA_LEFT = ROAD_THICKNESS; // make space for left road
const EXTRA_BOTTOM = ROAD_THICKNESS; // make space for bottom road

const VIEW_W = 1200 + EXTRA_LEFT;
const VIEW_H = 800 + EXTRA_BOTTOM;

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
  B: { x: 930, y: 120, w: 230, h: 230, r: 22, capacity: 24, label: "HALL B" },

  C: { x: 750, y: 410, w: 200, h: 270, r: 18, capacity: 12, label: "HALL C" },
  D: { x: 970, y: 410, w: 200, h: 270, r: 18, capacity: 12, label: "HALL D" },

  H: { x: 60, y: 600, w: 280, h: 180, r: 18, capacity: 20, label: "HALL H" },
};

const AMENITIES = [
  { x: 760, y: 340, w: 140, h: 44, label: "Public Toilet", kind: "TOILET" },
  { x: 950, y: 710, w: 220, h: 60, label: "Cafeteria", kind: "CAFE" },
];

const ENTRANCE = { x: 470, y: 740, w: 230, h: 44, label: "Entrance" };
const ENTRANCE_LEFT = { x: 0, y: 345, w: 180, h: 44, label: "Entrance 2" };
const POND = { cx: 210, cy: 370, rx: 70, ry: 30, label: "Pond" };

const COLORS = {
  AVAILABLE: "#22c55e",
  REQUESTED: "#f59e0b",
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
const TOP_LABEL_PAD = 28;
const CELL_PAD = 12;
const CELL_GAP = 8;

// Size badge palette and labels
const SIZE_BADGE = {
  SMALL: { fill: "#a855f7", label: "S" }, // purple-500
  MEDIUM: { fill: "#06b6d4", label: "M" }, // cyan-500
  LARGE: { fill: "#f97316", label: "L" }, // orange-500
};

// Utility to format stall codes like A01, A02, ...
const formatCode = (hall, index) => `${hall}${String(index).padStart(2, "0")}`;

const toStringSet = (values) => {
  if (!values) return new Set();
  const array =
    values instanceof Set
      ? Array.from(values)
      : Array.isArray(values)
      ? values
      : [];
  const mapped = new Set();
  array.forEach((value) => {
    if (value === null || value === undefined) return;
    mapped.add(String(value));
  });
  return mapped;
};

// Cyclic mixed-size pattern per hall: S → M → L → ...
const sizeByPattern = (index1) => {
  const cycle = ["SMALL", "MEDIUM", "LARGE"];
  return cycle[(index1 - 1) % cycle.length];
};

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
  const fill = a.kind === "TOILET" ? "#bfdbfe" : "#fde68a";
  const stroke = a.kind === "TOILET" ? "#60a5fa" : "#f59e0b";
  return (
    <>
      <rect
        x={a.x}
        y={a.y}
        width={a.w}
        height={a.h}
        rx="10"
        ry="10"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
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
      <rect
        x={e.x}
        y={e.y}
        width={e.w}
        height={e.h}
        rx="12"
        ry="12"
        fill="#86efac"
        stroke="#16a34a"
        strokeWidth="3"
      />
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
      <rect
        x={e.x}
        y={e.y}
        width={e.w}
        height={e.h}
        rx="12"
        ry="12"
        fill="#bbf7d0"
        stroke="#16a34a"
        strokeWidth="3"
      />
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
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <ellipse
        cx={p.cx}
        cy={p.cy}
        rx={p.rx}
        ry={p.ry}
        fill="url(#pondGrad)"
        stroke="#1d4ed8"
        strokeWidth="2"
        opacity="0.95"
      />
      <ellipse
        cx={p.cx}
        cy={p.cy}
        rx={p.rx - 8}
        ry={p.ry - 6}
        fill="none"
        stroke="#eff6ff"
        strokeOpacity="0.5"
      />
      <ellipse
        cx={p.cx}
        cy={p.cy}
        rx={p.rx - 16}
        ry={p.ry - 12}
        fill="none"
        stroke="#eff6ff"
        strokeOpacity="0.35"
      />
      <text
        x={p.cx}
        y={p.cy + p.ry + 16}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#1f2937"
      >
        {p.label}
      </text>
    </g>
  );
}

/////////////////// TICKET COUNTER (narrower) ///////////////////
function TicketCounter({ x, y, w = 96, h = 44, label = "Ticket Counter" }) {
  const awningH = Math.min(16, Math.max(12, Math.floor(h * 0.28)));
  const windowPad = 8;
  const winX = x + windowPad;
  const winY = y + awningH + 6;
  const winW = w - windowPad * 2;
  const winH = h - awningH - 12;
  const labelFont = Math.max(8, Math.min(10, Math.floor(w / 11)));

  return (
    <g>
      {/* kiosk */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="8"
        ry="8"
        fill="#fff7ed"
        stroke="#ea580c"
        strokeWidth="2"
      />
      {/* awning */}
      <rect x={x} y={y} width={w} height={awningH} fill="#fdba74" />
      {Array.from({ length: Math.ceil(w / 8) }).map((_, i) => (
        <rect
          key={i}
          x={x + i * 8}
          y={y}
          width={4}
          height={awningH}
          fill="#fb923c"
        />
      ))}
      {/* window */}
      <rect
        x={winX}
        y={winY}
        width={winW}
        height={winH}
        rx="4"
        ry="4"
        fill="#e5e7eb"
        stroke="#94a3b8"
      />
      {/* label */}
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

/////////////////// SIZE LEGEND (top-right inside site boundary) ///////////////////
function SizeLegend({ x, y }) {
  const W = 168,
    H = 78,
    P = 10,
    ROW = 18;
  const items = [
    { key: "SMALL", text: "Small (S)" },
    { key: "MEDIUM", text: "Medium (M)" },
    { key: "LARGE", text: "Large (L)" },
  ];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={W}
        height={H}
        rx="10"
        fill="#ffffff"
        stroke="#cbd5e1"
      />
      <text
        x={x + P}
        y={y + P - 2}
        dominantBaseline="hanging"
        fontSize="12"
        fontWeight="800"
        fill="#111827"
      >
        Stall Sizes
      </text>
      {items.map((it, i) => {
        const yy = y + P + 14 + i * ROW;
        const sw = SIZE_BADGE[it.key];
        return (
          <g key={it.key}>
            <rect
              x={x + P}
              y={yy}
              width="14"
              height="14"
              rx="3"
              fill={sw.fill}
            />
            <text x={x + P + 20} y={yy + 11} fontSize="11" fill="#111827">
              {it.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/////////////////// OUTER ROADS (FULL EDGE, OUTSIDE) ///////////////////
function Roads() {
  const left = {
    x: 0,
    y: 0,
    w: ROAD_THICKNESS,
    h: VIEW_H,
    name: "MALALASEKARA MAWATHA",
  };
  const bottom = {
    x: 0,
    y: VIEW_H - ROAD_THICKNESS,
    w: VIEW_W,
    h: ROAD_THICKNESS,
    name: "BAUDDHALOKA MAWATHA",
  };

  const leftCenter = { x: left.x + left.w / 2, y: left.y + left.h / 2 };
  const bottomCenter = {
    x: bottom.x + bottom.w / 2,
    y: bottom.y + bottom.h / 2,
  };

  return (
    <g>
      {/* Left Road */}
      <g>
        <rect
          x={left.x}
          y={left.y}
          width={left.w}
          height={left.h}
          fill={COLORS.ROAD}
        />
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

      {/* Bottom Road */}
      <g>
        <rect
          x={bottom.x}
          y={bottom.y}
          width={bottom.w}
          height={bottom.h}
          fill={COLORS.ROAD}
        />
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
export default function StallSvgMap({
  stalls,
  onSelect,
//   selectedIds,
//   onToggle,
  bookedIds,
  inProgressIds,
}) {
  // Layout slots inside each hall
  const positions = useMemo(() => {
    const out = [];
    const counters = {};
    Object.entries(HALLS).forEach(([hallKey, b]) => {
      const { rows, cols } = layoutCells(b.capacity);
      const innerW = b.w - CELL_PAD * 2 - CELL_GAP * (cols - 1);
      const innerH = b.h - (TOP_LABEL_PAD + CELL_PAD) - CELL_GAP * (rows - 1);
      const cellW = innerW / cols;
      const cellH = innerH / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nextIndex = (counters[hallKey] || 0) + 1;
          if (nextIndex > b.capacity) break;
          counters[hallKey] = nextIndex;

          const x = b.x + CELL_PAD + c * (cellW + CELL_GAP);
          const y = b.y + TOP_LABEL_PAD + r * (cellH + CELL_GAP);
          out.push({
            hall: hallKey,
            idxInHall: nextIndex,
            code: formatCode(hallKey, nextIndex),
            x,
            y,
            w: cellW,
            h: cellH,
          });
        }
      }
    });
    return out.slice(0, 150);
  }, []);

  const bookedLookup = useMemo(() => toStringSet(bookedIds), [bookedIds]);
  const inProgressLookup = useMemo(
    () => toStringSet(inProgressIds),
    [inProgressIds]
  );

  // Merge backend stalls onto layout positions, and FORCE mixed size (S→M→L).
  const normalizedStalls = useMemo(() => {
    const codeMap = new Map();
    (stalls || []).forEach((stall) => {
      if (!stall) return;
      const code =
        typeof stall.code === "string" ? stall.code.toUpperCase() : null;
      if (code) codeMap.set(code, stall);
    });

    return positions.map((slot) => {
      const actual = codeMap.get(slot.code) ?? null;
      const displaySize = sizeByPattern(slot.idxInHall); // forced mixed visual size

      const fallback = {
        ...slot,
        id: slot.code,
        code: slot.code,
        hall: slot.hall,
        actualSize: actual?.size ?? null, // preserve original if present
        size: displaySize, // <-- unify on display size for UI/cart
        displaySize, // also keep explicit
        status: "AVAILABLE",
        reserved: false,
        isPlaceholder: !actual,
      };

      const merged = actual
        ? {
            ...fallback,
            ...actual,
            id: actual.id ?? fallback.id,
            code: actual.code ?? fallback.code,
            hall: fallback.hall,
            x: fallback.x,
            y: fallback.y,
            w: fallback.w,
            h: fallback.h,
            actualSize: actual.size ?? fallback.actualSize,
            size: displaySize, // <-- override to the mixed size
            displaySize,
            isPlaceholder: false,
          }
        : fallback;

      const mergedId = merged.id ?? fallback.id;
      let status = merged.status ?? (merged.reserved ? "BOOKED" : "AVAILABLE");
      const idKey =
        mergedId !== undefined && mergedId !== null ? String(mergedId) : null;
      if (idKey && bookedLookup.has(idKey)) {
        status = "BOOKED";
      } else if (idKey && inProgressLookup.has(idKey)) {
        status = "REQUESTED";
      }

      return {
        ...merged,
        id: mergedId ?? fallback.id,
        status,
        reserved: status === "BOOKED",
      };
    });
  }, [stalls, positions, bookedLookup, inProgressLookup]);

  // === Ticket counters ===
  const T1_W = 100,
    T1_H = 44;
  const TICKET1 = {
    x: ENTRANCE.x - (T1_W + 12),
    y: ENTRANCE.y - (T1_H + 12),
    w: T1_W,
    h: T1_H,
    label: "Ticket Counter",
  };

  const cx2 = ENTRANCE_LEFT.x + ENTRANCE_LEFT.w / 2;
  const T2_W = 92,
    T2_H = 42;
  const pondTop = POND.cy - POND.ry;
  const GAP_ABOVE_POND = 10;
  const TICKET2 = {
    x: cx2 + 30,
    y: pondTop - T2_H - GAP_ABOVE_POND,
    w: T2_W,
    h: T2_H,
    label: "Ticket Counter",
  };

  const SITE = { x: 16, y: 16, w: 1200 - 32, h: 800 - 32 };
  const LEGEND_POS = { x: SITE.x + SITE.w - 168 - 8, y: SITE.y + 8 };

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        role="img"
        aria-label="Bookfair halls with stalls"
        style={{
          display: "block",
          height: "auto",
          background: COLORS.MAP_BG,
          borderRadius: 12,
        }}
      >
        <Roads />

        <g transform={`translate(${EXTRA_LEFT}, 0)`}>
          <rect
            x={SITE.x}
            y={SITE.y}
            width={SITE.w}
            height={SITE.h}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            rx="14"
          />

          <SizeLegend x={LEGEND_POS.x} y={LEGEND_POS.y} />
          <Pond p={POND} />

          {Object.values(HALLS).map((b, i) => (
            <Hall key={i} box={b} />
          ))}
          {AMENITIES.map((a, i) => (
            <Amenity key={i} a={a} />
          ))}

          <TicketCounter {...TICKET1} />
          <TicketCounter {...TICKET2} />

          <Entrance e={ENTRANCE} />
          <EntranceSmallLeft e={ENTRANCE_LEFT} />

          {normalizedStalls.map((stall, i) => {
            if (!stall) return null;

            const isBooked = (stall.status ?? "").toUpperCase() === "BOOKED";
            const isRequested =
              (stall.status ?? "").toUpperCase() === "REQUESTED";
            // const isSelected = Boolean(selectedIds?.has?.(stall.id));
            const isPlaceholder = Boolean(stall.isPlaceholder);
            // const isUnavailable = isBooked || isRequested || isPlaceholder;

            let fill = COLORS.AVAILABLE;
            if (isBooked) fill = COLORS.BOOKED;
            else if (isRequested) fill = COLORS.REQUESTED;

            const strokeColor = onSelect ? COLORS.SELECT_STROKE : COLORS.STROKE;
            const strokeWidth = onSelect ? 3 : 1.5;

            const codeTop = stall.code ?? `?${i + 1}`;

            // Bottom-right size badge (uses unified stall.size)
            const keyForBadge = stall.size || "SMALL";
            const sb = SIZE_BADGE[keyForBadge] || {
              fill: "#64748b",
              label: "?",
            };
            const BADGE = 14,
              PAD = 2;
            const bx = stall.x + stall.w - BADGE - PAD;
            const by = stall.y + stall.h - BADGE - PAD;

            // const handleClick = () => {
            //   if (isUnavailable) return;
            //   // Stall already has size unified to display size; still pass an explicit size for safety
            //   onToggle?.({ ...stall, size: stall.size }, codeTop);
            // };

            return (
              <g
                key={stall.id ?? `${stall.code}-${i}`}
                onClick={() => {
                //   if (isPlaceholder) return;
                  onSelect?.(stall);
                  console.log(stall);
                  
                }}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={stall.x}
                  y={stall.y}
                  width={stall.w}
                  height={stall.h}
                  rx={6}
                  ry={6}
                  fill={fill}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={isPlaceholder ? 0.4 : isBooked ? 0.85 : 1}
                />

                {/* Top label (hall code) */}
                <text
                  x={stall.x + stall.w / 2}
                  y={stall.y + 3}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                  fontSize="11"
                  fontWeight="800"
                  fill="#ffffff"
                  pointerEvents="none"
                >
                  {codeTop}
                </text>

                {/* Bottom-right size badge */}
                <rect
                  x={bx}
                  y={by}
                  width={BADGE}
                  height={BADGE}
                  rx={3}
                  fill={sb.fill}
                  stroke="#0f172a"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                />
                <text
                  x={bx + BADGE / 2}
                  y={by + BADGE / 2 + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="900"
                  fill="#ffffff"
                  pointerEvents="none"
                >
                  {sb.label}
                </text>

                <title>
                  {`${codeTop} — ${keyForBadge} — ${
                    isPlaceholder
                      ? "Unavailable"
                      : isBooked
                      ? "Booked"
                      : isRequested
                      ? "In progress"
                      : "Available"
                  }`}
                </title>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
