"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import UserDropdown from "../user-dropdown";
import styles from "./header.module.css";

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeToggleRemoving, setIsThemeToggleRemoving] = useState(false);
  const [isThemeToggleAdding, setIsThemeToggleAdding] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const darkModePreference = localStorage.getItem("darkMode") === "true";
      setIsDarkMode(darkModePreference);
      if (darkModePreference) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsThemeToggleRemoving(true);
      setTimeout(() => setIsThemeToggleRemoving(false), 300);
    } else {
      setIsThemeToggleAdding(true);
      setTimeout(() => setIsThemeToggleAdding(false), 300);
    }
  }, [isAuthenticated]);

  // Convert user type to role for compatibility
  const getUserRole = () => {
    if (!user) return "user";
    switch (user.userType) {
      case "candidate":
        return "tutor";
      case "lecturer":
        return "lecturer";
      case "admin":
        return "admin";
      default:
        return "user";
    }
  };

  const showTutorLink = !isAuthenticated || user?.userType === "candidate";
  const showLecturerLink = !isAuthenticated || user?.userType === "lecturer";

  return (
    <header
      className={`${styles["main-header"]} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div className={styles["header-grid"]}>
        <div className={styles["logo-wrapper"]}>
          <Link href="/" className={styles["logo-link"]}>
            <div className={styles["logo-container"]}>
              <div className={styles["logo-image-container"]}>
                <Image
                  src="/letter-e.png"
                  alt="duTeam Logo"
                  width={45}
                  height={45}
                  className={styles["logo-image"]}
                />
              </div>
              <span className={styles["logo-text"]}>
                <span className={styles["logo-prefix"]}>du</span>Team
              </span>
            </div>
          </Link>
        </div>

        <nav className={styles["main-nav"]}>
          <div className={styles["nav-links"]}>
            <Link
              href="/"
              className={`${styles["nav-link"]} ${pathname === "/" ? styles.active : ""}`}
            >
              Home
            </Link>
            {showTutorLink && (
              <Link
                href="/tutor"
                className={`${styles["nav-link"]} ${pathname === "/tutor" ? styles.active : ""}`}
              >
                Tutors
              </Link>
            )}
            {showLecturerLink && (
              <Link
                href="/lecturer"
                className={`${styles["nav-link"]} ${pathname === "/lecturer" ? styles.active : ""}`}
              >
                Lecturers
              </Link>
            )}
          </div>
        </nav>

        <div className={styles["header-actions"]}>
          {!isAuthenticated && (
            <button
              onClick={toggleDarkMode}
              className={`${styles["theme-toggle-btn"]} ${
                isThemeToggleRemoving
                  ? styles.removing
                  : isThemeToggleAdding
                    ? styles.adding
                    : ""
              }`}
              aria-label="Toggle dark mode"
            >
              <div className={styles["theme-icon-wrapper"]}>
                <span className={`${styles["theme-icon"]} ${styles.sun}`}>
                  ☀️
                </span>
                <span className={`${styles["theme-icon"]} ${styles.moon}`}>
                  🌙
                </span>
              </div>
            </button>
          )}
          {isAuthenticated && user ? (
            <UserDropdown
              user={{
                fullName: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: getUserRole(),
              }}
              onSignOut={handleSignOut}
              onToggleDarkMode={toggleDarkMode}
              isDarkMode={isDarkMode}
            />
          ) : (
            <div className={styles.authButtons}>
              <Link
                href="/signin"
                className={`${styles.authButton} ${styles.authButtonSecondary}`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`${styles.authButton} ${styles.authButtonPrimary}`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
