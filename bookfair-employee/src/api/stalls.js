import { api } from "./client";

export async function fetchStalls(params = {}) {
  const { data } = await api.get("/stalls", { params });
  const stalls = Array.isArray(data?.stalls) ? data.stalls : Array.isArray(data) ? data : [];
  const normalized = stalls.map((stall) => {
    const backendStatus = stall.status ?? (stall.reserved ? "BOOKED" : "AVAILABLE");
    const status =
      backendStatus === "BOOKED"
        ? "ACCEPTED"
        : backendStatus === "IN_PROGRESS"
        ? "REQUESTED"
        : "AVAILABLE";
    return {
      id: stall.id,
      code: stall.code,
      size: stall.size,
      status,
      reserved: backendStatus === "BOOKED" || stall.reserved,
      backendStatus,
    };
  });
  return {
    data: normalized,
    bookedIds: Array.isArray(data?.bookedIds) ? data.bookedIds : [],
    inProgressIds: Array.isArray(data?.inProgressIds) ? data.inProgressIds : [],
  };
}
