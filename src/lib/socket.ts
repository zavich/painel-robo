"use client";

import { io, Socket } from "socket.io-client";

type SocketReadyCallback = (socket: Socket) => void;
const socketReadyCallbacks = new Set<SocketReadyCallback>();

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

    // Dispara callbacks pendentes de whenSocketReady() ao conectar
    socketInstance.on("connect", () => {
      if (socketReadyCallbacks.size > 0) {
        const cbs = [...socketReadyCallbacks];
        socketReadyCallbacks.clear();
        cbs.forEach((cb) => cb(socketInstance!));
      }
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

export function getExistingSocket(): Socket | null {
  return socketInstance;
}

/**
 * Registra um callback a ser chamado assim que o socket estiver conectado.
 * Se já estiver conectado, chama imediatamente.
 * Retorna uma função de cleanup que cancela o registro caso o componente
 * desmonte antes da conexão ser estabelecida.
 */
export function whenSocketReady(cb: SocketReadyCallback): () => void {
  // Caso 1: socket já conectado — chamar imediatamente
  if (socketInstance?.connected) {
    cb(socketInstance);
    return () => {};
  }

  // Caso 2: socket criado mas ainda conectando — ouvir connect diretamente
  if (socketInstance) {
    const onConnect = () => cb(socketInstance!);
    socketInstance.once("connect", onConnect);
    return () => {
      socketInstance?.off("connect", onConnect);
    };
  }

  // Caso 3: socket ainda não criado — enfileirar para quando getNotificationsSocket inicializar
  socketReadyCallbacks.add(cb);
  return () => {
    socketReadyCallbacks.delete(cb);
  };
}

