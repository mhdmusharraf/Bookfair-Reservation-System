import { api } from "./client";

export function createCheckoutSession({ stallIds, currency = "lkr" }) {
  return api.post("/payments/create-checkout-session", { stallIds, currency });
}
