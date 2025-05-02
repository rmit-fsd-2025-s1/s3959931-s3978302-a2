import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/layout/Layout";
import Head from "next/head";
import { initializeUserAccounts } from "../utils/userAccounts";
import { initializeDetailedApplications } from "../utils/tutorUtils";

/**
 * Validation Rules for Sign In Form:
 * 
 * 1. Email:
 *    - Required field
 *    - Must be a valid email format
 *    - Must end with correct domain based on role:
 *      - Tutors: @tutor.edu.au
 *      - Lecturers: @lecturer.edu.au
 * 
 * 2. Password:
 *    - Required field
 *    - Minimum 8 characters
 *    - Should contain at least one uppercase letter
 *    - Should contain at least one lowercase letter
 *    - Should contain at least one number
 *    - Should contain at least one special character
 * 
 * 3. Role Selection:
 *    - Either "tutor" or "lecturer" must be selected
 *    - Email domain must match the selected role
 */

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"tutor" | "lecturer">("tutor");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Password strength variables
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });

    // Initialize user accounts and applications in localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            initializeUserAccounts();
            initializeDetailedApplications();
        }
    }, []);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        return password.length >= 8;
    };

    // Check password strength as user types
    useEffect(() => {
        setPasswordStrength({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        });
    }, [password]);

    // Fixed getUserByCredentials function
    const getUserByCredentials = (email: string, password: string, role: string) => {
        if (typeof window !== "undefined") {
            interface UserType {
                id: string;
                email: string;
                password: string;
                role: string;
                fullName: string;
            }

            const users = JSON.parse(localStorage.getItem("users") || "[]") as UserType[];
            console.log("All users:", users); // Debug log

            // First find by email and password
            const user = users.find((u: UserType) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            console.log("Found user:", user); // Debug log

            // Then check role
            if (user && user.role === role) {
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

        // Basic validation
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        if (!validatePassword(password)) {
            setError("Password must be at least 8 characters long");
            setIsLoading(false);
            return;
        }

        // Simulate api call with setTimeout
        setTimeout(() => {
            // Find user with matching credentials
            const user = getUserByCredentials(email, password, role);

            if (user) {
                // Store the current user in localStorage
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify({
                        email: user.email,
                        role: user.role,
                        fullName: user.fullName,
                        id: user.id,
                    })
                );

                setSuccess("Sign in successful! Redirecting...");

                // Redirect based on role
                setTimeout(() => {
                    if (user.role === "tutor") {
                        router.push("/tutor");
                    } else if (user.role === "lecturer") {
                        router.push("/lecturer");
                    }
                }, 1000);
            } else {
                setError("Invalid email or password for selected role");
                console.log("Login failed for:", email, role); // Debug log
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleRoleChange = (newRole: "tutor" | "lecturer") => {
        setRole(newRole);

        // Set email domain based on role
        if (email.includes("@")) {
            const emailName = email.split("@")[0];
            if (newRole === "tutor") {
                setEmail(`${emailName}@tutor.edu.au`);
            } else {
                setEmail(`${emailName}@lecturer.edu.au`);
            }
        }
    };

    // Helper function to suggest proper email format
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const emailInput = e.target.value;
        setEmail(emailInput);

        // If there's an @, check and suggest the proper domain
        if (emailInput.includes("@")) {
            const parts = emailInput.split("@");
            if (parts.length === 2 && parts[1] !== (role === "tutor" ? "tutor.edu.au" : "lecturer.edu.au")) {
                if (parts[1].length > 0) {
                    // Only suggest if user has typed something after @
                    const suggestedEmail = `${parts[0]}@${role === "tutor" ? "tutor.edu.au" : "lecturer.edu.au"}`;
                    // Update with correct domain format
                    setEmail(suggestedEmail);
                }
            }
        }
    };

    return (
        <>
            <Head>
                <title>TeachTeam - Sign In</title>
            </Head>
            <Layout>
                <div className="flex items-center justify-center py-16">
                    <div className="circle-form">
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <h2 className="text-center text-2xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
                                Welcome Back
                            </h2>

                            <div className="mb-4">
                                <input type="email" placeholder="Email Address" value={email} onChange={handleEmailChange} required />
                            </div>

                            <div className="mb-4 relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

                            {/* Password strength meter (shown when password field has content) */}
                            {password.length > 0 && (
                                <>
                                    <div
                                        className={`password-strength-meter ${
                                            password.length < 4
                                                ? "password-strength-very-weak"
                                                : password.length < 6
                                                ? "password-strength-weak"
                                                : passwordStrength.length &&
                                                  passwordStrength.uppercase &&
                                                  passwordStrength.lowercase &&
                                                  passwordStrength.number &&
                                                  passwordStrength.special
                                                ? "password-strength-strong"
                                                : passwordStrength.length &&
                                                  (passwordStrength.uppercase || passwordStrength.lowercase) &&
                                                  (passwordStrength.number || passwordStrength.special)
                                                ? "password-strength-medium"
                                                : "password-strength-weak"
                                        }`}>
                                        <div className="segment"></div>
                                        <div className="segment"></div>
                                        <div className="segment"></div>
                                        <div className="segment"></div>
                                    </div>
                                    <div
                                        className={`password-strength-text ${
                                            password.length < 4
                                                ? "password-strength-very-weak"
                                                : password.length < 6
                                                ? "password-strength-weak"
                                                : passwordStrength.length &&
                                                  passwordStrength.uppercase &&
                                                  passwordStrength.lowercase &&
                                                  passwordStrength.number &&
                                                  passwordStrength.special
                                                ? "password-strength-strong"
                                                : passwordStrength.length &&
                                                  (passwordStrength.uppercase || passwordStrength.lowercase) &&
                                                  (passwordStrength.number || passwordStrength.special)
                                                ? "password-strength-medium"
                                                : "password-strength-weak"
                                        }`}>
                                        {password.length < 4
                                            ? "Very weak password"
                                            : password.length < 6
                                            ? "Please use 6+ characters"
                                            : passwordStrength.length &&
                                              passwordStrength.uppercase &&
                                              passwordStrength.lowercase &&
                                              passwordStrength.number &&
                                              passwordStrength.special
                                            ? "Strong password"
                                            : passwordStrength.length &&
                                              (passwordStrength.uppercase || passwordStrength.lowercase) &&
                                              (passwordStrength.number || passwordStrength.special)
                                            ? "Good password"
                                            : "Weak password"}
                                    </div>
                                </>
                            )}

                            <div className="mb-6">
                                <p className="text-sm mb-2 font-medium">Sign in as:</p>
                                <div className="role-toggle-container">
                                    <button
                                        type="button"
                                        className={`role-btn ${role === "tutor" ? "active" : ""}`}
                                        onClick={() => handleRoleChange("tutor")}>
                                        Tutor
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-btn ${role === "lecturer" ? "active" : ""}`}
                                        onClick={() => handleRoleChange("lecturer")}>
                                        Lecturer
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="sign-in-button" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Do not have an account?{" "}
                                    <Link href="/signup" className="text-primary font-medium hover:underline">
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </>
    );
}
