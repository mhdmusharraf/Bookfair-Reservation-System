import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AcceptInvite from "./pages/AcceptInvite";
import PaymentSuccess from "./pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import Reserved from "./pages/Reserved";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Shell from "./components/Shell";

const VENDOR_PORTAL_ROLES = ["VENDOR"];

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
          vendor portal. Please sign out and log in with your vendor account.
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
  if (!hasRequiredRole(user, VENDOR_PORTAL_ROLES)) {
    return <UnauthorizedPortalNotice onLogout={logout} />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/accept-invite/:token" element={<AcceptInvite/>}/>
        <Route element={<Shell/>}>
          <Route path="/" element={<Protected><Dashboard/></Protected>} />
          <Route path="/reserved" element={<Protected><Reserved/></Protected>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </AuthProvider>
  );
}
