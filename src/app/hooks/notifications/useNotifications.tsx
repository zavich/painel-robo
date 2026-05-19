"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient, type QueryObserverResult } from "@tanstack/react-query";
import api from "@/app/api";
import { useAuth } from "../user/auth/useAuth";
import { getNotificationsSocket, disconnectNotificationsSocket } from "@/lib/socket";

export type NotificationType = "ACTIVITY" | "SYSTEM";

export interface NotificationDoc {
  _id: string;
  title: string;
  description: string;
  user: string;
  read: boolean;
  type: NotificationType;
  redirectId?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsContextValue {
  notifications: NotificationDoc[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  deleteMany: (ids: string[]) => Promise<void>;
  refetch: () => Promise<QueryObserverResult<NotificationDoc[], Error>>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

interface NotificationsResponse {
  notifications?: NotificationDoc[];
  data?: NotificationDoc[] | { items?: NotificationDoc[] };
  items?: NotificationDoc[];
  docs?: NotificationDoc[];
}

async function fetchNotifications(): Promise<NotificationDoc[]> {
  const { data } = await api.get<NotificationDoc[] | NotificationsResponse>("/notifications/me", {
    params: { page: 1, limit: 50 },
  });

  // Estruturas possíveis: array direto, {data: []}, {items: []}, {data: {items: []}}, {docs: []}
  if (Array.isArray(data)) return data;

  const response = data as NotificationsResponse;

  if (Array.isArray(response.notifications)) return response.notifications;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (response.data && !Array.isArray(response.data) && Array.isArray(response.data.items)) {
    return response.data.items;
  }
  if (Array.isArray(response.docs)) return response.docs;

  return [];
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const lastErrorMessageRef = useRef<string | null>(null);

  const { data: notifications = [], refetch, isFetching } = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      disconnectNotificationsSocket();
      setIsConnected(false);
      return;
    }

    const socket = getNotificationsSocket(user._id);
    if (!socket) return;

    const handleNotification = (notification: NotificationDoc) => {
      queryClient.setQueryData<NotificationDoc[]>(["notifications", "me"], (prev = []) => {
        const exists = prev.find((n) => n._id === notification._id);
        if (exists) {
          return prev.map((n) => (n._id === notification._id ? notification : n));
        }
        return [notification, ...prev].slice(0, 100);
      });
    };

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (err: unknown) => {
      const message = (err instanceof Error ? err.message : null) || String(err || "erro socket notification");
      // Evita spam no console
      if (lastErrorMessageRef.current !== message) {
        console.warn("Não foi possível conectar às notificações em tempo real.", message);
        lastErrorMessageRef.current = message;
      }
    };

    socket.on("notification", handleNotification);
    socket.on("connect", () => {
      lastErrorMessageRef.current = null;
      handleConnect();
    });
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
    };
  }, [isAuthenticated, user?._id, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData<NotificationDoc[]>(["notifications", "me"], (prev = []) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await api.delete("/notifications", { data: { ids } });
    },
    onSuccess: (_data, ids) => {
      queryClient.setQueryData<NotificationDoc[]>(["notifications", "me"], (prev = []) =>
        prev.filter((n) => !ids.includes(n._id))
      );
    },
  });

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      isConnected,
      isLoading: isFetching,
      markAsRead: async (id: string) => {
        await markAsReadMutation.mutateAsync(id);
      },
      deleteMany: async (ids: string[]) => {
        if (!ids.length) return;
        await deleteManyMutation.mutateAsync(ids);
      },
      refetch: () => refetch(),
    }),
    [notifications, isConnected, isFetching, markAsReadMutation, deleteManyMutation, refetch]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}

