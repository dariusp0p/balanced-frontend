import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { getBrokerUrl } from "../../../shared/services/apiClient";
import type { ChatMessage } from "../types/chat";

let client: Client | null = null;
let subscription: StompSubscription | null = null;

function parseMessage(frame: IMessage): ChatMessage | null {
  try {
    return JSON.parse(frame.body) as ChatMessage;
  } catch {
    return null;
  }
}

export function connectChatRealtime(
  userId: number,
  onMessage: (message: ChatMessage) => void,
) {
  const brokerURL = getBrokerUrl();
  if (!brokerURL) return false;

  disconnectChatRealtime();

  client = new Client({
    brokerURL,
    reconnectDelay: 3000,
    onConnect: () => {
      subscription?.unsubscribe();
      subscription = client?.subscribe(`/topic/chat/${userId}`, (frame) => {
        const message = parseMessage(frame);
        if (message) onMessage(message);
      }) ?? null;
    },
  });

  client.activate();
  return true;
}

export function disconnectChatRealtime() {
  subscription?.unsubscribe();
  subscription = null;

  if (!client) return;
  const activeClient = client;
  client = null;
  void activeClient.deactivate();
}
