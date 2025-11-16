import React from "react";
import { useState } from "react";
import { 
  Paper, TextField, Button, Typography,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, CircularProgress,
  Stack
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { signupVendor } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); 
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await signupVendor({ businessName, email, password, phone });
      
      setIsSuccessModalOpen(true);

    } catch {
      setErr("Signup failed. Please try again.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    nav("/login");
  };


return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
    <Paper 
      elevation={6} 
      className="p-8 w-full max-w-md rounded-xl"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <Typography variant="h4" className="font-bold text-center mb-2">
        Vendor Signup
      </Typography>

      <Typography 
        variant="body2" 
        className="text-center text-gray-600 mb-6"
      >
        Register to participate in the Book Fair stall reservation system
      </Typography>

      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          fullWidth
          label="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
            className="text-center"
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
            {loading ? <CircularProgress size={24} /> : "Create Account"}
          </Button>

          <Button 
            component={Link} 
            to="/login" 
            fullWidth 
            variant="text"
          >
            Back to Login
          </Button>
        </Stack>
      </form>
    </Paper>

    {/* SUCCESS MODAL */}
    <Dialog open={isSuccessModalOpen} onClose={handleCloseSuccessModal}>
      <DialogTitle>
        <Box className="flex items-center gap-2">
          <CheckCircleIcon color="success" />
          Application Submitted
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Thank you! Your vendor application has been submitted for review.
          Once approved, you will be able to log in and reserve your stall.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleCloseSuccessModal} 
          variant="contained" 
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  </div>
);

}