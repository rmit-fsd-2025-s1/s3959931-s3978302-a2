import { useState, useEffect } from "react";
import StorageManager from "../utils/storageManager";

export const useTheme = () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        // Check storage for saved theme preference with fallbacks
        if (typeof window !== "undefined") {
            try {
                const savedTheme = StorageManager.getItem("theme");

                // Validate theme value
                if (savedTheme === "dark" || savedTheme === "light") {
                    setTheme(savedTheme);
                    applyThemeToDOM(savedTheme);
                } else if (savedTheme) {
                    // Invalid theme value, use system preference
                    console.warn(
                        "Invalid theme value, using system preference"
                    );
                    const systemTheme = getSystemTheme();
                    setTheme(systemTheme);
                    StorageManager.setItem("theme", systemTheme);
                    applyThemeToDOM(systemTheme);
                } else {
                    // No saved theme, detect system preference
                    const systemTheme = getSystemTheme();
                    setTheme(systemTheme);
                    applyThemeToDOM(systemTheme);
                }
            } catch (e) {
                console.error("Error loading theme:", e);
                // Fallback to light theme
                setTheme("light");
                applyThemeToDOM("light");
            }
        }
    }, []);

    const getSystemTheme = (): "light" | "dark" => {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }
        return "light";
    };

    const applyThemeToDOM = (themeValue: "light" | "dark") => {
        try {
            if (typeof window !== "undefined" && document.documentElement) {
                if (themeValue === "dark") {
                    document.documentElement.classList.add("dark");
                    document.documentElement.setAttribute("data-theme", "dark");
                } else {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.setAttribute(
                        "data-theme",
                        "light"
                    );
                }
            }
        } catch (e) {
            console.error("Error applying theme to DOM:", e);
        }
    };

    const toggleTheme = () => {
        try {
            const newTheme = theme === "light" ? "dark" : "light";
            setTheme(newTheme);

            if (typeof window !== "undefined") {
                StorageManager.setItem("theme", newTheme);
                applyThemeToDOM(newTheme);
            }
        } catch (e) {
            console.error("Error toggling theme:", e);
        }
    };

    return { theme, toggleTheme };
};
