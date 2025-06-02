"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./user-dropdown.module.css";

export interface UserDropdownProps {
  user: {
    fullName: string;
    email: string;
    role: string;
    avatarPath?: string;
    avatarNumber?: number;
  };
  onSignOut: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  onSignOut,
  onToggleDarkMode,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to get avatar path
  const getAvatarPath = () => {
    if (user.avatarPath) {
      return user.avatarPath;
    } else if (user.avatarNumber) {
      return `/avatars/avatar-${user.avatarNumber}.jpg`;
    } else {
      // Generate a consistent avatar number based on email
      const emailHash = user.email
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // Use lecturer images if user is a lecturer
      if (user.role === "lecturer") {
        return `/lecturers/lecturer-${(emailHash % 4) + 1}.jpg`;
      }

      return `/avatars/avatar-${(emailHash % 12) + 1}.jpg`;
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Split name into parts for styling
  const nameParts = user.fullName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <div className={styles.userDropdownContainer} ref={dropdownRef}>
      {/* Avatar Button */}
      <div className={styles.avatarButton} onClick={toggleDropdown}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarContent}>
            <Image
              src={getAvatarPath()}
              alt={user.fullName}
              width={40}
              height={40}
              className={styles.avatarImage}
            />
          </div>
          {isOpen && (
            <>
              <div className={styles.avatarConnector}></div>
              <div className={styles.avatarConnector2}></div>
            </>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.userDropdownMenu}>
          <div className={styles.dropdownHeader}>
            <Image
              src={getAvatarPath()}
              alt={user.fullName}
              width={60}
              height={60}
              className={styles.dropdownAvatar}
            />
            <div className={styles.userInfo}>
              <h3 className={styles.userName}>
                <span className={styles.firstName}>{firstName}</span>
                {lastName && (
                  <span className={styles.lastName}> {lastName}</span>
                )}
              </h3>
              <p className={styles.userEmail}>{user.email}</p>
              <div className={styles.userRole}>{user.role}</div>
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close dropdown"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.closeIcon}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className={styles.dropdownContent}>
            {/* Actions Row - Dark Mode Toggle and Sign Out on same row */}
            <div className={styles.actionsRow}>
              {/* Theme Toggle */}
              <div className={styles.themeToggleContainer}>
                <div className={styles.themeToggleLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${styles.themeIcon} ${styles.lightIcon}`}
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
                    className={`${styles.themeIcon} ${styles.darkIcon}`}
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

                <div
                  className={`${styles.themeToggle} ${isDarkMode ? styles.active : ""}`}
                  onClick={onToggleDarkMode}
                  aria-label="Toggle dark mode"
                >
                  <div className={styles.toggleHandle}></div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button className={styles.signOutButton} onClick={onSignOut}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.actionIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
