export enum UserType {
  CANDIDATE = "candidate",
  LECTURER = "lecturer",
  ADMIN = "admin",
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phone?: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: Record<string, string>;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phone?: string;
}

export interface SigninData {
  email: string;
  password: string;
}
