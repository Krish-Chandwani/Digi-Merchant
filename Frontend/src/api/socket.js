import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export function connectSocket(token) {
  if (!token) return null;

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
