import React from "react";
export default function StallLegend() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-green-500 inline-block" /> Available
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-yellow-400 inline-block" /> Requested
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded bg-red-500 inline-block" /> Accepted
      </div>
    </div>
  );
}
