import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemText,
  ListItemButton,
  Menu,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CircleIcon from "@mui/icons-material/Circle";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

function formatTimestamp(value) {
  if (!value) return "Just now";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Just now";
  }
}

export default function NotificationsMenu() {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const preview = useMemo(() => notifications.slice(0, 6), [notifications]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = async (notification) => {
    await markAsRead(notification.id);
    handleClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAll = async () => {
    await markAllRead();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} sx={{ position: "relative" }}>
        <Badge color="error" badgeContent={unreadCount} max={99} invisible={unreadCount === 0}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </Typography>
          </Box>
          <Button size="small" onClick={handleMarkAll} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        </Box>
        <Divider />
        {preview.length === 0 ? (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2">No notifications yet.</Typography>
          </Box>
        ) : (
          preview.map((notification) => (
            <ListItemButton
              key={notification.id}
              onClick={() => handleItemClick(notification)}
              sx={{
                alignItems: "flex-start",
                gap: 1,
                minWidth: 320,
                bgcolor: notification.read ? "inherit" : "action.hover",
              }}
            >
              {!notification.read && (
                <CircleIcon sx={{ fontSize: 10, color: "success.main", mt: 1 }} />
              )}
              <ListItemText
                primary={notification.title}
                primaryTypographyProps={{ fontWeight: notification.read ? 500 : 700 }}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatTimestamp(notification.createdAt)}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          ))
        )}
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Showing recent notifications
          </Typography>
        </Box>
      </Menu>
    </>
  );
}

