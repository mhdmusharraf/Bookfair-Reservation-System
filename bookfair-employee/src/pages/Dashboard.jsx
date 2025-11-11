import React from "react";
import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Box,
  List,
  ListItem,
  Checkbox,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Tooltip,
  IconButton,
  Modal,
} from "@mui/material";
import StallMap from "../components/StallMap";
import StallLegend from "../components/StallLegend";
import { fetchStalls } from "../api/stalls";
// import { useAuth } from "../context/AuthContext";
import dummyRequests from "../data/dummyRequests.js";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

export default function Dashboard() {
  const [stalls, setStalls] = useState([]);
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [open, setOpen] = React.useState(false);
  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setOpen(true);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setOpen(false);
  };
  // const [warn, setWarn] = useState("");
  // const [info, setInfo] = useState("");
  // const { user } = useAuth();

  // const [checked, setChecked] = useState([1]);

  // const handleToggle = (value) => () => {
  //   const currentIndex = checked.indexOf(value);
  //   const newChecked = [...checked];

  //   if (currentIndex === -1) {
  //     newChecked.push(value);
  //   } else {
  //     newChecked.splice(currentIndex, 1);
  //   }

  //   setChecked(newChecked);
  // };

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

  useEffect(() => {
    (async () => {
      const { data } = await fetchStalls();
      setStalls(data);
    })();
  }, []);

  // const toggleStall = (stall) => {
  //   // booked stalls already disabled
  //   const next = new Set(selectedIds);
  //   if (next.has(stall.id)) {
  //     next.delete(stall.id);
  //   } else {
  //     if (next.size >= 3) {
  //       setWarn("Maximum 3 stalls can be selected per business.");
  //       return;
  //     }
  //     next.add(stall.id);
  //   }
  //   setSelectedIds(next);
  // };

  return (
    <div className="space-y-4 flex flex-row w-full gap-4 bg-black">
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
            <StallMap
              stalls={stalls}
              sizeFilter={sizeFilter}
              onSizeChange={setSizeFilter}
              selectedIds={selectedIds}
              // onToggle={toggleStall}
            />
          </div>
        </div>
      </Paper>

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
                      <Tooltip title="View Reciept">
                        <IconButton>
                          <ReceiptIcon sx={{ color: "blue" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Conform Request">
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
                  {/* <Checkbox
                    edge="end"
                    onChange={handleToggle(request.id)}
                    checked={checked.includes(request.id)}
                    inputProps={{ "aria-labelledby": labelId }}
                  /> */}
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

      <Modal open={open} onClose={closeRequestDetails}>
        <Box sx={requestModelStyle}>
          {selectedRequest && (
            <>
              <Box sx={{display:"flex", justifyContent:"space-between"}}>
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
                <Tooltip title="View Reciept">
                  <IconButton sx={{marginRight:10}}>
                    <ReceiptIcon sx={{ color: "blue", fontSize:48 }} />
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
