import { availableCourses } from "@/shared/data/courses";

// Function to get a course by code
export const getCourseByCode = (
  code: string
): { code: string; name: string } | undefined => {
  return availableCourses.find((course) => course.code === code);
};

// Function to search courses by name or code
export const searchCourses = (
  query: string
): { code: string; name: string }[] => {
  const lowercaseQuery = query.toLowerCase();
  return availableCourses.filter(
    (course) =>
      course.code.toLowerCase().includes(lowercaseQuery) ||
      course.name.toLowerCase().includes(lowercaseQuery)
  );
};
