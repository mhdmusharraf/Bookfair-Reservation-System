import React, { useEffect, useMemo, useState } from "react";
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

import { fetchAllReservations } from "../api/reservations";

const RegisteredBusinesses = () => {
  const [reservations, setReservations] = useState([]);
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
        setReservations(data ?? []);
      } catch (err) {
        if (!active) return;
        const message =
          err?.response?.data?.message || err?.message || "Unable to load businesses";
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

  const businesses = useMemo(() => {
    const map = new Map();
    reservations.forEach((reservation) => {
      const key = reservation.vendorEmail;
      if (!key) {
        return;
      }
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          businessName: reservation.vendorBusinessName,
          email: reservation.vendorEmail,
          phoneNumber: reservation.vendorContactNumber,
          stalls: new Set(),
        });
      }
      const entry = map.get(key);
      (reservation.stalls ?? []).forEach((stall) => entry.stalls.add(stall));
    });
    return Array.from(map.values()).map((entry) => ({
      ...entry,
      stalls: Array.from(entry.stalls).sort(),
    }));
  }, [reservations]);

  const deleteBusiness = (id) => {
    setReservations((prev) => prev.filter((reservation) => reservation.vendorEmail !== id));
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
      <Table sx={{ minWidth: 650 }} aria-label="registered businesses table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Business Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Phone Number</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">
              Stalls - Genre
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {businesses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No registered businesses yet.
              </TableCell>
            </TableRow>
          ) : (
            businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell component="th" scope="row">
                  {business.businessName}
                </TableCell>
                <TableCell>{business.email}</TableCell>
                <TableCell>{business.phoneNumber}</TableCell>
                <TableCell align="center">
                  {business.stalls.length ? business.stalls.join(", ") : "—"}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => deleteBusiness(business.id)}>
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

export default RegisteredBusinesses;
