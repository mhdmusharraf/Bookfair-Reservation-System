import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import JoinRequests from "./pages/JoinRequests";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import RegisteredBusinesses from "./pages/RegisteredBusinesses";
import PaymentHistory from "./pages/PaymentHistory";

function Protected({ children }) {
  const { token } = useAuth();
  const DISABLE_BACKEND = import.meta.env.VITE_DISABLE_BACKEND === "true";
  return DISABLE_BACKEND || token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Header />}>
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
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
    </AuthProvider>
  );
}
