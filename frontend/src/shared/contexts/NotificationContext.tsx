"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export interface Notification {
  id: string;
  type: "candidate_blocked" | "candidate_unblocked";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  candidateId?: number;
  candidateName?: string;
  unselectedCount?: number;
  unrankedCount?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Debug logging for user info
  useEffect(() => {
    console.log("📬 NotificationProvider user state:", {
      userId: user?.id,
      userType: user?.userType,
      isLecturer: user?.userType === "lecturer",
    });
  }, [user?.id, user?.userType]);

  // Load notifications from localStorage on mount (lecturer-specific)
  useEffect(() => {
    if (user?.userType === "lecturer" && user?.id) {
      const storageKey = `lecturer_notifications_${user.id}`;
      const savedNotifications = localStorage.getItem(storageKey);
      console.log(
        "📬 Loading notifications for lecturer:",
        user.id,
        "from key:",
        storageKey
      );
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          const notificationsWithDates = parsed.map((n: Notification) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
          setNotifications(notificationsWithDates);
          console.log(
            "📬 Loaded",
            notificationsWithDates.length,
            "notifications from localStorage"
          );
        } catch (error) {
          console.error("Failed to parse saved notifications:", error);
        }
      } else {
        console.log("📬 No saved notifications found in localStorage");
      }
    }
  }, [user?.userType, user?.id]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user?.userType === "lecturer" && user?.id) {
      const storageKey = `lecturer_notifications_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
      console.log(
        "📬 Saved",
        notifications.length,
        "notifications to localStorage with key:",
        storageKey
      );
    }
  }, [notifications, user?.userType, user?.id]);

  const addNotification = useCallback(
    (notificationData: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notificationData,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };

      console.log("📬 Adding new notification:", newNotification);
      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        console.log(
          "📬 Updated notifications array, total count:",
          updated.length
        );
        return updated;
      });
    },
    []
  );

  const markAsRead = useCallback((notificationId: string) => {
    console.log("📬 Marking notification as read:", notificationId);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    console.log("📬 Marking all notifications as read");
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    console.log("📬 Removing notification:", notificationId);
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    console.log("📬 Clearing all notifications");
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Debug logging for notification state
  useEffect(() => {
    console.log("📬 NotificationProvider state updated:", {
      totalNotifications: notifications.length,
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        read: n.read,
      })),
    });
  }, [notifications, unreadCount]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
