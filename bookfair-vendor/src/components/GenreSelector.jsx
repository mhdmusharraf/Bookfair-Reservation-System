import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { GENRE_OPTIONS } from "../api/stalls";

export default function GenreSelector({ value, onChange }) {
  return (
    <Autocomplete
      multiple
      options={GENRE_OPTIONS}
      value={value}
      onChange={(_, v)=>onChange(v)}
      renderInput={(params)=><TextField {...params} label="Literary genres" placeholder="Select up to needed"/>}
    />
  );
}
