import { useState, useEffect, useMemo } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { Application as TutorApplication } from "@/shared/types/application";

// Cache for application data using sessionStorage
const CACHE_DURATION = 30000; // 30 seconds cache for applications
const APP_CACHE_KEY = "tutor_app_cache";

interface ApplicationCache {
  applications: string[];
  userId: string;
  lastChecked: number;
}

// Helper functions for application cache management
const getApplicationCache = (userId: string): ApplicationCache | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(`${APP_CACHE_KEY}_${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setApplicationCache = (userId: string, cache: ApplicationCache): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${APP_CACHE_KEY}_${userId}`, JSON.stringify(cache));
  } catch {
    // Silently fail if sessionStorage is not available
  }
};

const clearApplicationCache = (userId: string): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${APP_CACHE_KEY}_${userId}`);
  } catch {
    // Silently fail
  }
};

export const useTutorAuth = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [existingApplications, setExistingApplications] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Memoized function to get user applications
  const getUserApplications = useMemo(() => {
    return (userId: string): string[] => {
      // Check if we have valid cached data for this user
      const cache = getApplicationCache(userId);
      if (cache && Date.now() - cache.lastChecked < CACHE_DURATION) {
        return cache.applications;
      }

      try {
        const applications = localStorage.getItem("applications");
        if (!applications) {
          // Cache empty result
          const newCache: ApplicationCache = {
            applications: [],
            userId,
            lastChecked: Date.now(),
          };
          setApplicationCache(userId, newCache);
          return [];
        }

        const parsed = JSON.parse(applications);
        const userApplications = parsed
          .filter((app: TutorApplication) => app.userId === userId)
          .map((app: TutorApplication) => app.courses)
          .flat();

        // Update cache
        const newCache: ApplicationCache = {
          applications: userApplications,
          userId,
          lastChecked: Date.now(),
        };
        setApplicationCache(userId, newCache);

        return userApplications;
      } catch (error) {
        console.error("Error parsing applications:", error);
        return [];
      }
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      redirect("/signin");
      return;
    }

    // Check if user has candidate role (tutors are candidates)
    if (user.userType !== "candidate") {
      redirect(user.userType === "lecturer" ? "/lecturer" : "/");
      return;
    }

    // Get user applications using memoized function
    const userApplications = getUserApplications(user.id.toString());
    setExistingApplications(userApplications);
    setIsLoading(false);
  }, [user, isAuthenticated, authLoading, getUserApplications]);

  const updateExistingApplications = (newApplication: string) => {
    setExistingApplications((prev) => {
      const updated = [...prev, newApplication];

      // Update cache
      if (user) {
        const newCache: ApplicationCache = {
          applications: updated,
          userId: user.id.toString(),
          lastChecked: Date.now(),
        };
        setApplicationCache(user.id.toString(), newCache);
      }

      return updated;
    });
  };

  const invalidateApplicationCache = () => {
    if (user) {
      clearApplicationCache(user.id.toString());
      const userApplications = getUserApplications(user.id.toString());
      setExistingApplications(userApplications);
    }
  };

  // Convert user to userData format for compatibility
  const userData = user
    ? {
        id: user.id.toString(),
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        role: "tutor" as const,
      }
    : null;

  return {
    userData,
    existingApplications,
    isLoading: authLoading || isLoading,
    updateExistingApplications,
    invalidateApplicationCache,
  };
};
