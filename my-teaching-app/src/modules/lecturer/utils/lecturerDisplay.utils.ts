// Lecturer interface is now defined in @/shared/types/lecturer.ts
import type { Lecturer } from "@/shared/types/lecturer";

// TODO: lecturers data to be moved to a mock data service later.
export const lecturers: Lecturer[] = [
  {
    id: "lecturer1",
    name: "Dr. Sophie Chen",
    title: "Associate Professor",
    specialization: "Artificial Intelligence & Machine Learning",
    bio: "Dr. Chen holds a Ph.D. in Computer Science from MIT and has over 10 years of experience in AI research and education. She has published more than 30 papers in top-tier conferences and journals, and has led several major research projects on neural networks and deep learning applications.",
    courses: "Advanced Machine Learning, Neural Networks, AI Ethics",
    awards: "Best CS Educator 2023, AI Innovation Award 2021",
    contact: "sophie.chen@lecturer.edu.au",
  },
  {
    id: "lecturer2",
    name: "Prof. Michael Rodriguez",
    title: "Senior Lecturer",
    specialization: "Software Engineering & Web Development",
    bio: "Prof. Rodriguez brings 15+ years of industry experience as a software architect before joining academia. He worked at Google and Microsoft, leading development teams for large-scale applications. His teaching philosophy emphasizes practical skills alongside theoretical foundations.",
    courses: "Software Architecture, Web Development, Project Management",
    experience: "Google, Microsoft, Tech Startups",
    contact: "m.rodriguez@lecturer.edu.au",
  },
  {
    id: "lecturer3",
    name: "Dr. Aisha Patel",
    title: "Assistant Professor",
    specialization: "Cybersecurity & Network Systems",
    bio: "Dr. Patel specializes in network security and ethical hacking. With a background in cybersecurity consulting for financial institutions, she brings real-world security challenges into the classroom. She is actively researching blockchain security and IoT vulnerabilities.",
    courses: "Network Security, Ethical Hacking, Cryptography",
    certifications: "CISSP, CEH, CompTIA Security+",
    contact: "a.patel@lecturer.edu.au",
  },
  {
    id: "lecturer4",
    name: "Dr. James Wilson",
    title: "Professor",
    specialization: "Data Science & Algorithms",
    bio: "Dr. Wilson is a leading researcher in algorithm optimization and big data analytics. He has authored two textbooks on computational algorithms that are used in universities worldwide. Prior to his academic career, he worked at Amazon's data science division.",
    courses: "Advanced Algorithms, Big Data Analysis, Computational Theory",
    publications: "2 textbooks, 45+ research papers",
    contact: "j.wilson@lecturer.edu.au",
  },
];

// Function to get lecturer by ID (primarily for display purposes from local data)
export const getLecturerByIdForDisplay = (id: string): Lecturer | undefined => {
  return lecturers.find((lecturer) => lecturer.id === id);
};

// Format lecturer expertise for display
export const formatLecturerExpertise = (lecturer: Lecturer): string => {
  return `${lecturer.title} in ${lecturer.specialization}`;
};

// Get lecturer's selections from localStorage (to be replaced by API call)
export const getLecturerSelectionsFromStorage = (
  lecturerId: string
): unknown[] => {
  // Type unknown[] for now
  if (typeof window !== "undefined") {
    const selections = localStorage.getItem(
      `lecturer_selections_${lecturerId}`
    );
    try {
      return selections ? JSON.parse(selections) : [];
    } catch (e) {
      console.error("Error parsing lecturer selections from localStorage:", e);
      return [];
    }
  }
  return [];
};

// Function to get lecturers by specialization (moved from lecturerUtils.ts)
export const getLecturersBySpecialization = (
  specialization: string
): Lecturer[] => {
  return lecturers.filter((lecturer) =>
    lecturer.specialization.toLowerCase().includes(specialization.toLowerCase())
  );
};

// Get courses taught by lecturer (moved from lecturerUtils.ts)
export const getLecturerCourses = (lecturerId: string): string[] => {
  const lecturer = getLecturerByIdForDisplay(lecturerId); // Use existing display util
  if (!lecturer) return [];
  return lecturer.courses.split(", ").map((course) => course.trim()); // Added trim
};

// TODO: Add other client-side lecturer display helpers here.
