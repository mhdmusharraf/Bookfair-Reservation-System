import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import JoinRequests from "./pages/JoinRequests";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/Header";
import RegisteredBusinesses from "./pages/RegisteredBusinesses";
import PaymentHistory from "./pages/PaymentHistory";

const EMPLOYEE_PORTAL_ROLES = ["EMPLOYEE", "ADMIN"];

function hasRequiredRole(user, allowedRoles) {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some((role) => allowedRoles.includes(role));
}

function UnauthorizedPortalNotice({ onLogout }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-4">
        <h2 className="text-2xl font-semibold">Wrong portal</h2>
        <p>
          You are signed in with an account that does not have access to the
          employee portal. Please sign out and log back in using an employee
          account.
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function Protected({ children }) {
  const { user, isAuthenticating, logout } = useAuth();
  if (isAuthenticating) {
    return <div className="flex justify-center py-12">Checking session...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!hasRequiredRole(user, EMPLOYEE_PORTAL_ROLES)) {
    return <UnauthorizedPortalNotice onLogout={logout} />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Header />}>
          <Route
            path="/"
            element={
              // <Protected>
                <Dashboard />
              // </Protected>
            }
          />
          <Route
            path="/join-requests"
            element={
              <Protected>
                <JoinRequests />
              </Protected>
            }
          />
          <Route
            path="/registered-businesses"
            element={
              <Protected>
                <RegisteredBusinesses/>
              </Protected>
            }
          />
          <Route
            path="/payment-history"
            element={
              <Protected>
                <PaymentHistory/>
              </Protected>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
