"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation"; // For navigation TODO
// import { useRouter } from 'next/router'; // To be replaced by navigation hooks or callbacks
import { initializeUserAccounts } from "@/modules/auth/utils/userAccounts"; // Kept for now, related to localStorage
import { initializeDetailedApplicationsInStorage } from "@/modules/tutor/utils/applicationDisplay.utils"; // Updated import
import styles from "./signin-form.module.css";
import {
  validateEmail,
  validateMinPasswordLength,
  calculatePasswordStrength,
  getPasswordStrengthFeedback,
  type PasswordStrengthCriteria,
} from "@/modules/auth/utils/authValidation.utils";

// TODO: Move validation logic to a shared utility or hook
// TODO: Replace localStorage logic with API calls/services
// TODO: Refactor navigation to use props or a navigation service

export default function SignInForm() {
  // const router = useRouter(); // To be refactored
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"tutor" | "lecturer">("tutor");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordStrengthCriteria, setPasswordStrengthCriteria] =
    useState<PasswordStrengthCriteria>({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    });

  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeUserAccounts();
      initializeDetailedApplicationsInStorage();
    }
  }, []);

  useEffect(() => {
    setPasswordStrengthCriteria(calculatePasswordStrength(password));
  }, [password]);

  const getUserByCredentials = (
    emailVal: string,
    passwordVal: string,
    roleVal: string
  ) => {
    if (typeof window !== "undefined") {
      interface UserType {
        id: string;
        email: string;
        password: string;
        role: string;
        fullName: string;
        avatarPath?: string;
      }
      const users = JSON.parse(
        localStorage.getItem("users") || "[]"
      ) as UserType[];
      const user = users.find(
        (u: UserType) =>
          u.email.toLowerCase() === emailVal.toLowerCase() &&
          u.password === passwordVal
      );
      if (user && user.role === roleVal) {
        return user;
      }
    }
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (!validateMinPasswordLength(password)) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const user = getUserByCredentials(email, password, role);
      if (user) {
        let avatarPath = user.avatarPath;
        if (!avatarPath) {
          const idNum =
            parseInt(user.id.replace(/[^\d]/g, "")) ||
            user.id
              .split("")
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
          if (user.role === "lecturer") {
            const lecturerIndex = (idNum % 4) + 1;
            avatarPath = `/lecturers/lecturer-${lecturerIndex}.jpg`;
          } else {
            const tutorIndex = (idNum % 12) + 1;
            avatarPath = `/avatars/avatar-${tutorIndex}.jpg`;
          }
        }
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            id: user.id,
            avatarPath: avatarPath,
          })
        );
        setSuccess("Sign in successful! Redirecting...");
        setTimeout(() => {
          // TODO: Refactor routing
          // if (user.role === "tutor") router.push("/tutor");
          // else if (user.role === "lecturer") router.push("/lecturer");
          redirect(`/${user.role}`); // Use Next.js redirect
        }, 1000);
      } else {
        setError("Invalid email or password for selected role");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRoleChange = (newRole: "tutor" | "lecturer") => {
    setRole(newRole);
    if (email.includes("@")) {
      const emailName = email.split("@")[0];
      setEmail(`${emailName}@${newRole}.edu.au`); // Simplified, assumes .edu.au suffix
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailInput = e.target.value;
    setEmail(emailInput);
    if (emailInput.includes("@")) {
      const parts = emailInput.split("@");
      if (
        parts.length === 2 &&
        parts[1] !== (role === "tutor" ? "tutor.edu.au" : "lecturer.edu.au")
      ) {
        if (parts[1].length > 0) {
          const suggestedEmail = `${parts[0]}@${role}.edu.au`;
          setEmail(suggestedEmail);
        }
      }
    }
  };

  const getPasswordStrengthClass = () => {
    const feedback = getPasswordStrengthFeedback(
      password,
      passwordStrengthCriteria
    );
    if (feedback.level === "veryWeak") return styles.veryWeak;
    if (feedback.level === "weak") return styles.weak;
    if (feedback.level === "medium") return styles.medium;
    if (feedback.level === "strong") return styles.strong;
    return "";
  };

  const getPasswordStrengthTextClass = () => {
    const feedback = getPasswordStrengthFeedback(
      password,
      passwordStrengthCriteria
    );
    if (feedback.level === "veryWeak") return styles.veryWeakText;
    if (feedback.level === "weak") return styles.weakText;
    if (feedback.level === "medium") return styles.mediumText;
    if (feedback.level === "strong") return styles.strongText;
    return "";
  };

  const getPasswordStrengthText = () => {
    return getPasswordStrengthFeedback(password, passwordStrengthCriteria).text;
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
        )}
        {success && (
          <div className={`${styles.alert} ${styles.alertSuccess}`}>
            {success}
          </div>
        )}

        <h2
          className="text-center text-2xl font-bold mb-6"
          style={{ color: "var(--color-primary)" }}
        >
          Welcome Back
        </h2>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={handleEmailChange}
            required
            className={styles.inputField}
          />
        </div>

        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        </div>

        {password.length > 0 && (
          <>
            <div
              className={`${styles.passwordStrengthMeter} ${getPasswordStrengthClass()}`}
            >
              <div className={styles.segment}></div>
              <div className={styles.segment}></div>
              <div className={styles.segment}></div>
              <div className={styles.segment}></div>
            </div>
            <div
              className={`${styles.passwordStrengthText} ${getPasswordStrengthTextClass()}`}
            >
              {getPasswordStrengthText()}
            </div>
          </>
        )}

        <div className="mb-6">
          <p className="text-sm mb-2 font-medium">Sign in as:</p>
          <div className={styles.roleToggleContainer}>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === "tutor" ? styles.active : ""}`}
              onClick={() => handleRoleChange("tutor")}
            >
              Tutor
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === "lecturer" ? styles.active : ""}`}
              onClick={() => handleRoleChange("lecturer")}
            >
              Lecturer
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Do not have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
