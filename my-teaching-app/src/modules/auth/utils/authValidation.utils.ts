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

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Basic password validation (e.g., length)
export const validateMinPasswordLength = (password: string): boolean => {
  return password.length >= 8;
};

// Password strength calculation
export interface PasswordStrengthCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export const calculatePasswordStrength = (
  password: string
): PasswordStrengthCriteria => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
};

// Helper to get password strength text (could be combined with CSS class logic if preferred)
export const getPasswordStrengthFeedback = (
  password: string,
  strength: PasswordStrengthCriteria
): {
  text: string;
  level: "veryWeak" | "weak" | "medium" | "strong" | "";
} => {
  if (password.length === 0) return { text: "", level: "" };
  if (password.length < 4)
    return { text: "Very weak password", level: "veryWeak" };
  if (password.length < 6)
    return { text: "Please use 6+ characters", level: "weak" };
  if (
    strength.length &&
    strength.uppercase &&
    strength.lowercase &&
    strength.number &&
    strength.special
  )
    return { text: "Strong password", level: "strong" };
  if (
    strength.length &&
    (strength.uppercase || strength.lowercase) &&
    (strength.number || strength.special)
  )
    return { text: "Good password", level: "medium" };
  return { text: "Weak password", level: "weak" };
};
