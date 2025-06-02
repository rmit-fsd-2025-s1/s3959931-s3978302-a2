"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/shared/hooks/useAuth";
import UserDropdown from "../user-dropdown";
import buttonStyles from "../../common/Button/Button.module.css";
import styles from "./header.module.css";

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userData, isLoggedIn, signOut } = useAuth();

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
    signOut();
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
    if (isLoggedIn) {
      setIsThemeToggleRemoving(true);
      setTimeout(() => setIsThemeToggleRemoving(false), 300);
    } else {
      setIsThemeToggleAdding(true);
      setTimeout(() => setIsThemeToggleAdding(false), 300);
    }
  }, [isLoggedIn]);

  const showTutorLink = !isLoggedIn || userData?.role === "tutor";
  const showLecturerLink = !isLoggedIn || userData?.role === "lecturer";

  return (
    <header
      className={`${styles["main-header"]} ${isScrolled ? styles.scrolled : ""}`}
    >
      <div className={`${styles.container} mx-auto ${styles["header-grid"]}`}>
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

        <div className={styles["header-actions"]}>
          {!isLoggedIn && (
            <button
              onClick={toggleDarkMode}
              className={`${styles["theme-toggle-btn"]} ${
                styles["header-theme-toggle"]
              } ${
                isThemeToggleAdding ? styles.adding : ""
              } ${isThemeToggleRemoving ? styles.removing : ""}`}
              aria-label="Toggle dark mode"
            >
              <div className={styles["theme-icon-wrapper"]}>
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
          {isLoggedIn && userData ? (
            <UserDropdown
              user={{
                ...userData,
                role: userData.role || "user", // Ensure role is not null
              }}
              onSignOut={handleSignOut}
              onToggleDarkMode={toggleDarkMode}
              isDarkMode={isDarkMode}
            />
          ) : (
            <>
              <Link
                href="/signin"
                className={`${buttonStyles.btn} ${buttonStyles.btnOutline}`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`${buttonStyles.btn} ${buttonStyles.btnPrimary}`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
