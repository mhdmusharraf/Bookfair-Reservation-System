import React from "react";
import { useState } from "react";
import { Paper, TextField, Button, Typography } from "@mui/material";
import { signupVendor } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const { data } = await signupVendor({ businessName, email, password });
      login(data.token, data.user);
      nav("/");
    } catch {
      setErr("Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Paper className="p-6 w-full max-w-md">
        <Typography variant="h5" className="font-bold mb-4">Vendor Signup</Typography>
        <form onSubmit={onSubmit} className="space-y-3">
          <TextField fullWidth label="Business name" value={businessName} onChange={e=>setBusinessName(e.target.value)} />
          <TextField fullWidth label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <TextField fullWidth label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <Typography color="error" variant="body2">{err}</Typography>}
          <Button type="submit" variant="contained" disabled={loading}>Create account</Button>
        </form>
      </Paper>
    </div>
  );
}
