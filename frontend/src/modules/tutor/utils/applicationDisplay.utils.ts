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
import StorageManager from "@/shared/utils/storageManager";
import { getMelbourneDateOnly } from "@/shared/utils/dateUtils";

// Function to get random skills (2-3) - client-side display helper for UI, if needed for initial form population etc.
export const getRandomSkillsForDisplay = (): string[] => {
  const shuffled = [...availableSkills].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
};

// Validation helper for applications
const validateApplication = (app: unknown): app is TutorApplication => {
  if (!app || typeof app !== 'object') return false;

  const typedApp = app as Record<string, unknown>;

  return !!(
    typeof typedApp.id === 'string' &&
    typeof typedApp.fullName === 'string' &&
    typeof typedApp.email === 'string' &&
    Array.isArray(typedApp.skills) &&
    Array.isArray(typedApp.courses) &&
    typeof typedApp.sessionType === 'string' &&
    Array.isArray(typedApp.availability)
  );
};

// Get all applications from storage with validation (temporary, to be replaced by API call)
export const getApplicationsFromStorage = (): TutorApplication[] => {
  if (typeof window !== "undefined") {
    try {
      // Try versioned storage first
      const versionedApplications = StorageManager.getVersionedItem<TutorApplication[]>("applications");
      if (versionedApplications && Array.isArray(versionedApplications)) {
        const validApplications = versionedApplications.filter(validateApplication);
        if (validApplications.length !== versionedApplications.length) {
          console.warn(`${versionedApplications.length - validApplications.length} invalid applications filtered out`);
          StorageManager.setVersionedItem("applications", validApplications);
        }
        return validApplications;
      }

      // Fallback to regular storage
      const applicationsStr = StorageManager.getItem("applications");
      if (!applicationsStr) return [];

      const applications = JSON.parse(applicationsStr);

      // Validate data structure
      if (!Array.isArray(applications)) {
        console.warn("Invalid applications data structure, resetting...");
        StorageManager.removeItem("applications");
        return [];
      }

      // Validate each application
      const validApplications = applications.filter((app, index) => {
        const isValid = validateApplication(app);
        if (!isValid) {
          console.warn(`Invalid application at index ${index}:`, app);
        }
        return isValid;
      });

      // If some applications were invalid, update storage
      if (validApplications.length !== applications.length) {
        StorageManager.setVersionedItem("applications", validApplications);
      } else {
        // Migrate valid data to versioned storage
        StorageManager.setVersionedItem("applications", validApplications);
      }

      return validApplications;

    } catch (e) {
      console.error("Error parsing applications from storage:", e);
      // Clear corrupted data
      StorageManager.removeItem("applications");
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
        application.dateApplied = getMelbourneDateOnly();
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
    StorageManager.setVersionedItem("applications", applications);

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
      StorageManager.setVersionedItem("applications", []);
    }
    // The original also reset all applications, that logic might be separate or re-evaluated.
    // For now, this just ensures the key exists.
  }
};

// Reset all applications to unselected status (moved from tutorUtils.ts)
export const resetAllApplicationsToUnselectedInStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const applications = getApplicationsFromStorage(); // Use local getter with validation
      const updatedApplications = applications.map((app) => ({
        ...app,
        selected: false,
        selectedBy: undefined,
        selectedDate: undefined,
        selectedForCourses: undefined,
        rank: undefined,
        comment: undefined,
      }));
      StorageManager.setVersionedItem("applications", updatedApplications);
    } catch (e) {
      console.error("Error resetting applications:", e);
    }
  }
};

// Initialize and reset applications in storage (moved and adapted from tutorUtils.ts)
export const initializeAndResetApplicationsInStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const existingApplications = getApplicationsFromStorage();
      if (existingApplications.length === 0) {
        StorageManager.setVersionedItem("applications", []);
      }
      // Ensure it's at least an empty array if `initializeDetailedApplicationsInStorage` hasn't run
      initializeDetailedApplicationsInStorage();
    } catch (e) {
      console.error("Error initializing applications storage:", e);
      StorageManager.setVersionedItem("applications", []);
    }
  }
};
