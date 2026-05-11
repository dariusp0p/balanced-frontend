import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

type WsHandlers = {
  onUpdate: (payload: unknown) => void | Promise<void>;
  onConnectionChange?: (connected: boolean) => void;
};

let stompClient: Client | null = null;
let subscriptions: StompSubscription[] = [];

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readUserIdFromToken(): number | null {
  const storedUserId = Number(localStorage.getItem("userId"));
  if (Number.isFinite(storedUserId)) return storedUserId;

  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const rawUserId =
    payload.userId ??
    payload.user_id ??
    payload.uid ??
    payload.id ??
    payload.sub;
  const userId = Number(rawUserId);
  return Number.isFinite(userId) ? userId : null;
}

function getBrokerUrl() {
  const backendBaseUrl = (import.meta as any).env?.VITE_BACKEND_BASE_URL as
    | string
    | undefined;
  if (!backendBaseUrl) return null;

  const url = new URL(backendBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function parseFrameBody(frame: IMessage) {
  try {
    return JSON.parse(frame.body);
  } catch {
    return frame.body;
  }
}

export function connectFoodLogsWs({
  onUpdate,
  onConnectionChange,
}: WsHandlers) {
  const brokerURL = getBrokerUrl();
  const userId = readUserIdFromToken();

  if (!brokerURL) {
    onConnectionChange?.(false);
    return false;
  }

  disconnectFoodLogsWs();

  stompClient = new Client({
    brokerURL,
    reconnectDelay: 3000,
    onConnect: () => {
      onConnectionChange?.(true);

      subscriptions.forEach((s) => s.unsubscribe());
      subscriptions = [];

      const destinations = [
        "/topic/food-logs",
        "/user/queue/food-logs",
        "/user/topic/food-logs",
        ...(userId !== null ? [`/topic/food-logs/${userId}`] : []),
      ];

      destinations.forEach((destination) => {
        const sub = stompClient?.subscribe(destination, async (frame) => {
          await onUpdate(parseFrameBody(frame));
        });
        if (sub) subscriptions.push(sub);
      });

      void onUpdate({ type: "connected" });
    },
    onStompError: () => {
      onConnectionChange?.(false);
    },
    onWebSocketClose: () => {
      onConnectionChange?.(false);
    },
    onWebSocketError: () => {
      onConnectionChange?.(false);
    },
  });

  onConnectionChange?.(false);
  stompClient.activate();
  return true;
}

export function disconnectFoodLogsWs() {
  subscriptions.forEach((s) => s.unsubscribe());
  subscriptions = [];

  if (!stompClient) return;
  const client = stompClient;
  stompClient = null;
  void client.deactivate();
}
