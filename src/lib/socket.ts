"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

function resolveSocketUrl() {
  const explicit = process.env.NEXT_PUBLIC_API_WS;
  if (explicit) return explicit;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return undefined;

  // Remove trailing /v1 if present
  return apiUrl.replace(/\/v1\/?$/, "");
}

export function getNotificationsSocket(userId?: string) {
  if (!userId) return null;

  const url = resolveSocketUrl();
  if (!url) return null;

  if (!socketInstance) {
    socketInstance = io(url, {
      auth: { userId },
      withCredentials: true,
      transports: ["websocket"], // evita fallback para polling que costuma gerar XHR poll errors
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  } else {
    // Update auth data if user changes
    socketInstance.auth = { userId };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
  }

  return socketInstance;
}

export function disconnectNotificationsSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

