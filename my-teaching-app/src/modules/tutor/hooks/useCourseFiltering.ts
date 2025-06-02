import { useState, useMemo, useCallback } from "react";
import type { CourseDetails } from "@/shared/types/course";
import { getCoursesWithDetails } from "@/modules/tutor/utils/courseHelpers";

// Cache for courses data using sessionStorage
const CACHE_DURATION = 300000; // 5 minutes cache for courses (they don't change often)
const COURSE_CACHE_KEY = "courses_cache";

interface CourseCache {
  courses: CourseDetails[];
  lastGenerated: number;
}

// Helper functions for course cache management
const getCourseCache = (): CourseCache | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(COURSE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCourseCache = (cache: CourseCache): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COURSE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Silently fail if sessionStorage is not available
  }
};

export const useCourseFiltering = (existingApplications: string[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "applied" | "available"
  >("all");

  // Memoized courses with caching
  const courses = useMemo(() => {
    // Check if we have valid cached data
    const cache = getCourseCache();
    if (cache && Date.now() - cache.lastGenerated < CACHE_DURATION) {
      return cache.courses;
    }

    // Generate fresh course data
    const freshCourses = getCoursesWithDetails();

    // Update cache
    const newCache: CourseCache = {
      courses: freshCourses,
      lastGenerated: Date.now(),
    };
    setCourseCache(newCache);

    return freshCourses;
  }, []); // Empty dependency array since courses data is static

  // Memoized filter function
  const filterCourses = useCallback(
    (
      coursesToFilter: CourseDetails[],
      query: string,
      filter: string,
      applications: string[]
    ) => {
      return coursesToFilter.filter((course) => {
        // Apply search filter
        const matchesSearch =
          query === "" ||
          course.code.toLowerCase().includes(query.toLowerCase()) ||
          course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.role.toLowerCase().includes(query.toLowerCase()) ||
          course.availability.toLowerCase().includes(query.toLowerCase());

        // Apply application status filter
        const isApplied = applications.includes(course.code);
        let matchesApplicationFilter = true;

        if (filter === "applied") {
          matchesApplicationFilter = isApplied;
        } else if (filter === "available") {
          matchesApplicationFilter = !isApplied;
        }

        return matchesSearch && matchesApplicationFilter;
      });
    },
    []
  );

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    return filterCourses(
      courses,
      searchQuery,
      activeFilter,
      existingApplications
    );
  }, [courses, searchQuery, activeFilter, existingApplications, filterCourses]);

  // Memoized setters to prevent unnecessary re-renders
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleActiveFilterChange = useCallback(
    (filter: "all" | "applied" | "available") => {
      setActiveFilter(filter);
    },
    []
  );

  return {
    courses,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    activeFilter,
    setActiveFilter: handleActiveFilterChange,
    filteredCourses,
  };
};
