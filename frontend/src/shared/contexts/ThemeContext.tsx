"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import StorageManager from "@/shared/utils/storageManager";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const darkModePreference = StorageManager.getItem("darkMode") === "true";
        setIsDarkMode(darkModePreference);
        if (darkModePreference) {
          document.documentElement.setAttribute("data-theme", "dark");
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.setAttribute("data-theme", "light");
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {
        console.error("Error loading dark mode preference:", e);
        setIsDarkMode(false);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      if (newDarkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.classList.add("dark");
        StorageManager.setItem("darkMode", "true");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.classList.remove("dark");
        StorageManager.setItem("darkMode", "false");
      }
    } catch (e) {
      console.error("Error toggling dark mode:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 