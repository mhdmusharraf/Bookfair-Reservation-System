import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, Typography, CircularProgress, Stack, Button, Box, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from "../context/AuthContext";
import { createStompClient } from "../utils/simpleStomp";
import { useNavigate } from "react-router-dom";

export default function VendorApprovalGate({ children }) {
  const { user, updateUser, logout } = useAuth();
  const [open, setOpen] = useState(() => user?.status && user.status !== "ACTIVE");
  const [lastDecision, setLastDecision] = useState(null);
  const nav = useNavigate();

  const shouldBlock = useMemo(() => user?.status && user.status !== "ACTIVE", [user]);

  useEffect(() => {
    setOpen(shouldBlock);
  }, [shouldBlock]);

  useEffect(() => {
    if (!user || !shouldBlock) {
      return;
    }
    const client = createStompClient();
    client.connect();
    const subId = client.subscribe("/user/queue/vendor-access", (payload) => {
      setLastDecision(payload);
      if (payload?.decision === "APPROVED") {
        updateUser((prev) => ({ ...(prev || {}), status: "ACTIVE", approvedAt: payload.decidedAt }));
      }
    });
    return () => {
      client.unsubscribe(subId);
      client.disconnect();
    };
  }, [user?.id, shouldBlock, updateUser]);

  // New function to handle redirection
  const handleExit = () => {
    if (logout) logout(); 
    nav("/login");
  };

  return (
    <>
      {children}
      <Dialog 
        open={open} 
        fullWidth 
        maxWidth="xs" 
        PaperProps={{ sx: { borderRadius: 4, padding: 2 } }}
      >
        <IconButton 
          onClick={handleExit}
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent>
          <Stack spacing={3} alignItems="center" textAlign="center" mt={1}>
            <Box position="relative" display="inline-flex">
              <CircularProgress size={60} thickness={4} />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Awaiting Employee Approval
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We notified the employee team that <strong>{user?.businessName}</strong> is ready to access the
                dashboard.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                The page will unlock automatically once they approve the request.
              </Typography>
            </Box>

            {lastDecision && lastDecision.decision !== "APPROVED" && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'error.main', 
                  bgcolor: 'error.lighter', 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontWeight: 'medium'
                }}
              >
                Status: {lastDecision.decision}
              </Typography>
            )}

            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={handleExit}
              sx={{ borderRadius: 50, px: 4, textTransform: 'none' }}
            >
              Back to Login
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}