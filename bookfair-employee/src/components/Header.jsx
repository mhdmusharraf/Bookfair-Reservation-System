import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Badge,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationsMenu from "./NotificationsMenu";

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount, unreadByType } = useNotifications();
  const nav = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { to: "/", label: "Dashboard" },
    {
      to: "/join-requests",
      label: "Join Requests",
      // badge: unreadByType?.VENDOR_ACCESS_REQUEST ?? unreadCount,
      badge: unreadByType?.VENDOR_ACCESS_REQUEST || 0,
    },
    { to: "/registered-businesses", label: "Registered Businesses" },
    {
      to: "/payment-history",
      label: "Payment History",
      badge: unreadByType?.PAYMENT_RECEIVED ?? 0,
    },
  ];

  const NavButton = ({ to, label, badge }) => (
    <NavLink
      to={to}
      end={to === "/"}
      style={({ isActive }) => ({
        textDecoration: "none",
        color: isActive
          ? theme.palette.primary.main
          : theme.palette.text.primary,
        fontWeight: isActive ? "bold" : "normal",
      })}
    >
      <Button
        component="div" 
        color="inherit"
        sx={{
          textTransform: "none",
          bgcolor: ({ isActive }) =>
            isActive ? theme.palette.action.selected : "transparent",
          "&:hover": {
            bgcolor: ({ isActive }) =>
              isActive
                ? theme.palette.action.selected
                : theme.palette.action.hover,
          },
        }}
      >
        {badge > 0 ? (
          <Badge color="error" badgeContent={badge} invisible={badge === 0}>
            <Box component="span" sx={{ display: "inline-flex", minWidth: 90 }}>
              {label}
            </Box>
          </Badge>
        ) : (
          label
        )}
      </Button>
    </NavLink>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar className="flex gap-4">
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            CIBF Employee Portal
          </Typography>

          {isDesktop && (
            <Box className="flex gap-2">
              {navItems.map((item) => (
                <NavButton key={item.to} {...item} />
              ))}
            </Box>
          )}

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

            {!isDesktop && (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  {navItems.map((item) => (
                    <MenuItem
                      key={item.to}
                      component={NavLink}
                      to={item.to}
                      end={item.to === "/"} 
                      onClick={handleClose}
                      sx={{
                        bgcolor: ({ isActive }) =>
                          isActive
                            ? theme.palette.action.selected
                            : "transparent",
                        color: ({ isActive }) =>
                          isActive ? theme.palette.primary.main : "inherit",
                        fontWeight: ({ isActive }) =>
                          isActive ? "bold" : "normal",
                      }}
                    >
                      {item.badge > 0 ? (
                        <Badge
                          color="error"
                          badgeContent={item.badge}
                          invisible={item.badge === 0}
                        >
                          {item.label}
                        </Badge>
                      ) : (
                        item.label
                      )}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box className="p-2 md:p-4 mx-auto w-100%">
        <Outlet />
      </Box>
    </Box>
  );
}