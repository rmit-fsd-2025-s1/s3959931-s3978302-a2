export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  role: "tutor" | "lecturer" | "admin"; // Added admin as a potential future role
  fullName: string;
  bio?: string;
  skills?: string[]; // For tutors
  academicCredentials?: string; // For tutors
  avatarPath?: string;
  // Consider adding other relevant non-sensitive fields
}

// You might also define specific types for different user roles if they diverge significantly
// export interface TutorProfile extends UserAccount { role: "tutor"; /* tutor-specific fields */ }
// export interface LecturerProfile extends UserAccount { role: "lecturer"; /* lecturer-specific fields */ }
