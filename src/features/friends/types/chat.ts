export type AppUser = {
  id: number;
  name: string;
  email: string;
  admin: boolean;
  roles: string[];
};

export type ChatMessage = {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  content: string;
  createdAt: string;
  status?: "sending" | "sent";
  tempId?: string;
};
