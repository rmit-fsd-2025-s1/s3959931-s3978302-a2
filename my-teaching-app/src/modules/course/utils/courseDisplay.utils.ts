import type { CourseDetails } from "@/shared/types/course"; // Import the global type

// TODO: availableCourses should eventually be fetched from an API or a central data store.
export const availableCourses = [
  { code: "COSC1111", name: "Computing Technology And Programming" },
  { code: "COSC1112", name: "Programming Fundamentals" },
  { code: "COSC1114", name: "Operating Systems Principles" },
  { code: "COSC2408", name: "Programming Project 1" },
  { code: "COSC2410", name: "Software Engineering Fundamentals" },
  { code: "COSC2123", name: "Algorithms And Analysis" },
  { code: "COSC2676", name: "Programming IoT Systems" },
  { code: "COSC2299", name: "Software Engineering Process And Tools" },
  { code: "COSC2413", name: "Web Programming" },
  { code: "COSC2391", name: "Further Programming" },
  { code: "COSC2758", name: "Full Stack Development" },
  { code: "COSC2663", name: "IT Security" },
];

// CourseDetails interface is now imported globally.
// Original local definition removed.

// Function to get random role - client-side display helper
export const getRandomRole = (): "Tutor" | "Lab-Assistant" => {
  return Math.random() > 0.5 ? "Tutor" : "Lab-Assistant";
};

// Function to get random availability - client-side display helper
export const getRandomAvailability = (): "Part Time" | "Full Time" => {
  return Math.random() > 0.5 ? "Part Time" : "Full Time";
};

// TODO: getCoursesWithDetails, getCourseByCode, searchCourses might belong to a data service/layer later.
// For now, keeping them here as they depend on availableCourses and CourseWithDetails.

// Function to get courses with random role and availability
export const getCoursesWithDetails = (): CourseDetails[] => {
  return availableCourses.map((course) => ({
    ...course,
    role: getRandomRole(),
    availability: getRandomAvailability(),
  }));
};

// Function to get a course by code (moved from core/utils/coursesUtils.ts)
export const getCourseByCode = (
  code: string
): { code: string; name: string } | undefined => {
  // Note: returns basic course type, not CourseDetails
  return availableCourses.find((course) => course.code === code);
};

// Function to search courses by name or code (moved from core/utils/coursesUtils.ts)
export const searchCourses = (
  query: string
): { code: string; name: string }[] => {
  // Note: returns basic course type
  const lowercaseQuery = query.toLowerCase();
  return availableCourses.filter(
    (course) =>
      course.code.toLowerCase().includes(lowercaseQuery) ||
      course.name.toLowerCase().includes(lowercaseQuery)
  );
};
