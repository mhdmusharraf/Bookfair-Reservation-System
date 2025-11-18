import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notifications";
import { useAuth } from "./AuthContext";
import { createStompClient } from "../utils/simpleStomp";

const NotificationCtx = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const clientRef = useRef(null);
  const notificationsRef = useRef([]);

  const resetState = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setError("");
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      resetState();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [listRes, unreadRes] = await Promise.all([
        fetchNotifications(25),
        fetchUnreadNotificationsCount(),
      ]);
      setNotifications(listRes.data ?? []);
      setUnreadCount(unreadRes.data?.count ?? 0);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to load notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, resetState]);

  useEffect(() => {
    loadNotifications();
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [loadNotifications]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    if (!user) {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
      return;
    }
    const client = createStompClient();
    clientRef.current = client;
    client.connect();
    const subscriptionId = client.subscribe("/user/queue/notifications", (payload) => {
      if (!payload) return;
      setNotifications((prev) => {
        const filtered = prev.filter((item) => item.id !== payload.id);
        return [payload, ...filtered].slice(0, 25);
      });
      if (!payload.read) {
        setUnreadCount((count) => count + 1);
      }
    });
    return () => {
      client.unsubscribe(subscriptionId);
      client.disconnect();
      clientRef.current = null;
    };
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId) => {
    const { data } = await markNotificationAsRead(notificationId);
    setNotifications((prev) => {
      let shouldDecrement = false;
      const mapped = prev.map((item) => {
        if (item.id === notificationId) {
          if (!item.read && data.read) {
            shouldDecrement = true;
          }
          return data;
        }
        return item;
      });
      if (shouldDecrement) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return mapped;
    });
    return data;
  }, []);

  const markAllRead = useCallback(async () => {
    if (!notifications.some((notification) => !notification.read)) {
      return;
    }
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  const markByType = useCallback(
    async (type) => {
      const unreadOfType = notificationsRef.current.filter(
        (notification) => notification.type === type && !notification.read
      );
      for (const notification of unreadOfType) {
        await markAsRead(notification.id);
      }
    },
    [markAsRead]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      markAsRead,
      markAllRead,
      markByType,
      reload: loadNotifications,
    }),
    [notifications, unreadCount, loading, error, markAsRead, markAllRead, markByType, loadNotifications]
  );

  return <NotificationCtx.Provider value={value}>{children}</NotificationCtx.Provider>;
}

export const useNotifications = () => useContext(NotificationCtx);

