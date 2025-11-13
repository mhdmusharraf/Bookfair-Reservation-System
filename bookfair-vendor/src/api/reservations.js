import { api } from "./client";
import { fetchStalls } from "./stalls";

function toUniqueList(items) {
  return Array.from(new Set(items));
}

export async function fetchMyReservedStallCodes(userEmail, stallsSnapshot = null) {
  if (!userEmail) {
    return { data: [] };
  }

  if (!api.defaults.baseURL) {
    const source = stallsSnapshot ?? (await fetchStalls()).data;
    const codes = source
      .filter(stall => stall.reservedBy === userEmail)
      .map(stall => stall.code ?? stall.id);
    return { data: toUniqueList(codes) };
  }

  const { data } = await api.get("/reservations/me");
  const codes = [];
  data.forEach(reservation => {
    if (Array.isArray(reservation?.stalls)) {
      reservation.stalls.forEach(code => {
        if (code) codes.push(code);
      });
    }
  });
  return { data: toUniqueList(codes) };
}
