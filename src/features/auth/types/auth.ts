export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  recoveryQuestion: string;
  recoveryAnswer: string;
};

export type RecoveryQuestionPayload = {
  email: string;
};

export type RecoveryQuestionResponse = {
  message?: string;
  recoveryQuestion: string;
};

export type PasswordRecoveryPayload = {
  email: string;
  recoveryAnswer: string;
  newPassword: string;
  confirmPassword: string;
};

export type AuthResponse = {
  token?: string;
  tokenType?: string;
  expiresAt?: string;
  userId?: number | string;
  user?: {
    id: number | string;
    name: string;
    email: string;
    admin?: boolean;
    roles?: string[];
  };
  message?: string;
};
