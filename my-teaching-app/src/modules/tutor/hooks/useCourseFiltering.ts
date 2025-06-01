import { useState, useEffect, useMemo } from "react";
import type { CourseDetails } from "@/shared/types/course";
import { getCoursesWithDetails } from "@/modules/tutor/utils/courseHelpers";

export const useCourseFiltering = (existingApplications: string[]) => {
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "applied" | "available"
  >("all");

  // Initialize courses
  useEffect(() => {
    const fetchedCourses = getCoursesWithDetails();
    setCourses(fetchedCourses);
  }, []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Apply search filter
      const matchesSearch =
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.availability.toLowerCase().includes(searchQuery.toLowerCase());

      // Apply application status filter
      const isApplied = existingApplications.includes(course.code);
      let matchesApplicationFilter = true;

      if (activeFilter === "applied") {
        matchesApplicationFilter = isApplied;
      } else if (activeFilter === "available") {
        matchesApplicationFilter = !isApplied;
      }

      return matchesSearch && matchesApplicationFilter;
    });
  }, [courses, searchQuery, activeFilter, existingApplications]);

  return {
    courses,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredCourses,
  };
};
