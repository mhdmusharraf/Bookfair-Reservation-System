import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar className="flex gap-4">
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            CIBF Employee Portal
          </Typography>
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            to="/join-requests"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Join Requests
          </Button>
          <Button
            component={Link}
            to="/registered-businesses"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Registered Businesses
          </Button>
          <Box className="ml-auto flex items-center gap-4">
            {user && (
              <>
                <Typography variant="body2" className="hidden sm:block">
                  {user.email}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    logout();
                    nav("/login");
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box className="p-4 mx-auto w-full">
        <Outlet />
      </Box>
    </Box>
  );
}
