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
  const normalized = data.map((stall) => ({
    ...stall,
    status: stall.reserved ? "BOOKED" : "AVAILABLE",
  }));
  return { data: normalized };
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
