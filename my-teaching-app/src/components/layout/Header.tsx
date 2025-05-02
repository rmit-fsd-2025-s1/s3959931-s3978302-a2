// src/components/layout/Header.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import UserDropdown from "./UserDropdown";

// Define a proper type for user data
interface UserData {
    id: string;
    email: string;
    role: "tutor" | "lecturer";
    fullName: string;
    bio?: string;
    skills?: string[];
    academicCredentials?: string;
}

const Header: React.FC = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    // State to manage animation for theme toggle
    const [isThemeToggleRemoving, setIsThemeToggleRemoving] = useState(false);
    const [isThemeToggleAdding, setIsThemeToggleAdding] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        if (typeof window !== "undefined") {
            const user = localStorage.getItem("currentUser");

            if (user) {
                const userData = JSON.parse(user);
                setIsLoggedIn(true);
                setUserRole(userData.role);
                setUserData(userData);
            } else {
                setIsLoggedIn(false);
                setUserRole(null);
            }

            // Check for dark mode preference
            const darkModePreference =
                localStorage.getItem("darkMode") === "true";
            setIsDarkMode(darkModePreference);
            if (darkModePreference) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }

        // Scroll event listener for sticky header effect
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Function to handle sign out
    const handleSignOut = () => {
        localStorage.removeItem("currentUser");
        setIsLoggedIn(false);
        setUserRole(null);
        router.push("/");
    };

    // Function to toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        // Apply dark mode changes to document
        if (newDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("darkMode", "true");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("darkMode", "false");
        }
    };

    // Animate theme toggle when login state changes
    useEffect(() => {
        if (isLoggedIn) {
            setIsThemeToggleRemoving(true);
            // After removal animation completes, we reset the state
            setTimeout(() => {
                setIsThemeToggleRemoving(false);
            }, 300); // Match this timing with the CSS transition
        } else {
            setIsThemeToggleAdding(true);
            setTimeout(() => {
                setIsThemeToggleAdding(false);
            }, 300);
        }
    }, [isLoggedIn]);

    // Determine which navigation links to show
    const showTutorLink = !isLoggedIn || (isLoggedIn && userRole === "tutor");
    const showLecturerLink =
        !isLoggedIn || (isLoggedIn && userRole === "lecturer");

    // Get avatar number based on user ID (to keep it consistent)
    const getAvatarNumber = () => {
        if (!userData?.id) return 1;

        // Use the first character of user ID to determine avatar (1-6)
        const firstChar = userData.id.charAt(0);
        const charCode = firstChar.charCodeAt(0);
        return (charCode % 6) + 1;
    };

    return (
        <header className={`main-header ${isScrolled ? "scrolled" : ""}`}>
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo with proper alignment */}
                <div className="logo-wrapper">
                    <Link href="/" className="logo-link">
                        <div className="logo-container">
                            <div className="logo-image-container">
                                <Image
                                    src="/letter-e.png"
                                    alt="Logo"
                                    width={36}
                                    height={36}
                                    className="logo-image"
                                />
                            </div>
                            <span className="logo-text">
                                <span className="logo-prefix">du</span>Team
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Center Navigation */}
                <nav className="main-nav">
                    <div className="nav-links">
                        <Link
                            href="/"
                            className={`nav-link ${
                                router.pathname === "/" ? "active" : ""
                            }`}
                        >
                            Home
                        </Link>

                        {showTutorLink && (
                            <Link
                                href="/tutor"
                                className={`nav-link ${
                                    router.pathname.startsWith("/tutor")
                                        ? "active"
                                        : ""
                                }`}
                            >
                                Tutor
                            </Link>
                        )}

                        {showLecturerLink && (
                            <Link
                                href="/lecturer"
                                className={`nav-link ${
                                    router.pathname.startsWith("/lecturer")
                                        ? "active"
                                        : ""
                                }`}
                            >
                                Lecturer
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Right Side Actions */}
                <div className="header-actions">
                    {/* Theme Toggle Button - Only visible when not logged in */}
                    {!isLoggedIn && (
                        <button
                            onClick={toggleDarkMode}
                            className={`theme-toggle-btn header-theme-toggle ${
                                isThemeToggleAdding ? "adding" : ""
                            } ${isThemeToggleRemoving ? "removing" : ""}`}
                            aria-label="Toggle dark mode"
                        >
                            <div className="theme-icon-wrapper">
                                {/* Sun icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="theme-icon sun"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                                {/* Moon icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="theme-icon moon"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            </div>
                        </button>
                    )}

                    {!isLoggedIn ? (
                        <>
                            <Link
                                href="/signin"
                                className="auth-button outline"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="auth-button primary"
                            >
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <UserDropdown
                            user={{
                                fullName: userData?.fullName || "User",
                                email: userData?.email || "",
                                role: userData?.role || "user",
                                avatarNumber: getAvatarNumber(),
                            }}
                            onSignOut={handleSignOut}
                            onToggleDarkMode={toggleDarkMode}
                            isDarkMode={isDarkMode}
                        />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
