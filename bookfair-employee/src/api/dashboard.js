import { api } from "./client";

export async function fetchDashboard() {
  const { data } = await api.get("/employee/dashboard");
  return { data };
}
