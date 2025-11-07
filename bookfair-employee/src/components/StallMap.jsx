import React from "react";
import { useMemo } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const COLORS = {
  AVAILABLE: "bg-green-500 hover:ring-2 hover:ring-green-300",
  IN_PROGRESS: "bg-yellow-400 ring-2 ring-yellow-500",
  BOOKED: "bg-red-500 opacity-70 cursor-not-allowed",
};

function StallBox({ stall, selected, onClick }) {
  const status = stall.status === "BOOKED" ? "BOOKED" : (selected ? "IN_PROGRESS" : "AVAILABLE");
  const cls = COLORS[status];

  return (
    <button
      onClick={()=> onClick(stall)}
      disabled={stall.status === "BOOKED"}
      className={`w-12 h-12 rounded-md flex items-center justify-center text-[11px] font-semibold text-white ${cls}`}
      title={`${stall.code} — ${stall.size}`}
    >
      {stall.code}
    </button>
  );
}

export default function StallMap({ stalls, sizeFilter, onSizeChange, selectedIds, onToggle }) {
  const filtered = useMemo(
    ()=> stalls.filter(s=>{
      if (sizeFilter==="ALL") return true;
      if (sizeFilter==="SMALL") return s.size==="SMALL";
      if (sizeFilter==="MEDIUM") return s.size==="MEDIUM";
      if (sizeFilter==="LARGE") return s.size==="LARGE";
      return true;
    }),
    [stalls, sizeFilter]
  );

  return (
    <div className="space-y-3">
      <ToggleButtonGroup
        exclusive
        value={sizeFilter}
        onChange={(_, v)=> v && onSizeChange(v)}
        size="small"
      >
        <ToggleButton value="ALL">All (150)</ToggleButton>
        <ToggleButton value="SMALL">Small (50)</ToggleButton>
        <ToggleButton value="MEDIUM">Medium (50)</ToggleButton>
        <ToggleButton value="LARGE">Large (50)</ToggleButton>
      </ToggleButtonGroup>

      {/* simple rectangular grid */}
      <div className="grid grid-cols-10 gap-2">
        {filtered.map(stall=>(
          <StallBox
            key={stall.id}
            stall={stall}
            selected={selectedIds.has(stall.id)}
            onClick={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
