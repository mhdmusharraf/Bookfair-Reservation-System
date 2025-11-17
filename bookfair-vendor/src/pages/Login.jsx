import React from "react";
import { useState } from "react";
import { Paper, TextField, Button, Typography, Stack, CircularProgress } from "@mui/material";
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const { data } = await apiLogin({ email, password });

      // NEW LOGIN LOGIC
      const status = data.user?.status;

      if (status === 'accepted') {

        login(data.token, data.user);
        nav("/");

      } else if (status === 'pending') {

        setErr("Your account is still pending review.");

      } else if (status === 'rejected') {

        setErr("Your account application was rejected. Please contact support.");
        
      } else {

        setErr("Could not verify account status.");
        
      }
      
    } catch (e) {

      setErr("Invalid credentials. Please try again.");

    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
    <Paper 
      elevation={6} 
      className="p-8 w-full max-w-md rounded-xl"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <Typography variant="h4" className="font-bold text-center mb-2">
        Vendor Login
      </Typography>

      <Typography 
        variant="body2" 
        className="text-center text-gray-600 mb-6"
      >
        Login to manage your Book Fair stall reservations
      </Typography>

      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          fullWidth
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          variant="outlined"
        />

        {err && (
          <Typography 
            color="error" 
            variant="body2"
            className="mt-1 text-center"
          >
            {err}
          </Typography>
        )}

        <Stack spacing={2} className="pt-2">
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>

          <Button 
            component={Link} 
            to="/signup" 
            fullWidth 
            variant="text"
          >
            Create an Account
          </Button>
        </Stack>
      </form>
    </Paper>
  </div>
);
}
