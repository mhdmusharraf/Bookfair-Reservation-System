import { api } from "./client";

export function fetchNotifications(limit = 20) {
  return api.get(`/notifications`, { params: { limit } });
}

export function fetchUnreadNotificationsCount() {
  return api.get(`/notifications/unread-count`);
}

export function markNotificationAsRead(notificationId) {
  return api.post(`/notifications/${notificationId}/read`);
}

export function markAllNotificationsAsRead() {
  return api.post(`/notifications/mark-all-read`);
}

