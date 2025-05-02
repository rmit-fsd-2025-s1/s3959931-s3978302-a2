// Predefined courses data
export const availableCourses = [
  { code: 'COSC1111', name: 'Computing Technology And Programming' },
  { code: 'COSC1112', name: 'Programming Fundamentals' },
  { code: 'COSC1114', name: 'Operating Systems Principles' },
  { code: 'COSC2408', name: 'Programming Project 1' },
  { code: 'COSC2410', name: 'Software Engineering Fundamentals' },
  { code: 'COSC2123', name: 'Algorithms And Analysis' },
  { code: 'COSC2676', name: 'Programming IoT Systems' },
  { code: 'COSC2299', name: 'Software Engineering Process And Tools' },
  { code: 'COSC2413', name: 'Web Programming' },
  { code: 'COSC2391', name: 'Further Programming' },
  { code: 'COSC2758', name: 'Full Stack Development' },
  { code: 'COSC2663', name: 'IT Security' }
];

// Function to get random role
export const getRandomRole = (): 'Tutor' | 'Lab-Assistant' => {
  return Math.random() > 0.5 ? 'Tutor' : 'Lab-Assistant';
};

// Function to get random availability
export const getRandomAvailability = (): 'Part Time' | 'Full Time' => {
  return Math.random() > 0.5 ? 'Part Time' : 'Full Time';
};

// Interfaces for course display and application
export interface CourseWithDetails {
  code: string;
  name: string;
  role: 'Tutor' | 'Lab-Assistant';
  availability: 'Part Time' | 'Full Time';
  skills?: string[];
}

// Function to get courses with random role and availability
export const getCoursesWithDetails = (): CourseWithDetails[] => {
  return availableCourses.map(course => ({
    ...course,
    role: getRandomRole(),
    availability: getRandomAvailability()
  }));
};

// Function to get a course by code
export const getCourseByCode = (code: string): { code: string; name: string } | undefined => {
  return availableCourses.find(course => course.code === code);
};

// Function to search courses by name or code
export const searchCourses = (query: string): { code: string; name: string }[] => {
  const lowercaseQuery = query.toLowerCase();
  return availableCourses.filter(course => 
    course.code.toLowerCase().includes(lowercaseQuery) || 
    course.name.toLowerCase().includes(lowercaseQuery)
  );
};