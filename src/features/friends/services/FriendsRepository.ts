import { apiRequest } from "../../../shared/services/apiClient";
import type { AppUser, ChatMessage } from "../types/chat";

export function fetchUsers() {
  return apiRequest<AppUser[]>("/api/users");
}

export function fetchConversation(userId: number) {
  return apiRequest<ChatMessage[]>(`/api/chat/${userId}`);
}

export function sendChatMessage(receiverId: number, content: string) {
  return apiRequest<ChatMessage>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ receiverId, content }),
  });
}
