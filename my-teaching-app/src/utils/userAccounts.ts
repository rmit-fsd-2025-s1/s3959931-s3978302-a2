// Types for user accounts
export interface UserAccount {
    id: string;
    email: string;
    password: string;
    role: "tutor" | "lecturer";
    fullName: string;
    bio?: string;
    skills?: string[];
    academicCredentials?: string;
}

// 12 tutor accounts with minimal information
const tutorAccounts: UserAccount[] = [
    {
        id: "tutor1",
        email: "john.doe@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "John Doe",
        academicCredentials: "Bachelor of Computer Science",
    },
    {
        id: "tutor2",
        email: "jane.smith@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Jane Smith",
        academicCredentials: "Masters in Computer Science",
    },
    {
        id: "tutor3",
        email: "michael.brown@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Michael Brown",
        academicCredentials: "Bachelor of Information Technology",
    },
    {
        id: "tutor4",
        email: "emily.johnson@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Emily Johnson",
        academicCredentials: "Masters in Computer Engineering",
    },
    {
        id: "tutor5",
        email: "david.wilson@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "David Wilson",
        academicCredentials: "Bachelor of Computer Science",
    },
    {
        id: "tutor6",
        email: "sarah.taylor@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Sarah Taylor",
        academicCredentials: "Ph.D. Candidate in Cybersecurity",
    },
    {
        id: "tutor7",
        email: "alex.martinez@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Alex Martinez",
        academicCredentials: "Masters in Software Engineering",
    },
    {
        id: "tutor8",
        email: "olivia.anderson@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Olivia Anderson",
        academicCredentials: "Bachelor of Science in Computer Science",
    },
    {
        id: "tutor9",
        email: "james.thomas@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "James Thomas",
        academicCredentials: "Masters in Web Technologies",
    },
    {
        id: "tutor10",
        email: "sophia.garcia@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Sophia Garcia",
        academicCredentials: "Bachelor of Information Technology",
    },
    {
        id: "tutor11",
        email: "daniel.lee@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Daniel Lee",
        academicCredentials: "Ph.D. Student in Computer Science",
    },
    {
        id: "tutor12",
        email: "emma.clark@tutor.edu.au",
        password: "Password123!",
        role: "tutor",
        fullName: "Emma Clark",
        academicCredentials: "Masters in IT Security",
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
    },
    {
        id: "lecturer2",
        email: "m.rodriguez@lecturer.edu.au",
        password: "Password123!",
        role: "lecturer",
        fullName: "Prof. Michael Rodriguez",
        bio: "15+ years of industry experience in software architecture",
    },
    {
        id: "lecturer3",
        email: "a.patel@lecturer.edu.au",
        password: "Password123!",
        role: "lecturer",
        fullName: "Dr. Aisha Patel",
        bio: "Specializes in network security and ethical hacking",
    },
    {
        id: "lecturer4",
        email: "j.wilson@lecturer.edu.au",
        password: "Password123!",
        role: "lecturer",
        fullName: "Dr. James Wilson",
        bio: "Expert in algorithm optimization and data science",
    },
];

// All user accounts combined
export const userAccounts: UserAccount[] = [
    ...tutorAccounts,
    ...lecturerAccounts,
];

// Initialize user accounts in localStorage
export const initializeUserAccounts = () => {
    if (typeof window !== "undefined") {
        // Check if accounts already exist
        if (!localStorage.getItem("users")) {
            localStorage.setItem("users", JSON.stringify(userAccounts));
        }
    }
};

// Get user by email and password
export const getUserByCredentials = (
    email: string,
    password: string
): UserAccount | undefined => {
    if (typeof window !== "undefined") {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        return users.find(
            (user: UserAccount) =>
                user.email === email && user.password === password
        );
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
            (user: UserAccount) =>
                user.email.toLowerCase() === email.toLowerCase()
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

            // Remove role, email, and password properties if they exist
            delete profileDataCopy.role;
            delete profileDataCopy.email;
            delete profileDataCopy.password;

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

// Check if the email follows the pattern for specific roles
export const validateRoleSpecificEmail = (
    email: string,
    role: "tutor" | "lecturer"
): boolean => {
    const emailLowercase = email.toLowerCase();
    if (role === "tutor") {
        return emailLowercase.endsWith("@tutor.edu.au");
    } else if (role === "lecturer") {
        return emailLowercase.endsWith("@lecturer.edu.au");
    }
    return false;
};
