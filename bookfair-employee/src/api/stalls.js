import { api } from "./client";

export async function fetchStalls(params = {}) {
  const { data } = await api.get("/stalls", { params });
  const normalized = data.map((stall) => ({
    id: stall.id,
    code: stall.code,
    size: stall.size,
    status: stall.reserved ? "ACCEPTED" : "AVAILABLE",
    reserved: stall.reserved,
  }));
  return { data: normalized };
}
