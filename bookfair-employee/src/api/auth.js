import { api } from "./client";

// Real endpoints (adjust paths to backend):
// POST /auth/vendor/signup { businessName, email, password }
// POST /auth/login { email, password }
// GET  /invites/:token
// POST /invites/:token/accept { password }

export async function signupEmployee(payload) {
  if (!api.defaults.baseURL) {
    // mock success
    return {
      data: {
        token: "mock-token",
        user: { name: payload.name, email: payload.email, role: "EMPLOYEE" },
      },
    };
  }
  const { data } = await api.post("/auth/employee/signup", payload);
  return { data };
}

export async function login(payload) {
  if (!api.defaults.baseURL) {
    return {
      data: {
        token: "mock-token",
        user: {
          email: payload.email,
          role: "EMPLOYEE",
        },
      },
    };
  }
  const { data } = await api.post("/auth/login", payload);
  return { data };
}

export async function validateInvite(token) {
  if (!api.defaults.baseURL) {
    return {
      data: { email: "employee@example.com", vendorBusiness: "Demo Books" },
    };
  }
  const { data } = await api.get(`/invites/${token}`);
  return { data };
}

export async function acceptInvite(token, payload) {
  if (!api.defaults.baseURL) {
    return {
      data: {
        token: "mock-emp-token",
        user: {
          email: "employee@example.com",
          businessName: "Demo Books",
          role: "EMPLOYEE",
        },
      },
    };
  }
  const { data } = await api.post(`/invites/${token}/accept`, payload);
  return { data };
}
