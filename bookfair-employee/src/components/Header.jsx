import React from "react";
import { AppBar, Toolbar, Typography, Box, Button, Badge } from "@mui/material";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationsMenu from "./NotificationsMenu";

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
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
            <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0}>
              <Box component="span" sx={{ display: "inline-flex", minWidth: 90 }}>
                Join Requests
              </Box>
            </Badge>
          </Button>
          <Button
            component={Link}
            to="/registered-businesses"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Registered Businesses
          </Button>
          <Button
            component={Link}
            to="/payment-history"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Payment History
          </Button>
          <Box className="ml-auto flex items-center gap-4">
            <NotificationsMenu />
            {user && (
              <>
                <Box className="hidden sm:flex flex-col text-right">
                  <Typography variant="body2" fontWeight="bold">
                    {user.businessName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    await logout();
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
