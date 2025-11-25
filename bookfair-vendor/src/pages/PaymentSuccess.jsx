import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "../context/AuthContext";
import { createStompClient } from "../utils/simpleStomp";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, isAuthenticating } = useAuth();

  const [reservation, setReservation] = useState(null);
  const [connectionError, setConnectionError] = useState("");

  const reservationSummary = useMemo(() => {
    if (!reservation) return null;
    const stallList = reservation.stalls?.join(", ") || "";
    return `${reservation.totalReservedStalls ?? reservation.stalls?.length ?? 0} stall(s): ${stallList}`;
  }, [reservation]);

  useEffect(() => {
    if (isAuthenticating) return undefined;
    if (!user) {
      navigate("/login", { replace: true });
      return undefined;
    }

    const client = createStompClient();
    client.connect(
      undefined,
      () => setConnectionError("Unable to connect to live updates. Please refresh if this persists."),
    );

    const subscriptionId = client.subscribe("/topic/reservations/recent", (payload) => {
      if (!payload) return;
      if (payload.vendorEmail && payload.vendorEmail !== user.email) return;
      setReservation(payload);
      setTimeout(() => navigate("/"), 2000);
    });

    return () => {
      client.unsubscribe(subscriptionId);
      client.disconnect();
    };
  }, [isAuthenticating, navigate, user]);

  return (
    <div className="flex justify-center py-10 px-4">
      <Paper className="max-w-2xl w-full p-6 space-y-6">
        <Stack spacing={2} alignItems="center" textAlign="center">
          <CheckCircleIcon color="success" sx={{ fontSize: 56 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Payment successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We received your payment{sessionId ? ` (Session ${sessionId})` : ""}. Hang tight while we finalize your reservation.
          </Typography>

          {!reservation && (
            <Stack spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <CircularProgress color="success" />
              <Typography variant="body2" color="text.secondary">
                Waiting for reservation confirmation...
              </Typography>
            </Stack>
          )}

          {reservation && (
            <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
              Reservation confirmed! {reservation.confirmationCode ? `Code: ${reservation.confirmationCode}. ` : ""}
              {reservationSummary}
            </Alert>
          )}

          {connectionError && (
            <Alert severity="warning" sx={{ width: "100%" }}>{connectionError}</Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate("/")}
            disabled={!reservation}
          >
            Go to dashboard
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
