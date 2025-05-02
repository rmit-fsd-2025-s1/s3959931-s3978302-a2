// Define types for lecturer data
export interface Lecturer {
  id: string;
  name: string;
  title: string;
  specialization: string;
  bio: string;
  courses: string;
  awards?: string;
  experience?: string;
  certifications?: string;
  publications?: string;
  contact: string;
}

// List of lecturers with their information
export const lecturers: Lecturer[] = [
  {
    id: 'lecturer1',
    name: 'Dr. Sophie Chen',
    title: 'Associate Professor',
    specialization: 'Artificial Intelligence & Machine Learning',
    bio: 'Dr. Chen holds a Ph.D. in Computer Science from MIT and has over 10 years of experience in AI research and education. She has published more than 30 papers in top-tier conferences and journals, and has led several major research projects on neural networks and deep learning applications.',
    courses: 'Advanced Machine Learning, Neural Networks, AI Ethics',
    awards: 'Best CS Educator 2023, AI Innovation Award 2021',
    contact: 'sophie.chen@lecturer.edu.au'
  },
  {
    id: 'lecturer2',
    name: 'Prof. Michael Rodriguez',
    title: 'Senior Lecturer',
    specialization: 'Software Engineering & Web Development',
    bio: 'Prof. Rodriguez brings 15+ years of industry experience as a software architect before joining academia. He worked at Google and Microsoft, leading development teams for large-scale applications. His teaching philosophy emphasizes practical skills alongside theoretical foundations.',
    courses: 'Software Architecture, Web Development, Project Management',
    experience: 'Google, Microsoft, Tech Startups',
    contact: 'm.rodriguez@lecturer.edu.au'
  },
  {
    id: 'lecturer3',
    name: 'Dr. Aisha Patel',
    title: 'Assistant Professor',
    specialization: 'Cybersecurity & Network Systems',
    bio: 'Dr. Patel specializes in network security and ethical hacking. With a background in cybersecurity consulting for financial institutions, she brings real-world security challenges into the classroom. She is actively researching blockchain security and IoT vulnerabilities.',
    courses: 'Network Security, Ethical Hacking, Cryptography',
    certifications: 'CISSP, CEH, CompTIA Security+',
    contact: 'a.patel@lecturer.edu.au'
  },
  {
    id: 'lecturer4',
    name: 'Dr. James Wilson',
    title: 'Professor',
    specialization: 'Data Science & Algorithms',
    bio: 'Dr. Wilson is a leading researcher in algorithm optimization and big data analytics. He has authored two textbooks on computational algorithms that are used in universities worldwide. Prior to his academic career, he worked at Amazon\'s data science division.',
    courses: 'Advanced Algorithms, Big Data Analysis, Computational Theory',
    publications: '2 textbooks, 45+ research papers',
    contact: 'j.wilson@lecturer.edu.au'
  }
];

// Function to get lecturer by ID
export const getLecturerById = (id: string): Lecturer | undefined => {
  return lecturers.find(lecturer => lecturer.id === id);
};

// Function to get all lecturers by specialization
export const getLecturersBySpecialization = (specialization: string): Lecturer[] => {
  return lecturers.filter(lecturer =>
    lecturer.specialization.toLowerCase().includes(specialization.toLowerCase())
  );
};

// Function to get lecturer's selections
export const getLecturerSelections = (lecturerId: string) => {
  if (typeof window !== 'undefined') {
    const selections = localStorage.getItem(`lecturer_selections_${lecturerId}`);
    return selections ? JSON.parse(selections) : [];
  }
  return [];
};

// Save lecturer's selection of a tutor
export const saveLecturerSelection = (lecturerId: string, tutorId: string, courseCode: string, comment: string = '', rank?: number) => {
  if (typeof window !== 'undefined') {
    const selections = getLecturerSelections(lecturerId);

    // Check if this tutor is already selected for this course
    const existingIndex = selections.findIndex(
      (s: { tutorId: string; courseCode: string; }) => s.tutorId === tutorId && s.courseCode === courseCode
    );

    const selection = {
      tutorId,
      courseCode,
      comment,
      dateSelected: new Date().toISOString().split('T')[0],
      rank
    };

    if (existingIndex >= 0) {
      // Update existing selection
      selections[existingIndex] = {
        ...selections[existingIndex],
        ...selection
      };
    } else {
      // Add new selection
      selections.push(selection);
    }

    localStorage.setItem(`lecturer_selections_${lecturerId}`, JSON.stringify(selections));
    return selection;
  }
};

// Format lecturer expertise for display
export const formatLecturerExpertise = (lecturer: Lecturer): string => {
  return `${lecturer.title} in ${lecturer.specialization}`;
};

// Get courses taught by lecturer
export const getLecturerCourses = (lecturerId: string): string[] => {
  const lecturer = getLecturerById(lecturerId);
  if (!lecturer) return [];
  return lecturer.courses.split(', ');
};