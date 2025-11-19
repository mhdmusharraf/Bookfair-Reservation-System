import { api } from "./client";

export async function fetchVendorAccessRequests() {
  const { data } = await api.get("/vendor-access/requests");
  return { data };
}

export async function approveVendorAccess(requestId) {
  const { data } = await api.post(`/vendor-access/requests/${requestId}/approve`);
  return { data };
}
