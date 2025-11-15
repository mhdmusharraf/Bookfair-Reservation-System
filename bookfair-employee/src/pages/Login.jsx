import React from "react";
import { useState } from "react";
import { Paper, TextField, Button, Typography, Stack } from "@mui/material";
import { login as apiLogin } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); 
    setErr("");
    try {
      const { data } = await apiLogin({ email, password });
      login(data.token, data.user);
      nav("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid credentials";
      setErr(message);
    } finally {
      setLoading(false);
      console.log("Submitting login form");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Paper className="p-6 w-full max-w-sm flex flex-col">
        <Typography
          variant="h5"
          className="mb-4 flex justify-center"
          sx={{ marginBottom: 4, fontWeight: "bold" }}
        >
          Login
        </Typography>
        <form onSubmit={onSubmit} className="space-y-3">
          <TextField
            fullWidth
            size="small"
            label="Email"
            type="email"
            required
            sx={{ marginBottom: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            label="Password"
            sx={{ marginBottom: 2 }}
            type="password"
            value={password}
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
              sx={{ textTransform: "none" }}
              disabled={loading}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/signup"
              sx={{ textTransform: "none" }}
            >
              Don't have an account? Signup
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
