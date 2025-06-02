// TODO: availableSkills should come from a central data store or API.
export const availableSkills = [
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Node.js",
  "C/C++",
  "HTML/CSS",
  "SQL",
  "MongoDB",
  "Express.js",
  "Git",
  "Docker",
  "AWS",
  "Azure",
];

// TutorApplication (now Application) is defined in @/shared/types/application.ts
import { Application as TutorApplication } from "@/shared/types/application"; // Alias if needed

// Function to get random skills (2-3) - client-side display helper for UI, if needed for initial form population etc.
export const getRandomSkillsForDisplay = (): string[] => {
  const shuffled = [...availableSkills].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
};

// Get all applications from localStorage (temporary, to be replaced by API call)
export const getApplicationsFromStorage = (): TutorApplication[] => {
  if (typeof window !== "undefined") {
    const applications = localStorage.getItem("applications");
    try {
      return applications ? JSON.parse(applications) : [];
    } catch (e) {
      console.error("Error parsing applications from localStorage:", e);
      return [];
    }
  }
  return [];
};

// Save application to localStorage (temporary, to be replaced by API call)
export const saveApplicationToStorage = (
  application: TutorApplication
): TutorApplication | undefined => {
  if (typeof window !== "undefined") {
    const applications = getApplicationsFromStorage();
    const existingIndex = applications.findIndex(
      (app) => app.id === application.id
    );

    if (existingIndex >= 0) {
      applications[existingIndex] = application;
    } else {
      if (!application.dateApplied) {
        application.dateApplied = new Date().toISOString().split("T")[0];
      }
      // Ensure new applications are unselected and unranked by default (if not already set)
      const newApplication = {
        selected: false,
        selectedBy: undefined,
        selectedDate: undefined,
        selectedForCourses: undefined,
        rank: undefined,
        comment: undefined,
        ...application, // Spread application last to allow pre-set values if any
      };
      applications.push(newApplication);
    }
    localStorage.setItem("applications", JSON.stringify(applications));

    // Trigger a custom event to notify other components (e.g., lecturer dashboard)
    const event = new CustomEvent("applicationUpdated", {
      detail: application,
    });
    window.dispatchEvent(event);

    return application;
  }
  return undefined;
};

// TODO: Add other client-side application display/formatting helpers here.
// Example: Format application date for display
export const formatApplicationDateForDisplay = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Initialize detailed applications with mock data for demo purposes (moved from tutorUtils.ts)
// Ensures that the applications key in localStorage is initialized as an empty array if it doesn't exist.
export const initializeDetailedApplicationsInStorage = () => {
  if (typeof window !== "undefined") {
    const applications = getApplicationsFromStorage(); // Use the local getter
    if (applications.length === 0) {
      // Only initialize if truly empty after parsing
      localStorage.setItem("applications", JSON.stringify([]));
    }
    // The original also reset all applications, that logic might be separate or re-evaluated.
    // For now, this just ensures the key exists.
  }
};

// Reset all applications to unselected status (moved from tutorUtils.ts)
export const resetAllApplicationsToUnselectedInStorage = () => {
  if (typeof window !== "undefined") {
    const applications = getApplicationsFromStorage(); // Use local getter
    const updatedApplications = applications.map((app) => ({
      ...app,
      selected: false,
      selectedBy: undefined,
      selectedDate: undefined,
      selectedForCourses: undefined,
      rank: undefined,
      comment: undefined,
    }));
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
  }
};

// Initialize and reset applications in localStorage (moved and adapted from tutorUtils.ts)
export const initializeAndResetApplicationsInStorage = () => {
  if (typeof window !== "undefined") {
    if (!localStorage.getItem("applications")) {
      localStorage.setItem("applications", JSON.stringify([]));
    } else {
      // Optionally reset all applications upon initialization if desired
      // resetAllApplicationsToUnselectedInStorage();
      // For now, just ensuring it exists or is empty array from initializeDetailedApplicationsInStorage is enough.
      // If a full reset is intended on every app load, uncomment the line above.
    }
    // Ensure it's at least an empty array if `initializeDetailedApplicationsInStorage` hasn't run
    initializeDetailedApplicationsInStorage();
  }
};
