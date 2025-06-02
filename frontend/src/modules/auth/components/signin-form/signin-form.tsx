"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "../../../../shared/services/authService";
import {
  validateEmail,
  validateMinPasswordLength,
} from "../../utils/authValidation.utils";
import { SigninData } from "../../../../shared/types/user";
import { useAuth } from "../../hooks/useAuth";
import styles from "./signin-form.module.css";

export default function SignInForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<SigninData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof SigninData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Clear API error
    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError("");

    // Frontend validation
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validateMinPasswordLength(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔄 Attempting signin with:", { email: formData.email });
      const response = await AuthService.signin(formData);
      console.log("📥 Signin response:", {
        success: response.success,
        hasData: !!response.data,
      });

      if (response.success && response.data) {
        console.log(
          "✅ Signin successful, logging in user:",
          response.data.user.email
        );
        // Use auth context to login
        login(response.data.user, response.data.token);
        console.log("🏠 Redirecting to home page...");

        // Redirect to home page where welcome banner will be displayed
        router.push("/");
      } else {
        console.log("❌ Signin failed:", response.message);
        // Handle validation errors from backend
        if (response.errors) {
          setErrors(response.errors);
        } else {
          setApiError(response.message);
        }
      }
    } catch (error) {
      console.error("💥 Signin error:", error);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Welcome Back</h2>

        {apiError && (
          <div className={`${styles.alert} ${styles.alertError}`}>
            {apiError}
          </div>
        )}

        <div className={styles.inputContainer}>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`${styles.inputField} ${errors.email ? styles.inputError : ""}`}
            placeholder="Email Address"
            required
          />
          {errors.email && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {errors.email}
            </div>
          )}
        </div>

        <div className={styles.passwordContainer}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`${styles.inputField} ${errors.password ? styles.inputError : ""}`}
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.icon}
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
                className={styles.icon}
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
          {errors.password && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {errors.password}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`${styles.submitButton} ${isLoading ? styles.loading : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>

        <div className={styles.linkSection}>
          <p className={styles.linkText}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className={styles.link}>
              Create one here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
