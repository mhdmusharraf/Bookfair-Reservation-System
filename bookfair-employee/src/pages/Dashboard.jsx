import React from "react";
import { useEffect, useState } from "react";
import { Paper, Typography, Button, Snackbar, Alert, Divider, Stack, Box, List, ListItem, Checkbox, ListItemButton, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
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

  const [checked, setChecked] = useState([1]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleRequestClick = () => {
    alert("Stall request clicked");
  }

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
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {[0, 1, 2, 3].map((value) => {
              const labelId = `checkbox-list-secondary-label-${value}`;
              return (
                <ListItem
                  key={value}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      onChange={handleToggle(value)}
                      checked={checked.includes(value)}
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  }
                  disablePadding
                >
                  <ListItemButton onClick={handleRequestClick}>
                    <ListItemAvatar>
                      <Avatar
                        alt={`Avatar n°${value + 1}`}
                        src={`/static/images/avatar/${value + 1}.jpg`}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      id={labelId}
                      primary={`Line item ${value + 1}`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
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
