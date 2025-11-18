const NULL_CHAR = "\u0000";
const PORTAL = import.meta.env.VITE_LOGIN_PORTAL || "employee";

function withPortalQuery(url) {
  if (!PORTAL) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}portal=${encodeURIComponent(PORTAL)}`;
}

function buildWsUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
  const configured = import.meta.env.VITE_WS_BASE_URL;
  if (configured) return withPortalQuery(configured);
  const normalized = apiBase.replace(/\/$/, "");
  const base = normalized.replace(/\/api\/v1$/, "").replace(/^http/, "ws") + "/ws";
  return withPortalQuery(base);
}

export class SimpleStompClient {
  constructor() {
    this.url = buildWsUrl();
    this.socket = null;
    this.connected = false;
    this.buffer = "";
    this.counter = 0;
    this.subscriptions = new Map();
    this.pending = [];
    this.onConnected = null;
    this.onError = null;
  }

  connect(onConnected, onError) {
    this.onConnected = onConnected;
    this.onError = onError;
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () => {
      this.sendFrame("CONNECT", {
        "accept-version": "1.2",
        "heart-beat": "0,0",
      });
    };
    this.socket.onmessage = (event) => this.handleChunk(event.data);
    this.socket.onerror = () => {
      if (this.onError) this.onError(new Error("WebSocket error"));
    };
    this.socket.onclose = () => {
      this.connected = false;
    };
  }

  handleChunk(chunk) {
    this.buffer += chunk;
    let index;
    while ((index = this.buffer.indexOf(NULL_CHAR)) >= 0) {
      const frame = this.buffer.slice(0, index);
      this.buffer = this.buffer.slice(index + 1);
      if (frame.trim().length === 0) continue;
      this.dispatchFrame(frame);
    }
  }

  dispatchFrame(frame) {
    const lines = frame.split(/\r?\n/);
    const command = lines.shift();
    const headers = {};
    while (lines.length) {
      const line = lines.shift();
      if (!line || line.length === 0) break;
      const [key, ...rest] = line.split(":");
      headers[key] = rest.join(":");
    }
    const body = lines.join("\n");

    if (command === "CONNECTED") {
      this.connected = true;
      this.pending.forEach((fn) => fn());
      this.pending = [];
      if (this.onConnected) this.onConnected();
      return;
    }

    if (command === "MESSAGE") {
      const subId = headers.subscription;
      const handler = this.subscriptions.get(subId);
      if (handler) {
        try {
          const parsed = body ? JSON.parse(body) : null;
          handler(parsed, headers);
        } catch (err) {
          console.error("Failed to parse STOMP body", err);
        }
      }
      return;
    }

    if (command === "ERROR") {
      const message = headers.message || body;
      if (this.onError) {
        this.onError(new Error(message || "WebSocket error"));
      }
    }
  }

  subscribe(destination, handler) {
    const id = `sub-${++this.counter}`;
    const action = () => {
      this.subscriptions.set(id, handler);
      this.sendFrame("SUBSCRIBE", { id, destination });
    };
    if (this.connected) {
      action();
    } else {
      this.pending.push(action);
    }
    return id;
  }

  unsubscribe(id) {
    if (!id) return;
    this.subscriptions.delete(id);
    if (this.connected) {
      this.sendFrame("UNSUBSCRIBE", { id });
    }
  }

  disconnect() {
    if (this.connected) {
      this.sendFrame("DISCONNECT");
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
    this.subscriptions.clear();
    this.pending = [];
  }

  sendFrame(command, headers = {}, body = "") {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    const headerLines = Object.entries(headers)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}:${value}`)
      .join("\n");
    const serializedHeaders = headerLines.length ? `${headerLines}\n` : "";
    const payload = `${command}\n${serializedHeaders}\n${body ?? ""}${NULL_CHAR}`;
    this.socket.send(payload);
  }
}

export function createStompClient() {
  return new SimpleStompClient();
}
