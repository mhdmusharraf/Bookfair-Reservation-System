import { api } from "./client";

const SIZE_QUOTAS = { SMALL: 60, MEDIUM: 50, LARGE: 40 }; 

const HALL_DEFS = [
  ["A", 24], ["B", 24], ["C", 12], ["D", 12], ["H", 20],
  ["J", 10], ["K", 10], ["R", 8],  ["L", 6],  ["M", 6],
  ["N", 8],  ["P", 5],  ["Q", 5],
];


export const GENRE_OPTIONS = ["Stationary", "IT", "Hardware", "Fiction", "Non-Fiction", "Sci-Fi", "Fantasy", "Biography", "Children's", "Education", "Comics", "History"];

function sizeAllocator() {
  const order = ["SMALL", "MEDIUM", "LARGE"];
  const remaining = { ...SIZE_QUOTAS };
  let i = 0;

  return function nextSize() {
    for (let k = 0; k < order.length; k++) {
      const s = order[(i + k) % order.length];
      if (remaining[s] > 0) {
        remaining[s]--;
        i = (i + k + 1) % order.length;
        return s;
      }
    }
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
        code: `${hall}-${String(n).padStart(2, "0")}`,
        size,
        status: "AVAILABLE",
        reserved: false,
        reservedBy: null,
      });
    }
  });

  // Pre-book a few for realism
  ["A-03", "B-12", "H-07", "D-05"].forEach(id => {
    const s = stalls.find(x => x.id === id);
    if (s) {
      s.status = "BOOKED";
      s.reserved = true;
      s.reservedBy = "other@publisher.com";
    }
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

// ADD TO CART" FLOW 

export async function reserveStalls({ reservations, userEmail }) {
  if (!api.defaults.baseURL) {
    // Mock API logic
    const reservedIds = [];
    
    // Cleaned up the loop:
    reservations.forEach(res => {
      const s = mockStalls.find(x => x.id === res.stallId);
      if (s) {
        s.status = "BOOKED";
        s.reserved = true;
        s.reservedBy = userEmail; // Use the email for correct filtering
        // We would also save `res.genres` in a real DB
        console.log(`Mock: Reserving ${s.id} for ${userEmail} with genres: ${res.genres.join(', ')}`);
        reservedIds.push(s.id);
      }
    });
    
    return { data: { success: true, reserved: reservedIds, qrUrl: "https://example.com/qr.png" } };
  }

  // Real API call
  const stallIds = reservations
    .map(res => Number(res.stallId))
    .filter(id => Number.isFinite(id));
  const { data } = await api.post("/reservations", { stallIds });
  return { data };
}
