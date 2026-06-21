/**
 * WebSocket client — connects to the DrainageAI backend and dispatches
 * real-time alert events into the application store.
 *
 * Features:
 *  - Auto-reconnect with exponential backoff
 *  - Connection status tracking
 *  - Heartbeat ping to keep connection alive
 */
import type { WebSocketMessage } from "./types";

type Listener = (msg: WebSocketMessage) => void;

const WS_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000")
  .replace(/^http/, "ws") + "/api/v1/stream/alerts";

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let attempt = 0;
const MAX_BACKOFF = 30_000;
const listeners = new Set<Listener>();
let _status: "connecting" | "connected" | "disconnected" = "disconnected";

const statusListeners = new Set<() => void>();

export function getWsStatus() { return _status; }
export function subscribeWsStatus(fn: () => void) {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}

function setStatus(s: typeof _status) {
  _status = s;
  statusListeners.forEach((fn) => fn());
}

export function connectWebSocket() {
  if (typeof window === "undefined") return;
  if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) return;

  setStatus("connecting");

  try {
    socket = new WebSocket(WS_URL);
  } catch {
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    console.log("[ws] Connected to DrainageAI backend");
    attempt = 0;
    setStatus("connected");

    // Heartbeat every 25s to keep connection alive
    heartbeatInterval = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "ping" }));
      }
    }, 25_000);
  };

  socket.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data) as WebSocketMessage;
      listeners.forEach((fn) => fn(msg));
    } catch (e) {
      console.warn("[ws] Failed to parse message:", e);
    }
  };

  socket.onclose = () => {
    cleanup();
    setStatus("disconnected");
    scheduleReconnect();
  };

  socket.onerror = () => {
    cleanup();
    setStatus("disconnected");
    scheduleReconnect();
  };
}

function cleanup() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = null;
  socket = null;
}

function scheduleReconnect() {
  if (reconnectTimeout) return;
  const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF);
  attempt++;
  console.log(`[ws] Reconnecting in ${delay}ms (attempt ${attempt})`);
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connectWebSocket();
  }, delay);
}

export function disconnectWebSocket() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = null;
  attempt = 999; // prevent auto-reconnect
  if (socket) {
    socket.close();
    cleanup();
  }
  setStatus("disconnected");
}

export function onWebSocketMessage(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
