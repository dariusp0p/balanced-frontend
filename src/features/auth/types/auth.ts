export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  token?: string;
  userId?: number | string;
  message?: string;
};
