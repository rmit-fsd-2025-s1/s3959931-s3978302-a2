"use client";
// filepath: c:\s3978302\Full Stack Development\s3959931-s3978302-a2\my-teaching-app\src\modules\core\components\layout\Header.tsx
// src\components\layout\Header.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import UserDropdown from "../user-dropdown/user-dropdown";
import styles from "./Header.module.css";

// Define a proper type for user data
interface UserData {
  id: string;
  email: string;
  role: "tutor" | "lecturer";
  fullName: string;
  bio?: string;
  skills?: string[];
  academicCredentials?: string;
  avatarPath?: string; // Added avatarPath property
}

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
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
        const userDataParsed = JSON.parse(user);
        setIsLoggedIn(true);
        setUserRole(userDataParsed.role);
        setUserData(userDataParsed);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }

      // Check for dark mode preference
      const darkModePreference = localStorage.getItem("darkMode") === "true";
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

  return (
    <header
      className={`${styles["main-header"]} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div className={`${styles.container} mx-auto ${styles["header-grid"]}`}>
        {/* Logo with proper alignment */}
        <div className={styles["logo-wrapper"]}>
          <Link href="/" className={styles["logo-link"]}>
            <div className={styles["logo-container"]}>
              <div>
                <Image
                  src="/letter-e.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className={styles["logo-image"]}
                />
              </div>
              <span className={styles["logo-text"]}>
                <span className={styles["logo-prefix"]}>du</span>Team
              </span>
            </div>
          </Link>
        </div>

        {/* Center Navigation */}
        <nav className={styles["main-nav"]}>
          <div className={styles["nav-links"]}>
            <Link
              href="/"
              className={`${styles["nav-link"]} ${
                pathname === "/" ? styles.active : ""
              }`}
            >
              Home
            </Link>

            {showTutorLink && (
              <Link
                href="/tutor"
                className={`${styles["nav-link"]} ${
                  pathname.startsWith("/tutor") ? styles.active : ""
                }`}
              >
                Tutor
              </Link>
            )}

            {showLecturerLink && (
              <Link
                href="/lecturer"
                className={`${styles["nav-link"]} ${
                  pathname.startsWith("/lecturer") ? styles.active : ""
                }`}
              >
                Lecturer
              </Link>
            )}
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className={styles["header-actions"]}>
          {/* Theme Toggle Button - Only visible when not logged in */}
          {!isLoggedIn && (
            <button
              onClick={toggleDarkMode}
              className={`${styles["theme-toggle-btn"]} ${styles["header-theme-toggle"]} ${
                isThemeToggleAdding ? styles.adding : ""
              } ${isThemeToggleRemoving ? styles.removing : ""}`}
              aria-label="Toggle dark mode"
            >
              <div className={styles["theme-icon-wrapper"]}>
                {/* Sun icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${styles["theme-icon"]} ${styles.sun}`}
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
                  className={`${styles["theme-icon"]} ${styles.moon}`}
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
                className={`${styles["auth-button"]} ${styles.outline}`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`${styles["auth-button"]} ${styles.primary}`}
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
                avatarPath: userData?.avatarPath,
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
