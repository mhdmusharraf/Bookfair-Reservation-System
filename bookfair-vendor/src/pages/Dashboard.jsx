import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Paper, Typography, Button, Snackbar, Alert, Divider, Stack } from "@mui/material";
import StallMap from "../components/StallMap";
import StallLegend from "../components/StallLegend";
import GenreSelector from "../components/GenreSelector";
import { fetchStalls, reserveStalls } from "../api/stalls";
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

  useEffect(()=> {
    (async ()=>{
      const { data } = await fetchStalls();
      setStalls(data);
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

  const confirmReservation = async () => {
    if (selectedIds.size === 0) {
      setWarn("Select at least one stall.");
      return;
    }
    try {
      const { data } = await reserveStalls({ stallIds: Array.from(selectedIds), genres });
      setInfo(`Reserved ${data.reserved.length} stall(s) successfully.`);
      // refresh map
      const { data: fresh } = await fetchStalls();
      setStalls(fresh);
      setSelectedIds(new Set());
      // Optionally navigate to reserved page
      // nav("/reserved");
    } catch {
      setWarn("Reservation failed.");
    }
  };

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
            <Paper className="p-3">
              <Typography variant="subtitle2" className="font-semibold mb-2">Selection</Typography>
              <div className="text-sm">Selected: <b>{selectedIds.size}</b> / 3</div>
              <div className="text-sm">Already booked by this account: <b>{bookedCount}</b></div>
            </Paper>
            <Paper className="p-3 space-y-2">
              <Typography variant="subtitle2" className="font-semibold">Genres</Typography>
              <GenreSelector value={genres} onChange={setGenres}/>
              <Typography variant="caption" color="text.secondary">
                Visible email: <b>{user?.email}</b>
              </Typography>
            </Paper>
            <Stack direction="row" spacing={2}>
              <Button onClick={confirmReservation} variant="contained">Confirm Reservation</Button>
              <Button onClick={()=> setSelectedIds(new Set())} variant="outlined">Clear</Button>
            </Stack>
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
    </div>
  );
}
