import React, { useMemo } from "react";

const VIEW_W = 1200,
  VIEW_H = 800;

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

const HALL_DEFAULT_SIZE = {
  A: "LARGE",
  B: "LARGE",
  C: "MEDIUM",
  D: "MEDIUM",
  H: "MEDIUM",
  J: "MEDIUM",
  K: "MEDIUM",
};

const AMENITIES = [
  { x: 860, y: 320, w: 140, h: 44, label: "Public Toilet", kind: "TOILET" },
  { x: 950, y: 710, w: 220, h: 60, label: "Cafeteria", kind: "CAFE" },
];

const ENTRANCE = { x: 470, y: 740, w: 230, h: 44, label: "Entrance" };
const ENTRANCE_LEFT = { x: 0, y: 345, w: 180, h: 44, label: "Entrance 2" };

const COLORS = {
  AVAILABLE: "#22c55e", // Green
  REQUESTED: "#f59e0b", // Orange
  ACCEPTED: "#ef4444", // Red
  MAP_BG: "#eef2f7",
  HALL_FILL: "#f8fafc",
  HALL_STROKE: "#94a3b8",
  STROKE: "#334155",
  SELECT_STROKE: "#78350f",
};

const HALL_LABEL_SIZE = 20;
const TOP_LABEL_PAD = 28;
const CELL_PAD = 12;
const CELL_GAP = 8;

const SIZE_TAG = { SMALL: "S", MEDIUM: "M", LARGE: "L" };

const formatCode = (hall, index) => `${hall}${String(index).padStart(2, "0")}`;

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

export default function StallSvgMap({ stalls, onSelect }) {
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

  const normalizedStalls = useMemo(() => {
    const codeMap = new Map();
    stalls.forEach((stall) => {
      if (!stall) return;
      const code = typeof stall.code === "string" ? stall.code.toUpperCase() : null;
      if (code) {
        codeMap.set(code, stall);
      }
    });

    return positions.map((slot) => {
      const templateSize = HALL_DEFAULT_SIZE[slot.hall] ?? "SMALL";
      const fallback = {
        ...slot,
        id: slot.code,
        code: slot.code,
        hall: slot.hall,
        size: templateSize,
        status: "AVAILABLE",
        backendStatus: "AVAILABLE",
        isPlaceholder: true,
      };

      const actual = codeMap.get(slot.code) ?? null;
      if (!actual) {
        return fallback;
      }

      return {
        ...fallback,
        ...actual,
        id: actual.id ?? fallback.id,
        code: actual.code ?? fallback.code,
        size: actual.size ?? fallback.size,
        status: actual.status ?? fallback.status,
        backendStatus: actual.backendStatus ?? actual.status ?? fallback.backendStatus,
        hall: fallback.hall,
        x: fallback.x,
        y: fallback.y,
        w: fallback.w,
        h: fallback.h,
        isPlaceholder: false,
      };
    });
  }, [stalls, positions]);

  const sizeLabels = useMemo(() => {
    const counts = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
    return normalizedStalls.map((stall) => {
      const size = stall.size ?? "UNKNOWN";
      counts[size] = (counts[size] || 0) + 1;
      const tag = SIZE_TAG[size] ?? "?";
      return `${tag}-${counts[size]}`;
    });
  }, [normalizedStalls]);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        role="img"
        aria-label="Employee view of bookfair map"
        style={{
          display: "block",
          height: "auto",
          background: COLORS.MAP_BG,
          borderRadius: 12,
        }}
      >
        <rect
          x="16"
          y="16"
          width={VIEW_W - 32}
          height={VIEW_H - 32}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2"
          rx="14"
        />

        {Object.values(HALLS).map((b, i) => (
          <Hall key={i} box={b} />
        ))}

        {AMENITIES.map((a, i) => (
          <Amenity key={i} a={a} />
        ))}

        <Entrance e={ENTRANCE} />
        <EntranceSmallLeft e={ENTRANCE_LEFT} />

        {normalizedStalls.map((stall, i) => {
          if (!stall) return null;

          const status = stall.status ?? "AVAILABLE";
          const isPlaceholder = Boolean(stall.isPlaceholder);
          const fill =
            status === "ACCEPTED"
              ? COLORS.ACCEPTED
              : status === "REQUESTED"
              ? COLORS.REQUESTED
              : COLORS.AVAILABLE;

          const codeTop = sizeLabels[i];

          return (
            <g
              key={stall.id ?? `${stall.code}-${i}`}
              onClick={() => {
                if (isPlaceholder) return;
                onSelect?.(stall);
              }}
              style={{ cursor: isPlaceholder ? "not-allowed" : "pointer" }}
            >
              <rect
                x={stall.x}
                y={stall.y}
                width={stall.w}
                height={stall.h}
                rx={6}
                ry={6}
                fill={fill}
                stroke={COLORS.STROKE}
                strokeWidth={1.5}
                opacity={isPlaceholder ? 0.4 : 0.95}
              />
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
              <title>{`${codeTop} — ${stall.size ?? "Unknown"} — ${stall.backendStatus ?? status}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
