import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Typography, Button, Snackbar, Alert, Divider, Stack,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress,
  List, ListItem, ListItemText, IconButton,
  Chip, Tooltip, Avatar, LinearProgress, ListItemAvatar
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import StallSvgMap from "../components/StallSvgMap";
import StallLegend from "../components/StallLegend";
import GenreSelector from "../components/GenreSelector";
import PricingCard from "../components/PricingCard";
import { fetchStalls, reserveStalls } from "../api/stalls";
import { fetchMyReservedStallCodes } from "../api/reservations";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [stalls, setStalls] = useState([]);
  const [myReservedCodes, setMyReservedCodes] = useState(new Set());
  const [warn, setWarn] = useState("");
  const [info, setInfo] = useState("");

  const { user } = useAuth();

  // cart: Map<stallId, { stall, label, genres[] }>
  const [selectedStalls, setSelectedStalls] = useState(new Map());

  // genre modal state
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [currentStall, setCurrentStall] = useState(null);
  const [currentLabel, setCurrentLabel] = useState(""); // S-## / M-## / L-##
  const [tempGenres, setTempGenres] = useState([]);

  // confirm & payment
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await fetchStalls();
      if (!active) return;

      setStalls(data);

      const email = user?.email;
      if (!email) {
        setMyReservedCodes(new Set());
        return;
      }

      try {
        const { data: codes } = await fetchMyReservedStallCodes(email, data);
        if (!active) return;
        setMyReservedCodes(new Set(codes));
      } catch (err) {
        console.error("Failed to load reservations", err);
        if (!active) return;
        setMyReservedCodes(new Set());
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const selectedStallIds = useMemo(
    () => new Set(selectedStalls.keys()),
    [selectedStalls]
  );

  const bookedCount = useMemo(
    () => myReservedCodes.size,
    [myReservedCodes]
  );

  const reservedStallsForUser = useMemo(
    () => stalls.filter(stall => myReservedCodes.has(stall.code ?? stall.id)),
    [stalls, myReservedCodes]
  );

  // Accept label from map (S-## / M-## / L-##)
  const handleStallClick = (stall, label) => {
    if (!stall || stall.reserved) return;

    if (selectedStalls.has(stall.id)) {
      const next = new Map(selectedStalls);
      next.delete(stall.id);
      setSelectedStalls(next);
    } else {
      if (selectedStalls.size + bookedCount >= 3) {
        setWarn("Maximum 3 stalls can be selected per business.");
        return;
      }
      setCurrentStall(stall);
      setCurrentLabel(label ?? stall.code);
      setTempGenres([]);
      setIsGenreModalOpen(true);
    }
  };

  const handleSaveStallAndGenres = () => {
    if (tempGenres.length === 0) {
      setWarn("Please select at least one genre for this stall.");
      return;
    }
    const next = new Map(selectedStalls);
    next.set(currentStall.id, { stall: currentStall, label: currentLabel, genres: tempGenres });
    setSelectedStalls(next);
    setIsGenreModalOpen(false);
    setCurrentStall(null);
    setCurrentLabel("");
  };

  const handleOpenConfirmModal = () => {
    if (selectedStalls.size === 0) {
      setWarn("You have not selected any stalls to reserve.");
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleProceedToPayment = () => {
    setConfirmModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleFinalConfirm = async () => {
    setIsReserving(true);

    const reservations = Array.from(selectedStalls.values()).map(item => ({
      stallId: item.stall.id,
      genres: item.genres,
    }));

    try {
      const { data } = await reserveStalls({ reservations, userEmail: user.email });
      const reservedList = Array.isArray(data?.reserved) ? data.reserved : (data?.stalls ?? []);
      const reservedCount = reservedList.length || reservations.length;
      setInfo(`Reserved ${reservedCount} stall(s) successfully.`);

      const { data: fresh } = await fetchStalls();
      setStalls(fresh);

      const { data: codes } = await fetchMyReservedStallCodes(user.email, fresh);
      setMyReservedCodes(new Set(codes));
      setSelectedStalls(new Map());
      // TODO: Show QR using data.qrUrl if needed
    } catch {
      setWarn("Reservation failed.");
    } finally {
      setIsReserving(false);
    }
  };

  const handleMockPaymentAndReserve = async () => {
    setIsPaymentModalOpen(false);
    await handleFinalConfirm();
  };

  // --- Confirm modal pricing helpers ---
  const PRICES = { SMALL: 40000, MEDIUM: 70000, LARGE: 100000 };
  const currency = useMemo(
    () => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }),
    []
  );
  const confirmLines = useMemo(
    () => Array.from(selectedStalls.values()),
    [selectedStalls]
  );
  const sizeCounts = useMemo(() => {
    const acc = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
    confirmLines.forEach(({ stall }) => {
      if (stall?.size && acc[stall.size] !== undefined) acc[stall.size] += 1;
    });
    return acc;
  }, [confirmLines]);
  const estimatedTotal = useMemo(
    () => confirmLines.reduce((sum, { stall }) => sum + (PRICES[stall.size] || 0), 0),
    [confirmLines]
  );

  return (
    <div className="space-y-4">
      {/* ===== Row 1: Pricing strip under navbar (full width, horizontal) ===== */}
      <PricingCard selectedStalls={selectedStalls} />

      {/* ===== Row 2: Map (left) + Cart (right) side-by-side ===== */}
      <Paper className="p-4">
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="font-bold">Stall Map</Typography>
          <StallLegend />
        </div>
        <Divider className="my-3" />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Map (2/3) */}
          <div className="md:col-span-2">
            <StallSvgMap
              stalls={stalls}
              selectedIds={selectedStallIds}
              onToggle={handleStallClick} // receives (stall, label)
            />
          </div>

          {/* Reservation Cart (1/3) */}
          <div className="space-y-3">
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: (t) => `0 6px 22px ${t.palette.primary.main}11`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <Typography variant="subtitle1" fontWeight={800}>
                  Your Reservation Cart
                </Typography>

                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip size="small" label={`In Cart: ${selectedStalls.size}`} />
                  <Chip size="small" color="error" variant="outlined" label={`Booked: ${bookedCount}`} />
                  <Chip
                    size="small"
                    color={(selectedStalls.size + bookedCount) >= 3 ? "error" : "success"}
                    label={`Remaining: ${Math.max(0, 3 - (selectedStalls.size + bookedCount))}`}
                  />
                </Stack>
              </div>

              {/* Limit progress */}
              <Stack spacing={0.5} sx={{ mt: 1.5, mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, ((selectedStalls.size + bookedCount) / 3) * 100)}
                  color={(selectedStalls.size + bookedCount) >= 3 ? "error" : "primary"}
                  sx={{ height: 8, borderRadius: 5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedStalls.size + bookedCount} / 3 used
                </Typography>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              {/* Items */}
              <List dense sx={{ maxHeight: 240, overflow: "auto" }}>
                {Array.from(selectedStalls.values()).map((item) => {
                  const size = item.stall.size; // SMALL | MEDIUM | LARGE
                  const sizeColor =
                    size === "SMALL" ? { bg: "success.light", fg: "success.contrastText" } :
                    size === "MEDIUM" ? { bg: "primary.light", fg: "primary.contrastText" } :
                    { bg: "warning.light", fg: "warning.contrastText" };

                  return (
                    <ListItem
                      key={item.stall.id}
                      sx={{
                        mb: 0.5,
                        borderRadius: 2,
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                      secondaryAction={
                        <Tooltip title="Remove from Cart">
                          <IconButton edge="end" aria-label="delete" onClick={() => handleStallClick(item.stall)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: sizeColor.bg,
                            color: sizeColor.fg,
                            fontWeight: 900,
                            width: 36,
                            height: 36,
                            fontSize: 14,
                          }}
                        >
                          {size?.[0] ?? "?"}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography fontWeight={800} variant="body1">
                              {item.label ?? item.stall.code}
                            </Typography>
                            <Chip size="small" variant="outlined" label={size ?? "—"} />
                          </Stack>
                        }
                        secondary={
                          item.genres?.length ? (
                            <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                              {item.genres.map((g) => (
                                <Chip key={g} label={g} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              No genres added
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>

              {/* Empty state */}
              {selectedStalls.size === 0 && (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    minHeight: 120,
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.default",
                  }}
                  spacing={1}
                >
                  <Typography variant="body1" fontWeight={700}>
                    Cart is empty
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click an available stall on the map to add it here.
                  </Typography>
                </Stack>
              )}
            </Paper>

            <Button
              onClick={handleOpenConfirmModal}
              variant="contained"
              disabled={isReserving || selectedStalls.size === 0}
              fullWidth
            >
              {isReserving ? <CircularProgress size={24} /> : `Confirm ${selectedStalls.size} Stall(s)`}
            </Button>
          </div>
        </div>
      </Paper>

      {/* Already reserved list */}
      <Paper className="p-4">
        <Typography variant="subtitle1" className="font-semibold mb-2">Already Reserved Stalls</Typography>
        <div className="flex flex-wrap gap-2">
          {reservedStallsForUser.map(s => (
            <span key={s.id} className="badge bg-red-500 text-white">{s.code}</span>
          ))}
          {bookedCount === 0 && (
            <Typography variant="body2" color="text.secondary">No stalls reserved yet.</Typography>
          )}
        </div>
      </Paper>

      {/* Snackbars */}
      <Snackbar open={!!warn} autoHideDuration={3000} onClose={() => setWarn("")}>
        <Alert onClose={() => setWarn("")} severity="warning" variant="filled">{warn}</Alert>
      </Snackbar>
      <Snackbar open={!!info} autoHideDuration={2500} onClose={() => setInfo("")}>
        <Alert onClose={() => setInfo("")} severity="success" variant="filled">{info}</Alert>
      </Snackbar>

      {/* Genre modal */}
      <Dialog open={isGenreModalOpen} onClose={() => setIsGenreModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Add Genres for Stall: <b>{currentLabel || currentStall?.code}</b>
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="mb-4">
            Select the literary genres you will display in this stall.
          </DialogContentText>
          <GenreSelector value={tempGenres} onChange={setTempGenres} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGenreModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStallAndGenres} variant="contained">
            Add Stall to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm modal */}
      <Dialog open={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review & Confirm Reservation</DialogTitle>

        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to reserve <b>{selectedStalls.size}</b> stall(s). Please review the details below.
          </Alert>

          <List
            dense
            sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: 260, overflow: "auto" }}
          >
            {confirmLines.map((item) => {
              const size = item.stall.size; // SMALL | MEDIUM | LARGE
              const sizeColors =
                size === "SMALL" ? { bg: "success.light", fg: "success.contrastText" } :
                size === "MEDIUM" ? { bg: "primary.light", fg: "primary.contrastText" } :
                { bg: "warning.light", fg: "warning.contrastText" };
              const price = PRICES[size] || 0;

              return (
                <ListItem
                  key={item.stall.id}
                  sx={{ "&:not(:last-of-type)": { borderBottom: "1px solid", borderColor: "divider" } }}
                  secondaryAction={
                    <Typography variant="body2" fontWeight={800}>
                      {currency.format(price)}
                    </Typography>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: sizeColors.bg,
                        color: sizeColors.fg,
                        fontWeight: 900,
                        width: 36,
                        height: 36,
                        fontSize: 14,
                      }}
                    >
                      {size?.[0] ?? "?"}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography fontWeight={800} variant="body1">
                          {item.label ?? item.stall.code}
                        </Typography>
                        <Chip size="small" variant="outlined" label={size ?? "—"} />
                      </Stack>
                    }
                    secondary={
                      item.genres?.length ? (
                        <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                          {item.genres.map((g) => (
                            <Chip key={g} label={g} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          No genres added
                        </Typography>
                      )
                    }
                  />
                </ListItem>
              );
            })}

            {confirmLines.length === 0 && (
              <ListItem>
                <ListItemText
                  primary={<Typography fontWeight={700}>No stalls selected</Typography>}
                  secondary="Close this dialog and pick stalls from the map."
                />
              </ListItem>
            )}
          </List>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mt: 2 }}
            gap={1.5}
          >
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip size="small" label={`Small × ${sizeCounts.SMALL}`} />
              <Chip size="small" label={`Medium × ${sizeCounts.MEDIUM}`} />
              <Chip size="small" label={`Large × ${sizeCounts.LARGE}`} />
            </Stack>
            <Stack direction="row" alignItems="baseline" gap={1}>
              <Typography variant="subtitle2" color="text.secondary">Estimated Total:</Typography>
              <Typography variant="h6" fontWeight={900}>{currency.format(estimatedTotal)}</Typography>
            </Stack>
          </Stack>

          <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>
            This action is final and cannot be undone after payment.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmModalOpen(false)} color="inherit">Back</Button>
          <Button onClick={handleProceedToPayment} variant="contained" autoFocus>
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment mock (keep for now, or swap to Stripe dialog per earlier step) */}
      <Dialog open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <DialogTitle>Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is where the payment gateway integration will go.
            <br /><br />
            Total Amount: <b>{currency.format(estimatedTotal)}</b>
            <br /><br />
            Clicking "Pay Now" will complete the reservation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPaymentModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleMockPaymentAndReserve} variant="contained" disabled={isReserving}>
            {isReserving ? <CircularProgress size={24} /> : "Pay Now (Mock)"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
