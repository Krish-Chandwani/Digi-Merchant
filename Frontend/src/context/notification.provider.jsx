import { useState, useEffect, useCallback } from "react";
import { NotificationContext } from "./notification.context";
import api from "../api/axios";
import { connectSocket, disconnectSocket } from "../api/socket";
import toast from "react-hot-toast";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, []);

  useEffect(() => {
    const setup = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        disconnectSocket();
        return;
      }

      fetchNotifications();

      const socket = connectSocket(token);

      socket?.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast(notification.message, { icon: "🔔" });
      });

      return socket;
    };

    let socket = setup();

    const handleAuthChange = () => {
      socket?.off("notification");
      socket = setup();
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      socket?.off("notification");
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
