import { api } from "./client";

export function fetchPayments() {
  return api.get("/payments");
}
