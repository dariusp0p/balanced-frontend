export type AppActionLog = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  groupId: string;
  actionInformation: string;
  timestamp: string;
};

export type ObservedUser = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  reason: string;
  observedAt: string;
};
