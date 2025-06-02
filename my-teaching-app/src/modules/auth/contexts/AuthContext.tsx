"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "../../../shared/services/authService";
import { User } from "../../../shared/types/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in on app start
    const initializeAuth = async () => {
      try {
        const token = AuthService.getToken();
        const savedUser = AuthService.getUser();

        if (token && savedUser) {
          // Verify token is still valid by making an API call
          const response = await AuthService.getProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
            AuthService.saveUser(response.data.user);
          } else {
            // Token is invalid, clear local storage
            AuthService.removeToken();
            AuthService.removeUser();
          }
        }
      } catch {
        // Error verifying token, clear local storage
        AuthService.removeToken();
        AuthService.removeUser();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User, token: string) => {
    AuthService.saveToken(token);
    AuthService.saveUser(user);
    setUser(user);
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await AuthService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local state and storage
      AuthService.removeToken();
      AuthService.removeUser();
      setUser(null);
      router.push("/signin");
    }
  };

  const updateUser = (updatedUser: User) => {
    AuthService.saveUser(updatedUser);
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
