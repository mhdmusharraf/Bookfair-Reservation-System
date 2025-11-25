import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Chip,
} from "@mui/material";
import { fetchPayments } from "../api/payments";
import { createStompClient } from "../utils/simpleStomp";
import { useNotifications } from "../context/NotificationContext";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { markByType } = useNotifications();

  useEffect(() => {
    let active = true;
    const normalizePayment = (payment) => ({
      ...payment,
      stalls: payment?.stalls ?? payment?.stallCodes ?? [],
    });

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await fetchPayments();
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const paid = list
          .filter((item) => item?.status === "SUCCEEDED")
          .map(normalizePayment)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPayments(paid);
      } catch (err) {
        if (!active) return;
        const message = err?.response?.data?.message || err?.message || "Unable to load payments";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    markByType("PAYMENT_RECEIVED");

    return () => {
      active = false;
    };
  }, [markByType]);

  useEffect(() => {
    const client = createStompClient();
    client.connect();
    const subId = client.subscribe("/topic/payments/history", (payload) => {
      if (!payload?.id || payload?.status !== "SUCCEEDED") return;
      setPayments((prev) => {
        const others = prev.filter((item) => item.id !== payload.id);
         const normalized = {
          ...payload,
          stalls: payload?.stalls ?? payload?.stallCodes ?? [],
        };
        return [normalized, ...others].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });

    return () => {
      client.unsubscribe(subId);
      client.disconnect();
    };
  }, []);

  const rows = useMemo(() => payments ?? [], [payments]);

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
      <Table sx={{ minWidth: 650 }} aria-label="payment history table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Business Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Stalls</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">
              Paid At
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No payment history yet.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((payment) => {
              const amount = payment.amount ?? 0;
              const currency = (payment.currency || "LKR").toUpperCase();
              const formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
              });
              const dateLabel = payment.createdAt
                ? new Date(payment.createdAt).toLocaleString()
                : "—";
              return (
                <TableRow key={payment.id}>
                  <TableCell component="th" scope="row">
                    {payment.vendorBusinessName || "Unknown"}
                  </TableCell>
                  <TableCell>{payment.vendorEmail || "—"}</TableCell>
                  <TableCell>{payment.vendorContactNumber || "—"}</TableCell>
                  <TableCell>
                    {Array.isArray(payment.stalls) && payment.stalls.length
                      ? payment.stalls.join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>{formatter.format(amount / 100)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={payment.status}
                      color={payment.status === "SUCCEEDED" ? "success" : payment.status === "PENDING" ? "warning" : "error"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">{dateLabel}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentHistory;
