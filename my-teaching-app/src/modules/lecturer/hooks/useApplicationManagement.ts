import { useState, useEffect, useMemo, useCallback } from "react";
import type { Application as TutorApplication } from "@/shared/types/application";
import {
  getApplicationsFromStorage as getApplications,
  saveApplicationToStorage as saveApplication,
  initializeDetailedApplicationsInStorage,
} from "@/modules/tutor/utils/applicationDisplay.utils";
import { availableCourses } from "@/shared/data/courses";

// Cache for applications data using sessionStorage
const CACHE_DURATION = 30000; // 30 seconds cache for applications
const LECTURER_APP_CACHE_KEY = "lecturer_app_cache";

interface LecturerApplicationCache {
  applications: TutorApplication[];
  lastChecked: number;
}

// Helper functions for application cache management
const getApplicationsCache = (): LecturerApplicationCache | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(LECTURER_APP_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setApplicationsCache = (cache: LecturerApplicationCache): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LECTURER_APP_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail if sessionStorage is not available
  }
};

const clearApplicationsCache = (): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LECTURER_APP_CACHE_KEY);
  } catch {
    // Silently fail
  }
};

export const useApplicationManagement = () => {
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedRankingCourse, setSelectedRankingCourse] =
    useState<string>("");
  const [selectedApplication, setSelectedApplication] =
    useState<TutorApplication | null>(null);
  const [comment, setComment] = useState<string>("");
  const [rankedApplications, setRankedApplications] = useState<
    TutorApplication[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("none");
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized load applications function with caching
  const loadApplications = useCallback(() => {
    try {
      // Check cache first
      const cache = getApplicationsCache();
      if (cache && Date.now() - cache.lastChecked < CACHE_DURATION) {
        setApplications(cache.applications);
        const ranked = cache.applications.filter(
          (app) => app.rank !== undefined
        );
        setRankedApplications(
          ranked.sort((a, b) => (a.rank || 999) - (b.rank || 999))
        );
        return;
      }

      // Load fresh data
      const appData = getApplications();

      // Update cache
      const newCache: LecturerApplicationCache = {
        applications: appData,
        lastChecked: Date.now(),
      };
      setApplicationsCache(newCache);

      setApplications(appData);
      const ranked = appData.filter((app) => app.rank !== undefined);
      setRankedApplications(
        ranked.sort((a, b) => (a.rank || 999) - (b.rank || 999))
      );
    } catch (error) {
      console.error("❌ Error loading applications:", error);
      setApplications([]);
      setRankedApplications([]);
    }
  }, []);

  // Delayed initialization to prevent blocking initial render
  useEffect(() => {
    // Allow initial render to complete first
    const initTimer = setTimeout(() => {
      // Initialize storage first
      initializeDetailedApplicationsInStorage();

      // Load applications
      loadApplications();
      setIsInitialized(true);

      // Set up event listeners for real-time updates
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "applications") {
          clearApplicationsCache(); // Clear cache when storage changes
          loadApplications();
        }
      };

      const handleApplicationUpdate = () => {
        clearApplicationsCache(); // Clear cache when applications update
        loadApplications();
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("applicationUpdated", handleApplicationUpdate);

      // Set up periodic refresh
      const intervalId = setInterval(() => {
        clearApplicationsCache(); // Clear cache periodically
        loadApplications();
      }, 30000); // 30 seconds

      // Cleanup function
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(
          "applicationUpdated",
          handleApplicationUpdate
        );
        clearInterval(intervalId);
      };
    }, 100); // Small delay to allow loading state to show

    return () => {
      clearTimeout(initTimer);
    };
  }, [loadApplications]);

  // Only compute expensive operations after initialization
  const filteredApplications = useMemo(() => {
    if (!isInitialized) return [];

    // Early return for no filters
    if (!selectedCourse && !searchQuery) {
      return applications;
    }

    // Pre-compute search query processing
    const hasSearchQuery = searchQuery.trim().length > 0;
    const normalizedSearchQuery = hasSearchQuery
      ? searchQuery.toLowerCase()
      : "";

    return applications.filter((app) => {
      // Course filter (faster check first)
      if (selectedCourse && !app.courses.includes(selectedCourse)) {
        return false;
      }

      // Search filter optimization
      if (hasSearchQuery) {
        // Check name first (most common and fastest)
        if (app.fullName.toLowerCase().includes(normalizedSearchQuery)) {
          return true;
        }

        // Check availability (fast string check)
        if (app.availability.toLowerCase().includes(normalizedSearchQuery)) {
          return true;
        }

        // Check skills array (moderate cost)
        const skillsMatch = app.skills.some((skill) =>
          skill.toLowerCase().includes(normalizedSearchQuery)
        );
        if (skillsMatch) {
          return true;
        }

        // Check course matches last (most expensive operation)
        const courseMatches = app.courses.some((course) => {
          const courseInfo = availableCourses.find(
            (c: { code: string; name: string }) => c.code === course
          );
          return (
            courseInfo &&
            (courseInfo.code.toLowerCase().includes(normalizedSearchQuery) ||
              courseInfo.name.toLowerCase().includes(normalizedSearchQuery))
          );
        });

        if (!courseMatches) {
          return false;
        }
      }

      return true;
    });
  }, [applications, selectedCourse, searchQuery, isInitialized]);

  // Optimized sorted applications with stable sort
  const sortedApplications = useMemo(() => {
    if (!isInitialized || sortBy === "none") {
      return filteredApplications;
    }

    // Use a stable sort to prevent unnecessary re-renders
    return [...filteredApplications].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.fullName.localeCompare(b.fullName);
        case "availability":
          return a.availability.localeCompare(b.availability);
        case "date":
          return (
            new Date(b.dateApplied).getTime() -
            new Date(a.dateApplied).getTime()
          );
        default:
          return 0;
      }
    });
  }, [filteredApplications, sortBy, isInitialized]);

  const handleSelectApplication = useCallback(
    (application: TutorApplication) => {
      setSelectedApplication(application);
      setComment(application.comment || "");
    },
    []
  );

  // Memoized statistics calculation - only after initialization
  const statistics = useMemo(() => {
    if (!isInitialized) {
      return {
        totalApplications: 0,
        selectedTutorApplications: 0,
        pendingTutorApplications: 0,
        selectionRate: 0,
      };
    }

    const totalApplications = applications.length;
    const selectedTutorApplications = applications.filter(
      (app) => app.selected
    ).length;
    const pendingTutorApplications =
      totalApplications - selectedTutorApplications;
    const selectionRate =
      totalApplications > 0
        ? Math.round((selectedTutorApplications / totalApplications) * 100)
        : 0;

    return {
      totalApplications,
      selectedTutorApplications,
      pendingTutorApplications,
      selectionRate,
    };
  }, [applications, isInitialized]);

  // Optimized save function that clears cache
  const optimizedSaveApplication = useCallback(
    (application: TutorApplication) => {
      saveApplication(application);
      clearApplicationsCache(); // Clear cache when saving
    },
    []
  );

  return {
    applications,
    selectedCourse,
    setSelectedCourse,
    selectedRankingCourse,
    setSelectedRankingCourse,
    selectedApplication,
    setSelectedApplication,
    comment,
    setComment,
    rankedApplications,
    setRankedApplications,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortedApplications,
    loadApplications,
    handleSelectApplication,
    statistics,
    saveApplication: optimizedSaveApplication,
    isInitialized, // Export this to know when data is ready
  };
};
