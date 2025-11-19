import React, { useEffect, useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  Fade,
  Box,
  Alert,
} from "@mui/material";
import { signupVendor } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [businessName, setBusinessName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const { login, user, isAuthenticating } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState("");

  // client-side validation state
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [fieldErr, setFieldErr] = useState({
    businessName: "",
    contactNumber: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!isAuthenticating && user) nav("/");
  }, [isAuthenticating, user, nav]);

  const validate = () => {
    const e = {
      businessName: businessName.trim() ? "" : "Business name is required",
      contactNumber: contactNumber.trim() ? "" : "Contact number is required",
      email: email.trim() ? "" : "Email is required",
      password: password.trim() ? "" : "Password is required",
    };
    const hasErrors = Object.values(e).some(Boolean);
    setFieldErr(e);
    setFormErr(hasErrors ? "Please fill all required fields." : "");
    return !hasErrors;
  };

  // live-clear errors after first attempt
  useEffect(() => {
    if (triedSubmit) validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessName, contactNumber, email, password, triedSubmit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setTriedSubmit(true);
    setApiErr("");
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await signupVendor({
        businessName,
        contactNumber,
        email,
        password,
      });
      login(data.user);
      nav("/");
    } catch (error) {
      const message = error?.response?.data?.message || "Signup failed";
      setApiErr(message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <div className="flex items-center gap-3 text-slate-300">
          <CircularProgress size={22} />
          <span>Checking session…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* animated gradient blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-tr from-fuchsia-500/40 via-indigo-500/30 to-cyan-400/30 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-amber-400/30 via-rose-500/30 to-purple-500/30 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
      {/* subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <div className="relative z-10 flex items-center justify-center py-14 px-4">
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              p: { xs: 3, sm: 4 },
              width: "100%",
              maxWidth: 480,
              borderRadius: 4,
              bgcolor: "rgba(2,6,23,0.55)",
              color: "#e5e7eb",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(148,163,184,0.25)",
              boxShadow:
                "0 30px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
              overflow: "hidden",
              "&:before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(1200px 400px at -10% -10%, rgba(168,85,247,0.25), transparent 60%), radial-gradient(800px 300px at 120% 120%, rgba(6,182,212,0.25), transparent 60%)",
                pointerEvents: "none",
              },
            }}
          >
            {/* header */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  background:
                    "linear-gradient(90deg,#fafafa 0%, #c7d2fe 40%, #a78bfa 70%, #67e8f9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Vendor Signup
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(226,232,240,0.8)", mt: 0.5 }}
              >
                Account will be reviewed by the team before first login to the
                dashboard.
              </Typography>
            </Box>

            {/* Top-level validation/API messages */}
            <Stack spacing={1.25} sx={{ mb: 1 }}>
              {!!formErr && (
                <Alert severity="error" variant="filled" sx={{ py: 0.5 }}>
                  {formErr}
                </Alert>
              )}
              {!!apiErr && (
                <Alert severity="error" sx={{ py: 0.5 }}>
                  {apiErr}
                </Alert>
              )}
            </Stack>

            {/* form with consistent vertical gaps */}
            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  error={!!fieldErr.businessName}
                  helperText={fieldErr.businessName}
                  variant="filled"
                  color="secondary"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      borderRadius: 2,
                      bgcolor: "rgba(15,23,42,0.6)",
                      color: "#e5e7eb",
                      "&:hover": { bgcolor: "rgba(15,23,42,0.7)" },
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        {/* briefcase icon */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="7" width="20" height="14" rx="2" />
                          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ sx: { color: "#9ca3af" } }}
                />

                <TextField
                  fullWidth
                  label="Contact number"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  error={!!fieldErr.contactNumber}
                  helperText={fieldErr.contactNumber}
                  variant="filled"
                  color="secondary"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      borderRadius: 2,
                      bgcolor: "rgba(15,23,42,0.6)",
                      color: "#e5e7eb",
                      "&:hover": { bgcolor: "rgba(15,23,42,0.7)" },
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        {/* phone icon */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.9.34 1.77.65 2.6a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.57-1.2a2 2 0 0 1 2.11-.45c.83.31 1.7.53 2.6.65A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ sx: { color: "#9ca3af" } }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  error={!!fieldErr.email}
                  helperText={fieldErr.email}
                  variant="filled"
                  color="secondary"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      borderRadius: 2,
                      bgcolor: "rgba(15,23,42,0.6)",
                      color: "#e5e7eb",
                      "&:hover": { bgcolor: "rgba(15,23,42,0.7)" },
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        {/* mail icon */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16v16H4z" />
                          <path d="m22 6-10 7L2 6" />
                        </svg>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ sx: { color: "#9ca3af" } }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  error={!!fieldErr.password}
                  helperText={fieldErr.password}
                  variant="filled"
                  color="secondary"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      borderRadius: 2,
                      bgcolor: "rgba(15,23,42,0.6)",
                      color: "#e5e7eb",
                      "&:hover": { bgcolor: "rgba(15,23,42,0.7)" },
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        {/* lock icon */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPw ? "Hide password" : "Show password"}>
                          <IconButton
                            size="small"
                            onClick={() => setShowPw((s) => !s)}
                            edge="end"
                            sx={{ color: "#cbd5e1" }}
                          >
                            {showPw ? (
                              // eye-off
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a21.86 21.86 0 0 1 5.06-6.94" />
                                <path d="M1 1l22 22" />
                                <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                                <path d="M14.12 14.12 20 20" />
                                <path d="M3.51 3.51 9.88 9.88" />
                              </svg>
                            ) : (
                              // eye
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8S1 12 1 12Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ sx: { color: "#9ca3af" } }}
                />

                {/* Submit button — centered & larger (not disabled for validation) */}
                <Stack direction="row" justifyContent="center" sx={{ mt: 1.5 }}>
                  <Box sx={{ position: "relative", display: "inline-block", width: { xs: "100%", sm: "auto" } }}>
                    <Button
                      type="submit"
                      disabled={loading}
                      variant="contained"
                      sx={{
                        width: { xs: "100%", sm: "auto" },
                        minWidth: { xs: "100%", sm: 260 },
                        px: 5,
                        py: 1.6,
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: 16,
                        letterSpacing: 0.3,
                        background:
                          "linear-gradient(90deg,#a78bfa 0%, #60a5fa 40%, #22d3ee 100%)",
                        boxShadow:
                          "0 12px 24px rgba(99,102,241,0.38), 0 3px 8px rgba(34,211,238,0.28)",
                        "&:hover": {
                          opacity: 0.96,
                          boxShadow:
                            "0 16px 32px rgba(99,102,241,0.48), 0 8px 14px rgba(34,211,238,0.36)",
                        },
                        "&.Mui-disabled": {
                          color: "#cbd5e1 !important",
                          background:
                            "linear-gradient(90deg,#475569 0%, #334155 100%) !important",
                        },
                      }}
                    >
                      <span style={{ opacity: loading ? 0 : 1 }}>Create account</span>
                    </Button>
                    {loading && (
                      <CircularProgress
                        size={22}
                        sx={{
                          color: "#fff",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          mt: "-11px",
                          ml: "-11px",
                        }}
                      />
                    )}
                  </Box>
                </Stack>

                {/* Link below button */}
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ mt: 1.5, color: "rgba(226,232,240,0.85)" }}
                >
                  Already have an account?{" "}
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      textTransform: "none",
                      px: 0.5,
                      minWidth: 0,
                      color: "#c7d2fe",
                      fontWeight: 700,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Log in
                  </Button>
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Fade>
      </div>

      {/* keyframes for shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-[shake_400ms_ease-in-out] {
          animation: shake 400ms ease-in-out;
        }
      `}</style>
    </div>
  );
}
