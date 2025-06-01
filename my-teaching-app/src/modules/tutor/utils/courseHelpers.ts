import type { CourseDetails } from "@/shared/types/course";
import { availableCourses } from "@/shared/data/courses";

// Function to get random role - client-side display helper
export const getRandomRole = (): "Tutor" | "Lab-Assistant" => {
  return Math.random() > 0.5 ? "Tutor" : "Lab-Assistant";
};

// Function to get random availability - client-side display helper
export const getRandomAvailability = (): "Part Time" | "Full Time" => {
  return Math.random() > 0.5 ? "Part Time" : "Full Time";
};

// Function to get courses with random role and availability for tutor application context
export const getCoursesWithDetails = (): CourseDetails[] => {
  return availableCourses.map((course) => ({
    ...course,
    role: getRandomRole(),
    availability: getRandomAvailability(),
  }));
};
