// filepath: c:\s3978302\Full Stack Development\s3959931-s3978302-a2\my-teaching-app\src\modules\auth\utils\userAccounts.ts
import type { UserAccount } from "@/shared/types/user"; // Import from shared types

// Types for user accounts - REMOVED as it's imported
/*
export interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: "tutor" | "lecturer";
  fullName: string;
  bio?: string;
  skills?: string[];
  academicCredentials?: string;
  avatarPath?: string;
}
*/

// 12 tutor accounts with minimal information
const tutorAccounts: UserAccount[] = [
  {
    id: "tutor1",
    email: "john.doe@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "John Doe",
    academicCredentials: "Bachelor of Computer Science",
    avatarPath: "/avatars/avatar-1.jpg",
  },
  {
    id: "tutor2",
    email: "jane.smith@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Jane Smith",
    academicCredentials: "Masters in Computer Science",
    avatarPath: "/avatars/avatar-2.jpg",
  },
  {
    id: "tutor3",
    email: "michael.brown@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Michael Brown",
    academicCredentials: "Bachelor of Information Technology",
    avatarPath: "/avatars/avatar-3.jpg",
  },
  {
    id: "tutor4",
    email: "emily.johnson@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Emily Johnson",
    academicCredentials: "Masters in Computer Engineering",
    avatarPath: "/avatars/avatar-4.jpg",
  },
  {
    id: "tutor5",
    email: "david.wilson@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "David Wilson",
    academicCredentials: "Bachelor of Computer Science",
    avatarPath: "/avatars/avatar-5.jpg",
  },
  {
    id: "tutor6",
    email: "sarah.taylor@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Sarah Taylor",
    academicCredentials: "Ph.D. Candidate in Cybersecurity",
    avatarPath: "/avatars/avatar-6.jpg",
  },
  {
    id: "tutor7",
    email: "alex.martinez@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Alex Martinez",
    academicCredentials: "Masters in Software Engineering",
    avatarPath: "/avatars/avatar-7.jpg",
  },
  {
    id: "tutor8",
    email: "olivia.anderson@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Olivia Anderson",
    academicCredentials: "Bachelor of Science in Computer Science",
    avatarPath: "/avatars/avatar-8.jpg",
  },
  {
    id: "tutor9",
    email: "james.thomas@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "James Thomas",
    academicCredentials: "Masters in Web Technologies",
    avatarPath: "/avatars/avatar-9.jpg",
  },
  {
    id: "tutor10",
    email: "sophia.garcia@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Sophia Garcia",
    academicCredentials: "Bachelor of Information Technology",
    avatarPath: "/avatars/avatar-10.jpg",
  },
  {
    id: "tutor11",
    email: "daniel.lee@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Daniel Lee",
    academicCredentials: "Ph.D. Student in Computer Science",
    avatarPath: "/avatars/avatar-11.jpg",
  },
  {
    id: "tutor12",
    email: "emma.clark@tutor.edu.au",
    password: "Password123!",
    role: "tutor",
    fullName: "Emma Clark",
    academicCredentials: "Masters in IT Security",
    avatarPath: "/avatars/avatar-12.jpg",
  },
];

// 4 lecturer accounts
const lecturerAccounts: UserAccount[] = [
  {
    id: "lecturer1",
    email: "sophie.chen@lecturer.edu.au",
    password: "Password123!",
    role: "lecturer",
    fullName: "Dr. Sophie Chen",
    bio: "Specializes in AI research and education",
    avatarPath: "/lecturers/lecturer-1.jpg",
  },
  {
    id: "lecturer2",
    email: "m.rodriguez@lecturer.edu.au",
    password: "Password123!",
    role: "lecturer",
    fullName: "Prof. Michael Rodriguez",
    bio: "15+ years of industry experience in software architecture",
    avatarPath: "/lecturers/lecturer-2.jpg",
  },
  {
    id: "lecturer3",
    email: "a.patel@lecturer.edu.au",
    password: "Password123!",
    role: "lecturer",
    fullName: "Dr. Aisha Patel",
    bio: "Specializes in network security and ethical hacking",
    avatarPath: "/lecturers/lecturer-3.jpg",
  },
  {
    id: "lecturer4",
    email: "j.wilson@lecturer.edu.au",
    password: "Password123!",
    role: "lecturer",
    fullName: "Dr. James Wilson",
    bio: "Expert in algorithm optimization and data science",
    avatarPath: "/lecturers/lecturer-4.jpg",
  },
];

