import { api } from "./client";

export const GENRE_OPTIONS = [
  "Stationary",
  "IT",
  "Hardware",
  "Fiction",
  "Non-Fiction",
  "Sci-Fi",
  "Fantasy",
  "Biography",
  "Children's",
  "Education",
  "Comics",
  "History",
];

export async function fetchStalls(params = {}) {
  const { data } = await api.get("/stalls", { params });
  const stalls = Array.isArray(data?.stalls) ? data.stalls : Array.isArray(data) ? data : [];
  const normalized = stalls.map((stall) => {
    const status = stall.status ?? (stall.reserved ? "BOOKED" : "AVAILABLE");
    return {
      ...stall,
      status,
      reserved: status === "BOOKED" || stall.reserved === true,
    };
  });

  return {
    data: normalized,
    bookedIds: Array.isArray(data?.bookedIds) ? data.bookedIds : [],
    inProgressIds: Array.isArray(data?.inProgressIds) ? data.inProgressIds : [],
  };
}

export async function reserveStalls({ reservations }) {
  const stallIds = reservations
    .map((res) => Number(res.stallId))
    .filter((id) => Number.isFinite(id));

  if (stallIds.length === 0) {
    throw new Error("No valid stalls selected");
  }

  const { data } = await api.post("/reservations", { stallIds });
  return { data };
}
