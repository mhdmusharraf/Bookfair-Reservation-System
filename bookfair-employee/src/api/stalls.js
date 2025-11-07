import { api } from "./client";

const GENRES = ["Stationary", "IT", "Hardware"];
export const GENRE_OPTIONS = GENRES;

// Build deterministic 150-stall mock (50 S/M/L)
function buildMockStalls() {
  const arr = [];
  const make = (prefix, count, size) => {
    for (let i = 1; i <= count; i++) {
      arr.push({
        id: `${prefix}${String(i).padStart(2,"0")}`,
        code: `${prefix}${String(i).padStart(2,"0")}`,
        size,
        status: "AVAILABLE",
        reservedBy: null,
      });
    }
  };
  make("S-",50,"SMALL"); make("M-",50,"MEDIUM"); make("L-",50,"LARGE");
  // Pretend a few are already booked
  ["S-03","M-12","L-07","L-08"].forEach(id=>{
    const s = arr.find(x=>x.id===id);
    if (s) { s.status="BOOKED"; s.reservedBy="other@publisher.com"; }
  });
  return arr;
}
const mockStalls = buildMockStalls();

export async function fetchStalls() {
  if (!api.defaults.baseURL) {
    // mock fetch
    return { data: mockStalls };
  }
  const { data } = await api.get("/stalls");
  return { data };
}

export async function reserveStalls({ stallIds, genres }) {
  if (!api.defaults.baseURL) {
    stallIds.forEach(id=>{
      const s = mockStalls.find(x=>x.id===id);
      if (s) { s.status = "BOOKED"; s.reservedBy = "current@vendor.com"; }
    });
    return { data: { success: true, reserved: stallIds, genres, qrUrl: "https://example.com/qr.png" } };
  }
  const { data } = await api.post("/stalls/reserve", { stallIds, genres });
  return { data };
}
