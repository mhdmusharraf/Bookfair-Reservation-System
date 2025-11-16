import { api } from "./client";

export async function signupVendor(payload) {
  if (!api.defaults.baseURL) {
    // We dont return a token here.
    console.log("Mock Signup Request:", payload);
    return { data: { success: true, status: 'pending' } };
  }
  const { data } = await api.post("/auth/vendor/signup", payload);
  return { data };
}

export async function login(payload) {
  if (!api.defaults.baseURL) {
    if (payload.email === "pending@vendor.com") {
      return { data: { user: { status: "pending" } } };
    }
    if (payload.email === "rejected@vendor.com") {
      return { data: { user: { status: "rejected" } } };
    }
    
    return { 
      data: { 
        token: "mock-token", 
        user: { 
          businessName: "Demo Books", 
          email: payload.email, 
          role: "VENDOR", 
          status: "accepted" 
        } 
      } 
    };
  }
  
  // Real API call
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
  return { data };
}
