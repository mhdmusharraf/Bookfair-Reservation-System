import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Divider,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Tooltip,
  IconButton,
  Modal,
  Chip,
  CircularProgress,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

import StallLegend from "../components/StallLegend";
import StallSvgMap from "../components/StallSvgMap";
import { fetchStalls } from "../api/stalls";
import { fetchAllReservations } from "../api/reservations";
import { fetchDashboard } from "../api/dashboard";

function initials(label = "") {
  return label
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

export default function Dashboard() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestModalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [stallRes, reservationRes, dashboardRes] = await Promise.all([
          fetchStalls(),
          fetchAllReservations(),
          fetchDashboard(),
        ]);

        if (!active) {
          return;
        }

        setStalls(stallRes.data ?? []);
        setReservations(reservationRes.data ?? []);
        setStats(dashboardRes.data ?? null);
      } catch (err) {
        if (!active) return;
        const message =
          err?.response?.data?.message || err?.message || "Failed to load data";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const reservedCount = useMemo(
    () => stalls.filter((stall) => stall.reserved).length,
    [stalls]
  );

  const availableCount = useMemo(
    () => stalls.filter((stall) => !stall.reserved).length,
    [stalls]
  );

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setRequestModalOpen(true);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setRequestModalOpen(false);
  };

  const latestReservations = useMemo(
    () => reservations.slice(0, 10),
    [reservations]
  );

  return (
    <div className="flex flex-col gap-4 bg-gray-50 p-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Paper className="p-4">
          <Typography variant="subtitle2" color="text.secondary">
            Total stalls
          </Typography>
          <Typography variant="h5" className="font-bold">
            {stats?.totalStalls ?? "--"}
          </Typography>
        </Paper>
        <Paper className="p-4">
          <Typography variant="subtitle2" color="text.secondary">
            Available stalls
          </Typography>
          <Typography variant="h5" className="font-bold">
            {stats?.availableStalls ?? availableCount}
          </Typography>
        </Paper>
        <Paper className="p-4">
          <Typography variant="subtitle2" color="text.secondary">
            Reserved stalls
          </Typography>
          <Typography variant="h5" className="font-bold">
            {stats?.reservedStalls ?? reservedCount}
          </Typography>
        </Paper>
      </div>

      {error && (
        <Paper className="p-3 bg-red-100 text-red-800 border border-red-200">
          {error}
        </Paper>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <CircularProgress />
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row w-full gap-4">
          {/* Stall Map Section */}
          <Paper className="p-4 xl:w-3/5">
            <div className="flex items-center justify-between">
              <Typography variant="h6" className="font-bold">
                Stall Map
              </Typography>
              <div className="flex items-center gap-2">
                <Typography variant="body2" color="text.secondary">
                  {availableCount} available / {reservedCount} reserved
                </Typography>
                <StallLegend />
              </div>
            </div>
            <Divider className="my-3" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <StallSvgMap
                  stalls={stalls}
                  onSelect={(stall) => setSelectedStall(stall)}
                />
              </div>
            </div>
          </Paper>

          {/* Stall Details Section */}
          <Paper className="p-4 xl:w-1/5">
            <Typography variant="h6" className="font-bold mb-2">
              Stall Details
            </Typography>
            {selectedStall ? (
              <>
                <Typography variant="subtitle1">
                  <strong>Stall Code:</strong> {selectedStall.code}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Size:</strong> {selectedStall.size}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Status:</strong> {selectedStall.status}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select a stall from the map to view details
              </Typography>
            )}
          </Paper>

          {/* Reservation Requests Section */}
          <Paper className="p-4 xl:w-2/5">
            <div className="flex items-center justify-between">
              <Typography variant="subtitle1" className="font-semibold mb-2">
                Recent reservations
              </Typography>
              <Button size="small" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <List
                dense
                sx={{ width: "100%", maxWidth: 520, bgcolor: "background.paper" }}
              >
                {latestReservations.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No reservations yet" />
                  </ListItem>
                ) : (
                  latestReservations.map((reservation) => {
                    const labelId = `reservation-${reservation.id}`;
                    return (
                      <ListItem
                        key={reservation.id}
                        secondaryAction={
                          <Box>
                            <Tooltip title="View details">
                              <IconButton
                                onClick={() => openRequestDetails(reservation)}
                              >
                                <ReceiptIcon sx={{ color: "blue" }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mark as reviewed">
                              <IconButton>
                                <CheckIcon sx={{ color: "green" }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton>
                                <CancelIcon sx={{ color: "red" }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                        disablePadding
                      >
                        <ListItemButton
                          onClick={() => openRequestDetails(reservation)}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              {initials(reservation.vendorBusinessName)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            id={labelId}
                            primary={reservation.vendorBusinessName}
                            secondary={
                              reservation.stalls?.length
                                ? reservation.stalls.join(", ")
                                : "No stalls recorded"
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Box>
          </Paper>
        </div>
      )}

      {/* Modal for Reservation Details */}
      <Modal open={isRequestModalOpen} onClose={closeRequestDetails}>
        <Box sx={requestModalStyle}>
          {selectedRequest && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {selectedRequest.vendorBusinessName}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Email: {selectedRequest.vendorEmail}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Contact: {selectedRequest.vendorContactNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Confirmation: {selectedRequest.confirmationCode}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Reserved on: {new Date(selectedRequest.reservedAt).toLocaleString()}
                  </Typography>
                </Box>
                <Tooltip title="View receipt">
                  <IconButton sx={{ marginRight: 2 }}>
                    <ReceiptIcon sx={{ color: "blue", fontSize: 40 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" className="font-semibold mb-2">
                Stalls
              </Typography>
              <Box className="flex flex-wrap gap-2">
                {(selectedRequest.stalls ?? []).map((stallCode) => (
                  <Chip key={stallCode} label={stallCode} />
                ))}
              </Box>

              <Box className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={closeRequestDetails}
                >
                  Close
                </Button>
                <Button variant="contained" color="primary">
                  Mark as reviewed
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}
