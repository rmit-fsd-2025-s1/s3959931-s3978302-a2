import axios, { AxiosError } from "axios";
import { AuthResponse, SignupData, SigninData, User } from "../types/user";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class AuthService {
  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await authAPI.post("/signup", data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AuthResponse>;
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
      return {
        success: false,
        message: "Network error occurred. Please try again.",
      };
    }
  }

  static async signin(data: SigninData): Promise<AuthResponse> {
    try {
      const response = await authAPI.post("/signin", data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AuthResponse>;
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
      return {
        success: false,
        message: "Network error occurred. Please try again.",
      };
    }
  }

  static async logout(): Promise<AuthResponse> {
    try {
      const response = await authAPI.post("/logout");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AuthResponse>;
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
      return {
        success: false,
        message: "Network error occurred during logout.",
      };
    }
  }

  static async getProfile(): Promise<AuthResponse> {
    try {
      const response = await authAPI.get("/profile");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AuthResponse>;
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
      return {
        success: false,
        message: "Network error occurred while fetching profile.",
      };
    }
  }

  static saveToken(token: string): void {
    localStorage.setItem("token", token);
  }

  static removeToken(): void {
    localStorage.removeItem("token");
  }

  static getToken(): string | null {
    return localStorage.getItem("token");
  }

  static saveUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  static removeUser(): void {
    localStorage.removeItem("user");
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
