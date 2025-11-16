import { api } from "./client";

export async function fetchAllReservations() {
  const { data } = await api.get("/reservations");
  return { data };
}
