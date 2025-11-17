import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Typography, CircularProgress, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { createStompClient } from "../utils/simpleStomp";

export default function VendorApprovalGate({ children }) {
  const { user, token, updateUser } = useAuth();
  const [open, setOpen] = useState(() => user?.status && user.status !== "ACTIVE");
  const [lastDecision, setLastDecision] = useState(null);

  const shouldBlock = useMemo(() => user?.status && user.status !== "ACTIVE", [user]);

  useEffect(() => {
    setOpen(shouldBlock);
  }, [shouldBlock]);

  useEffect(() => {
    if (!token || !shouldBlock) {
      return;
    }
    const client = createStompClient(token);
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
  }, [token, shouldBlock, updateUser]);

  return (
    <>
      {children}
      <Dialog open={open} fullWidth maxWidth="sm">
        <DialogTitle className="font-bold">Awaiting employee approval</DialogTitle>
        <DialogContent>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography align="center">
              We notified the employee team that <strong>{user?.businessName}</strong> is ready to access the
              dashboard. The page will unlock automatically once they approve the request.
            </Typography>
            {lastDecision && lastDecision.decision !== "APPROVED" && (
              <Typography color="error" variant="body2">
                {lastDecision.decision}
              </Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
