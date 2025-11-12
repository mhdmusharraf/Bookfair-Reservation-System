import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Paper, Typography, Button, Snackbar, Alert, Divider, Stack,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress,
  List, ListItem, ListItemText, IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete'; 
import StallSvgMap from "../components/StallSvgMap"; 
import StallLegend from "../components/StallLegend";
import GenreSelector from "../components/GenreSelector";
import { fetchStalls, reserveStalls } from "../api/stalls";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stalls, setStalls] = useState([]);
  const [sizeFilter, setSizeFilter] = useState("ALL"); 
  const [warn, setWarn] = useState("");
  const [info, setInfo] = useState("");
  const nav = useNavigate();
  const { user } = useAuth();

  const [selectedStalls, setSelectedStalls] = useState(new Map()); 
  
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [currentStall, setCurrentStall] = useState(null); 
  const [tempGenres, setTempGenres] = useState([]); 
  
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); 
  const [isReserving, setIsReserving] = useState(false);

  useEffect(()=> {
    (async ()=>{
      const { data } = await fetchStalls();
      setStalls(data);
    })();
  }, []);


  const selectedStallIds = useMemo(() => new Set(selectedStalls.keys()), [selectedStalls]);


  const bookedCount = useMemo(()=> stalls.filter(s=>s.status==="BOOKED" && s.reservedBy === user?.email).length, [stalls, user]);


  const handleStallClick = (stall) => {

    if (!stall || stall.status === 'BOOKED') return;

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
    next.set(currentStall.id, { stall: currentStall, genres: tempGenres });
    setSelectedStalls(next);
    setIsGenreModalOpen(false); 
    setCurrentStall(null);
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
      genres: item.genres
    }));

    try {
      const { data } = await reserveStalls({ reservations, userEmail: user.email });
      setInfo(`Reserved ${data.reserved.length} stall(s) successfully.`);
      
      const { data: fresh } = await fetchStalls();
      setStalls(fresh);
      setSelectedStalls(new Map()); 
      
      // QR Code Modal here

    } catch {
      setWarn("Reservation failed.");
    } finally {
      setIsReserving(false);
    }
  };

  // This function is for the "Pay Now (Mock)" button

  const handleMockPaymentAndReserve = async () => {
    setIsPaymentModalOpen(false); 
    await handleFinalConfirm(); 
  };

  const selectedStallCodes = Array.from(selectedStalls.values()).map(item => item.stall.code).join(", ");

  return (
    <div className="space-y-4">
      <Paper className="p-4">
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="font-bold">Stall Map</Typography>
          <StallLegend />
        </div>
        <Divider className="my-3"/>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <StallSvgMap
              stalls={stalls}
              selectedIds={selectedStallIds}
              onToggle={handleStallClick} 
            />
          </div>

          <div className="space-y-3">
            <Paper className="p-3">
              <Typography variant="subtitle2" className="font-semibold mb-2">
                Your Reservation Cart
              </Typography>
              <div className="text-sm">In Cart: <b>{selectedStalls.size}</b></div>
              <div className="text-sm">Already Booked: <b>{bookedCount}</b></div>
              <div className="text-sm font-semibold">Total: <b>{selectedStalls.size + bookedCount}</b> / 3</div>
              
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {Array.from(selectedStalls.values()).map(item => (
                  <ListItem 
                    key={item.stall.id}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleStallClick(item.stall)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      primary={item.stall.code}
                      secondary={item.genres.join(", ") || "No genres added"}
                    />
                  </ListItem>
                ))}
              </List>
              {selectedStalls.size === 0 && (
                <Typography variant="body2" color="text.secondary" className="mt-2">
                  Click an available stall on the map to add it to your cart.
                </Typography>
              )}
            </Paper>
            
            <Button 
              onClick={handleOpenConfirmModal} 
              variant="contained" 
              disabled={isReserving || selectedStalls.size === 0}
            >
              {isReserving ? <CircularProgress size={24} /> : `Confirm ${selectedStalls.size} Stall(s)`}
            </Button>
          </div>
        </div>
      </Paper>

      <Paper className="p-4">
        <Typography variant="subtitle1" className="font-semibold mb-2">Already Reserved Stalls</Typography>
        <div className="flex flex-wrap gap-2">
          {stalls.filter(s=>s.status==="BOOKED" && s.reservedBy===user?.email).map(s=>(
            <span key={s.id} className="badge bg-red-500 text-white">{s.code}</span>
          ))}
          {bookedCount === 0 && (
            <Typography variant="body2" color="text.secondary">No stalls reserved yet.</Typography>
          )}
        </div>
      </Paper>

      <Snackbar open={!!warn} autoHideDuration={3000} onClose={()=>setWarn("")}>
        <Alert onClose={()=>setWarn("")} severity="warning" variant="filled">{warn}</Alert>
      </Snackbar>
      <Snackbar open={!!info} autoHideDuration={2500} onClose={()=>setInfo("")}>
        <Alert onClose={()=>setInfo("")} severity="success" variant="filled">{info}</Alert>
      </Snackbar>

      <Dialog open={isGenreModalOpen} onClose={() => setIsGenreModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Genres for Stall: <b>{currentStall?.code}</b></DialogTitle>
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

      <Dialog open={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
        <DialogTitle>Confirm Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to permanently reserve the following {selectedStalls.size} stall(s):
            <br/>
            <strong>{selectedStallCodes}</strong>
            <br/><br/>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)} color="inherit">Cancel</Button>
          {/* proceeds to payment */}
          <Button onClick={handleProceedToPayment} variant="contained" autoFocus>
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Modal Mock */}
      <Dialog open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <DialogTitle>Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is where the payment gateway integration will go.
            <br/><br/>
            Total Amount: <b>LKR 150,000.00</b> (placeholder)
            <br/><br/>
            Clicking "Pay Now" for a successful payment and confirm your reservation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPaymentModalOpen(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleMockPaymentAndReserve} 
            variant="contained"
            disabled={isReserving}
          >
            {isReserving ? <CircularProgress size={24} /> : "Pay Now (Mock)"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}