// All user accounts combined
export const userAccounts: UserAccount[] = [
  ...tutorAccounts,
  ...lecturerAccounts,
];

// Initialize user accounts in localStorage
export const initializeUserAccounts = () => {
  console.log("initializeUserAccounts called");
  if (typeof window !== "undefined") {
    console.log("Window is defined, checking localStorage");
    // Check if accounts already exist
    const existingUsers = localStorage.getItem("users");
    console.log("Existing users in localStorage:", existingUsers);

    // Check if we need to reinitialize (no users or users missing password fields)
    let needsUpdate = false;

    if (!existingUsers) {
      needsUpdate = true;
      console.log("No existing users found, initializing with mock data");
    } else {
      // Check if existing users have password fields
      try {
        const parsedUsers = JSON.parse(existingUsers);
        const hasPasswordFields = parsedUsers.every((user: UserAccount) =>
          user.hasOwnProperty("password")
        );
        if (!hasPasswordFields) {
          needsUpdate = true;
          console.log(
            "Existing users missing password fields, updating with new data"
          );
        }
      } catch (error) {
        console.log("Error parsing existing users:", error);
        needsUpdate = true;
        console.log("Error parsing existing users, reinitializing");
      }
    }

    if (needsUpdate) {
      console.log("userAccounts to be stored:", userAccounts);
      localStorage.setItem("users", JSON.stringify(userAccounts));
      console.log("Users stored in localStorage successfully");
    } else {
      console.log(
        "Users already exist in localStorage, skipping initialization"
      );
    }
  }
};

// Get user by email and password
export const getUserByCredentials = (
  email: string,
  passwordAttempt: string // Renamed for clarity, actual password check is mock
): UserAccount | undefined => {
  if (typeof window !== "undefined") {
    const users = JSON.parse(
      localStorage.getItem("users") || "[]"
    ) as UserAccount[];
    // This is mock authentication. In a real app, never store/compare plaintext passwords.
    return users.find((user: UserAccount) => {
      // Mock authentication: for demo purposes, accept any password that equals "Password123!"
      // This part would be replaced by an API call.
      return user.email === email && user.password === passwordAttempt;
    });
  }
  return undefined;
};

// Get user by ID
export const getUserById = (id: string): UserAccount | undefined => {
  if (typeof window !== "undefined") {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.find((user: UserAccount) => user.id === id);
  }
  return undefined;
};

// Get user by email
export const getUserByEmail = (email: string): UserAccount | undefined => {
  if (typeof window !== "undefined") {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.find(
      (user: UserAccount) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  return undefined;
};

// Update user profile information
export const updateUserProfile = (
  userId: string,
  profileData: Partial<UserAccount>
): UserAccount | undefined => {
  if (typeof window !== "undefined") {
    const users = JSON.parse(
      localStorage.getItem("users") || "[]"
    ) as UserAccount[];
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex >= 0) {
      // Make a copy of the profileData to avoid modifying the original
      const profileDataCopy = { ...profileData };

      // Remove role and email properties if they exist (these should not be modifiable)
      delete profileDataCopy.role;
      delete profileDataCopy.email;

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        ...profileDataCopy,
      };

      localStorage.setItem("users", JSON.stringify(users));
      return users[userIndex];
    }
  }
  return undefined;
};

/* Function validateRoleSpecificEmail moved to authValidation.utils.ts */
