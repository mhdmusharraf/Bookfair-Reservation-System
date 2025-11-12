import { api } from "./client";

/** Keep sizes to this distribution */
const SIZE_QUOTAS = { SMALL: 60, MEDIUM: 50, LARGE: 40 }; // total 150

/** Same hall order and capacities as StallSvgMap.jsx */
const HALL_DEFS = [
  ["A", 24], ["B", 24], ["C", 12], ["D", 12], ["H", 20],
  ["J", 10], ["K", 10], ["R", 8],  ["L", 6],  ["M", 6],
  ["N", 8],  ["P", 5],  ["Q", 5],
];

export const GENRE_OPTIONS = ["Stationary", "IT", "Hardware"];

/** Round-robin assignment of sizes to hit the quotas without clumping */
function sizeAllocator() {
  const order = ["SMALL", "MEDIUM", "LARGE"];
  const remaining = { ...SIZE_QUOTAS };
  let i = 0;

  return function nextSize() {
    // pick the next available size in round-robin that still has remaining quota
    for (let k = 0; k < order.length; k++) {
      const s = order[(i + k) % order.length];
      if (remaining[s] > 0) {
        remaining[s]--;
        i = (i + k + 1) % order.length;
        return s;
      }
    }
    // Fallback (should not happen)
    return "SMALL";
  };
}

function buildMockStallsByHall() {
  const stalls = [];
  const nextSize = sizeAllocator();

  HALL_DEFS.forEach(([hall, capacity]) => {
    for (let n = 1; n <= capacity; n++) {
      const size = nextSize();
      stalls.push({
        id: `${hall}-${String(n).padStart(2, "0")}`,
        code: `${hall}-${String(n).padStart(2, "0")}`, // matches SVG top label
        hall,
        size,                            // "SMALL" | "MEDIUM" | "LARGE"
        status: "AVAILABLE",
        reservedBy: null,
      });
    }
  });

  // Pre-book a few for realism
  ["A-03", "B-12", "H-07", "D-05"].forEach(id => {
    const s = stalls.find(x => x.id === id);
    if (s) { s.status = "BOOKED"; s.reservedBy = "other@publisher.com"; }
  });

  return stalls;
}

const mockStalls = buildMockStallsByHall();

export async function fetchStalls() {
  if (!api.defaults.baseURL) {
    return { data: mockStalls };
  }
  const { data } = await api.get("/stalls");
  return { data };
}

export async function reserveStalls({ stallIds, userEmail }) {
  if (!api.defaults.baseURL) {
    stallIds.forEach(id=>{
      const s = mockStalls.find(x=>x.id===id);
      if (s) { s.status = "BOOKED"; s.reservedBy = userEmail; }

    stallIds.forEach(id => {
      const s = mockStalls.find(x => x.id === id);
      if (s) { s.status = "BOOKED"; s.reservedBy = "current@vendor.com"; }
    });
    return { data: { success: true, reserved: stallIds, qrUrl: "https://example.com/qr.png" } };
  }
  const { data } = await api.post("/stalls/reserve", { stallIds });
  return { data };
}

export async function saveGenres({ genres }) {
 if (!api.defaults.baseURL) {
    // Mock success
    console.log("Mock API: Saved genres", genres);
    return { data: { success: true, genres } };
  }
  const { data } = await api.post("/stalls/genres", { genres });
  return { data };
}