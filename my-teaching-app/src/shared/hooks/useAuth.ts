import { useState, useEffect, useCallback, useMemo } from "react";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: "tutor" | "lecturer" | "user";
  avatarPath?: string;
}

const CACHE_DURATION = 30000; // 30 seconds cache
const CACHE_KEY = "auth_cache";

interface AuthCache {
  user: UserData | null;
  isLoggedIn: boolean;
  lastChecked: number;
}

// Helper functions for cache management
const getCache = (): AuthCache | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCache = (cache: AuthCache): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail if sessionStorage is not available
  }
};

const clearCache = (): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Silently fail
  }
};

export const useAuth = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthState = useCallback(() => {
    // Check if we have valid cached data
    const cache = getCache();
    if (cache && Date.now() - cache.lastChecked < CACHE_DURATION) {
      // Only update state if it's actually different to prevent re-renders
      if (cache.user?.id !== userData?.id || cache.isLoggedIn !== isLoggedIn) {
        setUserData(cache.user);
        setIsLoggedIn(cache.isLoggedIn);
      }
      if (isLoading) {
        setIsLoading(false);
      }
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const userJson = localStorage.getItem("currentUser");

        if (userJson) {
          const user = JSON.parse(userJson);
          const newUserData: UserData = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role || "user",
            avatarPath: user.avatarPath,
          };

          // Update cache
          const newCache: AuthCache = {
            user: newUserData,
            isLoggedIn: true,
            lastChecked: Date.now(),
          };
          setCache(newCache);

          // Only update state if different
          if (newUserData.id !== userData?.id) {
            setUserData(newUserData);
          }
          if (!isLoggedIn) {
            setIsLoggedIn(true);
          }
        } else {
          // Update cache for no user
          const newCache: AuthCache = {
            user: null,
            isLoggedIn: false,
            lastChecked: Date.now(),
          };
          setCache(newCache);

          // Only update state if different
          if (userData !== null) {
            setUserData(null);
          }
          if (isLoggedIn) {
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("currentUser");

        // Update cache on error
        const newCache: AuthCache = {
          user: null,
          isLoggedIn: false,
          lastChecked: Date.now(),
        };
        setCache(newCache);

        setUserData(null);
        setIsLoggedIn(false);
      }
    }
    if (isLoading) {
      setIsLoading(false);
    }
  }, [userData?.id, isLoggedIn, isLoading]);

  const signOut = useCallback(() => {
    localStorage.removeItem("currentUser");
    clearCache();

    setUserData(null);
    setIsLoggedIn(false);

    // Dispatch event for other components
    window.dispatchEvent(new Event("auth-change"));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const invalidateAuthCache = useCallback(() => {
    clearCache();
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    checkAuthState();

    const handleAuthChange = () => {
      invalidateAuthCache();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentUser") {
        invalidateAuthCache();
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidateAuthCache]);

  // Memoize the return object to prevent unnecessary re-renders
  const authState = useMemo(
    () => ({
      userData,
      isLoggedIn,
      isLoading,
      signOut,
      checkAuthState: invalidateAuthCache,
    }),
    [userData, isLoggedIn, isLoading, signOut, invalidateAuthCache]
  );

  return authState;
};
