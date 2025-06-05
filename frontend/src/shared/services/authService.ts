import axios, { AxiosError } from "axios";
import { AuthResponse, SignupData, SigninData, User } from "../types/user";
import StorageManager from "../utils/storageManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available and valid
authAPI.interceptors.request.use((config) => {
  const token = AuthService.getToken();
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
    try {
      // Parse JWT to get expiration
      const payload = this.parseJWT(token);
      if (payload && payload.exp) {
        StorageManager.setItem("token", token);
        StorageManager.setItem("tokenExpiry", payload.exp.toString());
        console.log("Token saved with expiry:", new Date(payload.exp * 1000));
      } else {
        console.warn("Invalid token structure, saving without expiry validation");
        StorageManager.setItem("token", token);
      }
    } catch (error) {
      console.error("Error saving token:", error);
      StorageManager.setItem("token", token);
    }
  }

  static removeToken(): void {
    StorageManager.removeItem("token");
    StorageManager.removeItem("tokenExpiry");
  }

  static getToken(): string | null {
    const token = StorageManager.getItem("token");
    const expiry = StorageManager.getItem("tokenExpiry");

    if (token && expiry) {
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = parseInt(expiry);

      if (expiryTime > now) {
        return token;
      } else {
        console.log("Token expired, cleaning up");
        this.removeToken();
        this.removeUser();
        return null;
      }
    }

    if (token) {
      // Token exists but no expiry info - validate anyway
      const payload = this.parseJWT(token);
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp > now) {
          // Update expiry info
          StorageManager.setItem("tokenExpiry", payload.exp.toString());
          return token;
        } else {
          this.removeToken();
          this.removeUser();
          return null;
        }
      }
    }

    return token;
  }

  static saveUser(user: User): void {
    try {
      StorageManager.setVersionedItem("user", user);
    } catch (error) {
      console.error("Error saving user:", error);
      StorageManager.setItem("user", JSON.stringify(user));
    }
  }

  static removeUser(): void {
    StorageManager.removeItem("user");
  }

  static getUser(): User | null {
    try {
      // Try versioned storage first
      const versionedUser = StorageManager.getVersionedItem<User>("user");
      if (versionedUser) {
        return versionedUser;
      }

      // Fallback to regular storage
      const userStr = StorageManager.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // Migrate to versioned storage
        this.saveUser(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      StorageManager.removeItem("user");
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Parse JWT payload without verification (for expiry check)
  private static parseJWT(token: string): { exp?: number } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  }

  // Sync authentication with database
  static async syncWithDatabase(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await this.getProfile();
      if (response.success && response.data) {
        this.saveUser(response.data.user);
        return true;
      } else {
        // Token is invalid on server side
        this.removeToken();
        this.removeUser();
        return false;
      }
    } catch (error) {
      console.error("Error syncing with database:", error);
      // If network error, keep local auth but flag for retry
      return false;
    }
  }
}
