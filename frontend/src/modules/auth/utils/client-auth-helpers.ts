// UserAccount interface is now defined in @/shared/types/user.ts
// import { UserAccount } from '@/shared/types/user'; // Components/utils would import this as needed

// Check if the email follows the pattern for specific roles
export const validateRoleSpecificEmail = (
  email: string,
  role: "tutor" | "lecturer"
): boolean => {
  const emailLowercase = email.toLowerCase();
  if (role === "tutor") {
    return emailLowercase.endsWith("@candidate.edu.au");
  } else if (role === "lecturer") {
    return emailLowercase.endsWith("@lecturer.edu.au");
  }
  return false;
};

// Add other client-side auth helpers here as needed
// e.g., functions for formatting user data for display, client-side validation rules (non-domain specific)

// Example: Basic password strength validation (can be expanded)
export const isPasswordStrongEnough = (password: string): boolean => {
  if (password.length < 8) return false;
  // Add more checks: uppercase, lowercase, number, special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
};
