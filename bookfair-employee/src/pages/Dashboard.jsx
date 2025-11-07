import React from "react";
import { useEffect, useState } from "react";
import { Paper, Typography, Button, Snackbar, Alert, Divider, Stack } from "@mui/material";
import StallMap from "../components/StallMap";
import StallLegend from "../components/StallLegend";
import { fetchStalls } from "../api/stalls";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [stalls, setStalls] = useState([]);
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState(new Set());
  // const [warn, setWarn] = useState("");
  // const [info, setInfo] = useState("");
  const { user } = useAuth();

  useEffect(()=> {
    (async ()=>{
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
              // onToggle={toggleStall}
            />
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

      {/* <Snackbar open={!!warn} autoHideDuration={3000} onClose={()=>setWarn("")}>
        <Alert onClose={()=>setWarn("")} severity="warning" variant="filled">{warn}</Alert>
      </Snackbar> */}
      {/* <Snackbar open={!!info} autoHideDuration={2500} onClose={()=>setInfo("")}>
        <Alert onClose={()=>setInfo("")} severity="success" variant="filled">{info}</Alert>
      </Snackbar> */}
    </div>
  );
}
