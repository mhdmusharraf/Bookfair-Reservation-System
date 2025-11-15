import React from "react";
import { useState } from "react";
import { Paper, TextField, Button, Typography, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { signupEmployee } from "../api/auth";

export default function Signup() {
  const [businessName, setBusinessName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
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
      const { data } = await signupEmployee({
        businessName,
        contactNumber,
        email,
        password,
      });
      login(data.token, data.user);
      nav("/");
    } catch (error) {
      const message = error?.response?.data?.message || "Signup failed";
      setErr(message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Paper className="p-6 w-full max-w-md flex flex-col">
        <Typography
          variant="h5"
          className="mb-4 flex justify-center"
          sx={{ marginBottom: 4, fontWeight: "bold" }}
        >
          Employee Signup
        </Typography>
        <form onSubmit={onSubmit} className="space-y-3">
          <TextField
            fullWidth
            size="small"
            label="Business name"
            sx={{ marginBottom: 2 }}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            size="small"
            label="Contact number"
            sx={{ marginBottom: 2 }}
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />
          <TextField
            fullWidth
            size="small"
            label="Email"
            sx={{ marginBottom: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <TextField
            fullWidth
            size="small"
            label="Password"
            type="password"
            value={password}
            sx={{ marginBottom: 2 }}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {err && (
            <Typography color="error" variant="body2">
              {err}
            </Typography>
          )}
          <Stack direction="column" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              Create account
            </Button>
            <Button component={Link} to="/login" sx={{ textTransform: "none" }}>
              Already have an account? Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
