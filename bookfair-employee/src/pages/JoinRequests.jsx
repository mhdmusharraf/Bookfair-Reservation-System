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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { fetchAllReservations } from "../api/reservations";

const JoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await fetchAllReservations();
        if (!active) return;
        setRequests(data ?? []);
      } catch (err) {
        if (!active) return;
        const message =
          err?.response?.data?.message || err?.message || "Unable to load reservations";
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

  const removeRequest = (id) => {
    setRequests((prev) => prev.filter((request) => request.id !== id));
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
      <Table sx={{ minWidth: 650 }} aria-label="reservation requests table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Business Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Phone Number</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">
              Stalls requested
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
                No reservation activity yet.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell component="th" scope="row">
                  {request.vendorBusinessName}
                </TableCell>
                <TableCell>{request.vendorEmail}</TableCell>
                <TableCell>{request.vendorContactNumber}</TableCell>
                <TableCell align="center">
                  {request.stalls?.length ?? request.totalReservedStalls ?? 0}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => removeRequest(request.id)}>
                    <CheckIcon color="success" />
                  </IconButton>
                  <IconButton onClick={() => removeRequest(request.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
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
