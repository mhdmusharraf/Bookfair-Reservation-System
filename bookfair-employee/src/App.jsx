import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AcceptInvite from "./pages/AcceptInvite";
import Dashboard from "./pages/Dashboard";
import Reserved from "./pages/Reserved";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Shell from "./components/Shell";

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
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
