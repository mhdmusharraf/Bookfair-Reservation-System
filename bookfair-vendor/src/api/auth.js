import { api } from "./client";

async function fetchProfile() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function signupVendor(payload) {
  await api.post("/auth/register", payload);
  const user = await fetchProfile();
  return { data: { user } };
}

export async function login(payload) {
  await api.post("/auth/login", { ...payload, portal: "VENDOR" });
  const user = await fetchProfile();
  return { data: { user } };
}

export async function validateInvite(token) {
  const { data } = await api.get(`/invites/${token}`);
  return { data };
}

export async function acceptInvite(token, payload) {
  await api.post(`/invites/${token}/accept`, payload);
  const user = await fetchProfile();
  return { data: { user } };
}
