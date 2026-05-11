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
  user?: {
    id: number | string;
    name: string;
    email: string;
    admin?: boolean;
    roles?: string[];
  };
  message?: string;
};
