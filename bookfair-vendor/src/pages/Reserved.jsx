import React from "react";
import { useEffect, useState } from "react";
import { fetchStalls } from "../api/stalls";
import { Paper, Typography, Divider } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Reserved() {
  const [stalls, setStalls] = useState([]);
  const { user } = useAuth();

  useEffect(()=> {
    (async ()=> {
      const { data } = await fetchStalls();
      setStalls(data.filter(s=>s.status==="BOOKED" && s.reservedBy===user?.email));
    })();
  }, [user]);

  return (
    <Paper className="p-4">
      <Typography variant="h6" className="font-bold">Reserved Stalls</Typography>
      <Divider className="my-3"/>
      {stalls.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nothing booked yet.</Typography>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stalls.map(s=>(
            <div key={s.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{s.code}</span>
                <span className="badge bg-red-500 text-white">Booked</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Size: {s.size}</div>
              <div className="text-xs text-gray-600">Reserved by: {s.reservedBy}</div>
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
}
