import axios from "axios";

async function fetchProfile(token) {
  const { data } = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// ----------------------------------
// USER SIGNUP
// ----------------------------------
export async function signupEmployee(payload) {
  const { data } = await api.post("/auth/register/employee", payload);
  const user = await fetchProfile(data.token);
  return { data: { token: data.token, user } };
}

// ----------------------------------
// LOGIN
// ----------------------------------
export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  const user = await fetchProfile(data.token);
  return { data: { token: data.token, user } };
}

export async function validateInvite(token) {
  const { data } = await api.get(`/invites/${token}`);
  return { data };
}

export async function acceptInvite(token, payload) {
  const { data } = await api.post(`/invites/${token}/accept`, payload);
  const user = await fetchProfile(data.token);
  return { data: { token: data.token, user } };
}
