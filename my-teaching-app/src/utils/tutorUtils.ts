// Predefined skills for tutors
export const availableSkills = [
  'Java',
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Angular',
  'Node.js',
  'C/C++',
  'HTML/CSS',
  'SQL',
  'MongoDB',
  'Express.js',
  'Git',
  'Docker',
  'AWS',
  'Azure'
];

// Function to get random skills (2-3)
export const getRandomSkills = (): string[] => {
  const shuffled = [...availableSkills].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2)); // 2 or 3 skills
};

// Application type
export interface TutorApplication {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  courses: string[];
  previousRoles: string[];
  availability: 'Full Time' | 'Part Time';
  skills: string[];
  academicCredentials: string;
  dateApplied: string;
  selected?: boolean;
  selectedBy?: string;
  selectedDate?: string;
  selectedForCourses?: string[];
  comment?: string;
  rank?: number;
}

// Reset all applications to unselected status
export const resetAllApplicationsToUnselected = () => {
  if (typeof window !== 'undefined') {
    const applications = getApplications();
    const updatedApplications = applications.map(app => ({
      ...app,
      selected: false,
      selectedBy: undefined,
      selectedDate: undefined,
      selectedForCourses: undefined,
      rank: undefined,
      comment: undefined // Remove all lecturer comments by default
    }));
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
  }
};

// Initialize empty applications in localStorage if not exist
export const initializeApplications = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('applications')) {
      localStorage.setItem('applications', JSON.stringify([]));
    } else {
      // Reset all applications to unselected status
      resetAllApplicationsToUnselected();
    }
  }
};

// Get all applications
export const getApplications = (): TutorApplication[] => {
  if (typeof window !== 'undefined') {
    const applications = localStorage.getItem('applications');
    return applications ? JSON.parse(applications) : [];
  }
  return [];
};

// Move tutors without assigned subjects to unselected status
export const moveUnassignedTutorsToUnselected = () => {
  if (typeof window !== 'undefined') {
    const applications = getApplications();
    let hasChanges = false;

    const updatedApplications = applications.map(app => {
      // If tutor is selected but has no selectedForCourses or empty selectedForCourses
      if (app.selected && (!app.selectedForCourses || app.selectedForCourses.length === 0)) {
        hasChanges = true;
        return {
          ...app,
          selected: false,
          selectedBy: undefined,
          selectedDate: undefined,
          selectedForCourses: undefined,
          comment: app.comment || 'Moved to unselected due to no assigned subjects'
        };
      }
      return app;
    });

    if (hasChanges) {
      localStorage.setItem('applications', JSON.stringify(updatedApplications));
    }
  }
};

// Save application
export const saveApplication = (application: TutorApplication) => {
  if (typeof window !== 'undefined') {
    const applications = getApplications();

    // Check if application with this ID already exists
    const existingIndex = applications.findIndex(app => app.id === application.id);

    if (existingIndex >= 0) {
      // Update existing application
      applications[existingIndex] = application;
    } else {
      // Add new application with current date
      if (!application.dateApplied) {
        application.dateApplied = new Date().toISOString().split('T')[0];
      }
      // Ensure new applications are unselected and unranked by default
      const newApplication = {
        ...application,
        selected: false,
        selectedBy: undefined,
        selectedDate: undefined,
        selectedForCourses: undefined,
        rank: undefined,
        comment: undefined
      };
      applications.push(newApplication);
    }

    localStorage.setItem('applications', JSON.stringify(applications));

    // Trigger a custom event to notify other components
    const event = new CustomEvent('applicationUpdated', { detail: application });
    window.dispatchEvent(event);

    return application;
  }
};

// Get application by user ID
export const getApplicationByUserId = (userId: string): TutorApplication[] => {
  if (typeof window !== 'undefined') {
    const applications = getApplications();
    return applications.filter(app => app.userId === userId);
  }
  return [];
};

// Get application by ID
export const getApplicationById = (id: string): TutorApplication | undefined => {
  if (typeof window !== 'undefined') {
    const applications = getApplications();
    return applications.find(app => app.id === id);
  }
  return undefined;
};

// Get selected applications
export const getSelectedApplications = (): TutorApplication[] => {
  if (typeof window !== 'undefined') {
    const applications = getApplications();
    return applications.filter(app => app.selected === true);
  }
  return [];
};

// Get applications by course
export const getApplicationsByCourse = (courseCode: string): TutorApplication[] => {
  if (typeof window !== 'undefined') {
    const applications = getApplications();
    return applications.filter(app => app.courses.includes(courseCode));
  }
  return [];
};

// Initialize detailed applications with mock data for demo purposes
export const initializeDetailedApplications = () => {
  if (typeof window !== 'undefined') {
    const applications = getApplications();
    if (applications.length === 0) {
      const mockApplications: TutorApplication[] = [];
      
      // Save empty applications to localStorage
      localStorage.setItem('applications', JSON.stringify(mockApplications));
    }
  }
};

// Function to search applications by name, skill, or course
export const searchApplications = (query: string): TutorApplication[] => {
  if (!query) return getApplications();

  const applications = getApplications();
  const lowercaseQuery = query.toLowerCase();

  return applications.filter(app =>
    app.fullName.toLowerCase().includes(lowercaseQuery) ||
    app.courses.some(course => course.toLowerCase().includes(lowercaseQuery)) ||
    app.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery)) ||
    app.academicCredentials.toLowerCase().includes(lowercaseQuery)
  );
};