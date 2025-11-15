import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";
// example: "http://localhost:5000"

// ----------------------------------
// USER SIGNUP
// ----------------------------------
export async function signupEmployee(payload) {
  if (!BASE_URL) {
    return {
      data: {
        token: "mock-token",
        user: {
          name: payload.name,
          email: payload.email,
          role: "EMPLOYEE",
        },
      },
    };
  }

  const { data } = await axios.post(
    `${BASE_URL}/api/v1/auth/register`,
    payload
  );
  return { data };
}

// ----------------------------------
// LOGIN
// ----------------------------------
export async function login(payload) {
  if (!BASE_URL) {
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

  const { data } = await axios.post(
    `${BASE_URL}/api/v1/auth/login`,
    payload
  );
  return { data };
}

// ----------------------------------
// ADMIN: ACCEPT A USER ACCOUNT
// ----------------------------------
export async function acceptUser(userId, email) {
  if (!BASE_URL) {
    return { data: { message: "Mock user accepted" } };
  }

  const { data } = await axios.post(`${BASE_URL}/api/v1/auth/accept`, {
    userId,
    email,
  });

  return { data };
}


// ----------------------------------
// ADMIN: REJECT USER
// ----------------------------------
export async function rejectUser(userId, email) {
  if (!BASE_URL) {
    return { data: { message: "Mock user rejected" } };
  }

  const { data } = await axios.post(`${BASE_URL}/api/v1/auth/reject`, {
    userId,
    email,
  });

  return { data };
}