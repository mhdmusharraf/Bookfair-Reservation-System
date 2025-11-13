import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import StallLegend from "../components/StallLegend";
// import { fetchStalls } from "../api/stalls";
import dummyRequests from "../data/dummyRequests";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import StallSvgMap from "../components/StallSvgMap";
import dummyStalls from "../data/dummyStalls.js"


export default function Dashboard() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setOpen(true);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setOpen(false);
  };

  const requestModelStyle = {
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

  // useEffect(() => {
  //   const loadStalls = async () => {
  //     try {
  //       const { data } = await fetchStalls();
  //       setStalls(data || []);
  //     } catch (error) {
  //       console.error("Error fetching stalls:", error);
  //     }
  //   };
  //   loadStalls();
  // }, []);

  useEffect(() => {
    // Mocking API call
    setTimeout(() => {
      setStalls(dummyStalls);
    }, 500); // simulates loading delay
  }, []);

  return (
    <div className="flex flex-row w-full gap-4 bg-gray-50 p-4">
      {/* Stall Map Section */}
      <Paper className="p-4 w-3/5">
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="font-bold">
            Stall Map
          </Typography>
          <StallLegend />
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
      {selectedStall && (
        <Paper className="p-4 w-1/5">
          <Typography variant="h6" className="font-bold mb-2">
            Stall Details
          </Typography>
          <Typography variant="subtitle1">
            <strong>Stall Code:</strong> {selectedStall.code}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Size:</strong> {selectedStall.size}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Status:</strong> {selectedStall.status}
          </Typography>
        </Paper>
      )}

      {/* Stall Requests Section */}
      <Paper className="p-4 w-2/5">
        <Typography variant="subtitle1" className="font-semibold mb-2">
          Stall Requests
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <List
            dense
            sx={{ width: "100%", maxWidth: 480, bgcolor: "background.paper" }}
          >
            {dummyRequests.map((request) => {
              const labelId = `checkbox-list-secondary-label-${request.id}`;
              return (
                <ListItem
                  key={request.id}
                  secondaryAction={
                    <Box>
                      <Tooltip title="View Receipt">
                        <IconButton onClick={() => openRequestDetails(request)}>
                          <ReceiptIcon sx={{ color: "blue" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Confirm Request">
                        <IconButton>
                          <CheckIcon sx={{ color: "green" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject Request">
                        <IconButton>
                          <CancelIcon sx={{ color: "red" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  disablePadding
                >
                  <ListItemButton onClick={() => openRequestDetails(request)}>
                    <ListItemAvatar>
                      <Avatar
                        alt={request.businessName}
                        src={request.avatarUrl}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      id={labelId}
                      primary={request.businessName}
                      secondary={request.requestedStalls
                        .map((stall) => stall.stallId)
                        .join(", ")}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Paper>

      {/* Modal for Request Details */}
      <Modal open={open} onClose={closeRequestDetails}>
        <Box sx={requestModelStyle}>
          {selectedRequest && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {selectedRequest.businessName}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Contact: {selectedRequest.phoneNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Requested Stalls:{" "}
                    {selectedRequest.requestedStalls
                      .map((s) => s.stallId)
                      .join(", ")}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Date: {selectedRequest.date || "N/A"}
                  </Typography>
                </Box>
                <Tooltip title="View Receipt">
                  <IconButton sx={{ marginRight: 2 }}>
                    <ReceiptIcon sx={{ color: "blue", fontSize: 40 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  marginTop: 4,
                }}
              >
                <Button startIcon={<CancelIcon />} color="error">
                  Reject Request
                </Button>
                <Button startIcon={<CheckIcon />} color="success">
                  Accept Request
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}
