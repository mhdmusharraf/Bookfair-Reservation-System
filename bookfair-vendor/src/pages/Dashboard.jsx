import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Paper, Typography, Button, Snackbar, Alert, Divider, Stack,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress
} from "@mui/material";
import StallMap from "../components/StallMap";
import StallLegend from "../components/StallLegend";
import GenreSelector from "../components/GenreSelector";
import { fetchStalls, reserveStalls, saveGenres } from "../api/stalls";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stalls, setStalls] = useState([]);
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [genres, setGenres] = useState([]);
  const [warn, setWarn] = useState("");
  const [info, setInfo] = useState("");
  const nav = useNavigate();
  const { user } = useAuth();

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [isSavingGenres, setIsSavingGenres] = useState(false);

  useEffect(()=> {
    (async ()=>{
      const { data } = await fetchStalls();
      setStalls(data);
      // fetch the user's previously saved genres here
    })();
  }, []);

  const bookedCount = useMemo(()=> stalls.filter(s=>s.status==="BOOKED" && s.reservedBy === user?.email).length, [stalls, user]);

  const toggleStall = (stall) => {
    // booked stalls already disabled
    const next = new Set(selectedIds);
    if (next.has(stall.id)) {
      next.delete(stall.id);
    } else {
      if (next.size >= 3) {
        setWarn("Maximum 3 stalls can be selected per business.");
        return;
      }
      next.add(stall.id);
    }
    setSelectedIds(next);
  };

  const handleOpenConfirmModal = () => {
    if (selectedIds.size === 0) {
      setWarn("Select at least one stall.");
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleFinalConfirm = async () => {
    setIsReserving(true);
    setConfirmModalOpen(false);
    try {
      const { data } = await reserveStalls({ stallIds: Array.from(selectedIds), userEmail: user.email });
      setInfo(`Reserved ${data.reserved.length} stall(s) successfully.`);
      // refresh map
      const { data: fresh } = await fetchStalls();
      setStalls(fresh);
      setSelectedIds(new Set());
    } catch {
      setWarn("Reservation failed.");
    } finally {
      setIsReserving(false);
    }
  };
  
  const handleSaveGenres = async () => {
    setIsSavingGenres(true);
    try {
      await saveGenres({ genres });
      setInfo("Genres saved successfully.");
    } catch {
      setWarn("Failed to save genres.");
    } finally {
      setIsSavingGenres(false);
    }
  };

  const selectedStallCodes = useMemo(
    () => stalls
      .filter(s => selectedIds.has(s.id))
      .map(s => s.code)
      .join(", "),
    [stalls, selectedIds]
  );

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
            <StallMap
              stalls={stalls}
              sizeFilter={sizeFilter}
              onSizeChange={setSizeFilter}
              selectedIds={selectedIds}
              onToggle={toggleStall}
            />
          </div>

          <div className="space-y-3">
            {bookedCount === 0 ? (
              <>
                <Paper className="p-3">
                  <Typography variant="subtitle2" className="font-semibold mb-2">Selection</Typography>
                  <div className="text-sm">Selected: <b>{selectedIds.size}</b> / 3</div>
                  <div className="text-sm">Already booked by this account: <b>{bookedCount}</b></div>
                </Paper>
                <Stack direction="row" spacing={2}>
                  <Button 
                    onClick={handleOpenConfirmModal} 
                    variant="contained" 
                    disabled={isReserving}
                  >
                    {isReserving ? <CircularProgress size={24} /> : "Confirm Reservation"}
                  </Button>
                  <Button onClick={()=> setSelectedIds(new Set())} variant="outlined">Clear</Button>
                </Stack>
              </>
            ) : (
              <>
                <Paper className="p-3 space-y-2">
                  <Typography variant="subtitle2" className="font-semibold">
                    Add Your Literary Genres
                  </Typography>
                  <GenreSelector value={genres} onChange={setGenres}/>
                  <Typography variant="caption" color="text.secondary">
                    Your email: <b>{user?.email}</b>
                  </Typography>
                </Paper>
                <Button 
                  onClick={handleSaveGenres}
                  variant="contained" 
                  disabled={isSavingGenres}
                >
                  {isSavingGenres ? <CircularProgress size={24} /> : "Save Genres"}
                </Button>
              </>
            )}
          </div>

        </div>
      </Paper>

      <Paper className="p-4">
        <Typography variant="subtitle1" className="font-semibold mb-2">Reserved Stalls (quick view)</Typography>
        <div className="flex flex-wrap gap-2">
          {stalls.filter(s=>s.status==="BOOKED" && s.reservedBy===user?.email).map(s=>(
            <span key={s.id} className="badge bg-red-500 text-white">{s.code}</span>
          ))}
          {stalls.filter(s=>s.status==="BOOKED" && s.reservedBy===user?.email).length === 0 && (
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

      <Dialog open={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
        <DialogTitle>Confirm Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to reserve the following {selectedIds.size} stall(s):
            <br/>
            <strong>{selectedStallCodes}</strong>
            <br/><br/>
            This action is final.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleFinalConfirm} variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}