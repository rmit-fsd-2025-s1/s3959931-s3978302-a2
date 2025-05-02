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
        comment: undefined // Remove lecturer comments by default
      };
      applications.push(newApplication);
    }

    localStorage.setItem('applications', JSON.stringify(applications));

    // Move unassigned tutors to unselected status
    moveUnassignedTutorsToUnselected();

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
    // Only initialize if no applications exist
    const applications = getApplications();
    if (applications.length === 0) {
      const mockApplications: TutorApplication[] = [
        {
          id: 'app1',
          userId: 'tutor1',
          email: 'john.doe@tutor.edu.au',
          fullName: 'John Doe',
          courses: ['COSC1111', 'COSC2410', 'COSC1112', 'COSC2413'],
          previousRoles: ['COSC1112 Lab Assistant (2024)'],
          availability: 'Part Time',
          skills: ['Java', 'Python', 'Git'],
          academicCredentials: 'Bachelor of Computer Science with High Distinction',
          dateApplied: '2025-03-15',
          selected: false
        },
        {
          id: 'app2',
          userId: 'tutor2',
          email: 'jane.smith@tutor.edu.au',
          fullName: 'Jane Smith',
          courses: ['COSC2413', 'COSC2758'],
          previousRoles: ['COSC2123 Lab Assistant (2024)', 'COSC2413 Tutor (2023)'],
          availability: 'Full Time',
          skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
          academicCredentials: 'Masters in Computer Science, specializing in Web Technologies',
          dateApplied: '2025-03-12',
          selected: false
        },
        {
          id: 'app3',
          userId: 'tutor3',
          email: 'michael.brown@tutor.edu.au',
          fullName: 'Michael Brown',
          courses: ['COSC1114', 'COSC2123'],
          previousRoles: [],
          availability: 'Part Time',
          skills: ['C/C++', 'Python', 'Docker'],
          academicCredentials: 'Bachelor of Information Technology with First Class Honours',
          dateApplied: '2025-03-10',
          selected: false
        },
        {
          id: 'app4',
          userId: 'tutor4',
          email: 'emily.johnson@tutor.edu.au',
          fullName: 'Emily Johnson',
          courses: ['COSC2410', 'COSC2408', 'COSC2758'],
          previousRoles: ['COSC2410 Tutor (2024)', 'COSC1111 Lab Assistant (2023)'],
          availability: 'Full Time',
          skills: ['Java', 'React', 'SQL', 'Git'],
          academicCredentials: 'Masters in Computer Engineering, Bachelor of Computer Science',
          dateApplied: '2025-03-13',
          selected: false
        },
        {
          id: 'app5',
          userId: 'tutor5',
          email: 'david.wilson@tutor.edu.au',
          fullName: 'David Wilson',
          courses: ['COSC1112', 'COSC2676'],
          previousRoles: ['COSC1112 Lab Assistant (2023)'],
          availability: 'Part Time',
          skills: ['JavaScript', 'Python', 'SQL'],
          academicCredentials: 'Bachelor of Computer Science with Distinction',
          dateApplied: '2025-03-09',
          selected: false
        },
        {
          id: 'app6',
          userId: 'tutor6',
          email: 'sarah.taylor@tutor.edu.au',
          fullName: 'Sarah Taylor',
          courses: ['COSC2663', 'COSC2299'],
          previousRoles: ['COSC2663 Lab Assistant (2024)'],
          availability: 'Part Time',
          skills: ['Cybersecurity', 'Python', 'Docker', 'AWS'],
          academicCredentials: 'Ph.D. Candidate in Cybersecurity, Masters in IT Security',
          dateApplied: '2025-03-14',
          selected: false
        },
        {
          id: 'app7',
          userId: 'tutor7',
          email: 'alex.martinez@tutor.edu.au',
          fullName: 'Alex Martinez',
          courses: ['COSC1111', 'COSC2413'],
          previousRoles: ['COSC1111 Lab Assistant (2024)'],
          availability: 'Full Time',
          skills: ['Java', 'Python', 'React', 'Node.js'],
          academicCredentials: 'Masters in Software Engineering',
          dateApplied: '2025-03-11',
          selected: false
        },
        {
          id: 'app8',
          userId: 'tutor8',
          email: 'olivia.anderson@tutor.edu.au',
          fullName: 'Olivia Anderson',
          courses: ['COSC2408', 'COSC2758'],
          previousRoles: ['COSC2408 Tutor (2024)'],
          availability: 'Part Time',
          skills: ['JavaScript', 'TypeScript', 'React', 'Angular'],
          academicCredentials: 'Bachelor of Science in Computer Science',
          dateApplied: '2025-03-16',
          selected: false
        },
        {
          id: 'app9',
          userId: 'tutor9',
          email: 'james.thomas@tutor.edu.au',
          fullName: 'James Thomas',
          courses: ['COSC1112', 'COSC2410'],
          previousRoles: ['COSC1112 Lab Assistant (2023)'],
          availability: 'Full Time',
          skills: ['Java', 'Python', 'SQL', 'Git'],
          academicCredentials: 'Masters in Web Technologies',
          dateApplied: '2025-03-17',
          selected: false
        },
        {
          id: 'app10',
          userId: 'tutor10',
          email: 'sophia.lee@tutor.edu.au',
          fullName: 'Sophia Lee',
          courses: ['COSC1111', 'COSC2413', 'COSC2758'],
          previousRoles: ['COSC1111 Lab Assistant (2023)'],
          availability: 'Part Time',
          skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
          academicCredentials: 'Ph.D. in Artificial Intelligence',
          dateApplied: '2025-03-18',
          selected: false
        },
        {
          id: 'app11',
          userId: 'tutor11',
          email: 'william.chen@tutor.edu.au',
          fullName: 'William Chen',
          courses: ['COSC1112', 'COSC2410', 'COSC2663'],
          previousRoles: ['COSC1112 Tutor (2024)'],
          availability: 'Full Time',
          skills: ['Java', 'C/C++', 'Git', 'Docker'],
          academicCredentials: 'Bachelor of Computer Science with First Class Honours',
          dateApplied: '2025-03-19',
          selected: false
        },
        {
          id: 'app12',
          userId: 'tutor12',
          email: 'ava.patel@tutor.edu.au',
          fullName: 'Ava Patel',
          courses: ['COSC1114', 'COSC2123', 'COSC2299'],
          previousRoles: ['COSC1114 Lab Assistant (2024)'],
          availability: 'Part Time',
          skills: ['Python', 'JavaScript', 'React', 'Node.js'],
          academicCredentials: 'Masters in Computer Science, specializing in Software Engineering',
          dateApplied: '2025-03-20',
          selected: false
        }
      ];

      // Save mock applications to localStorage
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