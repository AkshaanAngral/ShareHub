import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  userId: string;
  type: "chat" | "order" | "payment" | "system";
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date | string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket, isConnected } = useSocket();
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  // --- Fetch notifications from REST API ---
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(
          data.map((notif: any) => ({
            ...notif,
            id: notif._id, // normalize id
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user]);

  // --- On login, fetch notifications from backend ---
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotifications();
    }
  }, [isLoggedIn, user, fetchNotifications]);

  // --- Listen for real-time notifications ---
  useEffect(() => {
    if (!isConnected || !socket || !user) return;
    const handler = (notification: Notification) => {
      if (notification.userId === user.id) {
        setNotifications(prev => [notification, ...prev]);
        toast({
          title: notification.title,
          description: notification.message,
        });
      }
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [isConnected, socket, user, toast]);

  // --- Mark as read (REST API) ---
  const markAsRead = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // --- Mark all as read (REST API) ---
  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // --- Clear all notifications (REST API) ---
  const clearNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/notifications`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
