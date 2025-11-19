import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    success: { main: "#22c55e" }, // tailwind green-500
    warning: { main: "#f59e0b" }, // tailwind amber-500
    error:   { main: "#ef4444" }, // tailwind red-500
  },
  shape: { borderRadius: 12 },
});
