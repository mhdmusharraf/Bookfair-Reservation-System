import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { fetchVendorAccessRequests, approveVendorAccess } from "../api/vendorAccess";
import { useAuth } from "../context/AuthContext";
import { createStompClient } from "../utils/simpleStomp";

const JoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await fetchVendorAccessRequests();
        if (!active) return;
        const sorted = (data ?? []).slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setRequests(sorted);
      } catch (err) {
        if (!active) return;
        const message =
          err?.response?.data?.message || err?.message || "Unable to load vendor requests";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const client = createStompClient();
    client.connect();
    const subId = client.subscribe("/topic/vendor-access/requests", (payload) => {
      if (!payload?.requestId) return;
      setRequests((prev) => {
        const others = prev.filter((item) => item.requestId !== payload.requestId);
        if (payload.status === "PENDING") {
          return [...others, payload].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        return others;
      });
    });
    return () => {
      client.unsubscribe(subId);
      client.disconnect();
    };
  }, [user?.id]);

  const handleApprove = async (requestId) => {
    try {
      await approveVendorAccess(requestId);
      setRequests((prev) => prev.filter((request) => request.requestId !== requestId));
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to approve request";
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <CircularProgress />
      </div>
    );
  }

  return (
    <TableContainer component={Paper}>
      {error && (
        <Typography color="error" variant="body2" className="p-3">
          {error}
        </Typography>
      )}
      <Table sx={{ minWidth: 650 }} aria-label="vendor access requests">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Business Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Phone Number</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">
              Requested At
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No vendors are waiting for approval.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.requestId}>
                <TableCell component="th" scope="row">
                  {request.businessName}
                </TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>{request.contactNumber}</TableCell>
                <TableCell align="center">
                  {request.createdAt ? new Date(request.createdAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Approve and unlock the dashboard">
                    <IconButton onClick={() => handleApprove(request.requestId)}>
                      <CheckIcon color="success" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JoinRequests;
