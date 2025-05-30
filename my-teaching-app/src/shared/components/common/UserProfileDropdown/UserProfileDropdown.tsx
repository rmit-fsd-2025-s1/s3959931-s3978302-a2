import React, { useState, useEffect, useRef } from "react";
import styles from "./UserProfileDropdown.module.css";
import Link from "next/link";
// import { useAuth } from '@/shared/contexts/AuthContext'; // Assuming an AuthContext

// Placeholder for user data - replace with actual data from context or props
interface User {
  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

// Placeholder for useAuth hook data - replace with actual hook
const useAuth = () => ({
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "/avatars/avatar-1.jpg",
    role: "student",
  } as User,
  logout: async () => {
    console.log("Logout action triggered");
  },
});

const UserProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth(); // Replace with actual auth context/hook
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    // router.push('/'); // Or wherever you redirect after logout
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null; // Or some other placeholder if user is not logged in

  return (
    <div className={styles.userProfileContainer} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={styles.userAvatarBtn}
        aria-label="Open user menu"
      >
        <img
          src={user.avatarUrl || "/avatars/default-avatar.png"}
          alt={user.name || "User Avatar"}
          className={styles.userAvatarImage}
        />
      </button>

      {isOpen && (
        <div className={styles.userDropdown}>
          <div className={styles.userDropdownHeader}>
            <img
              src={user.avatarUrl || "/avatars/default-avatar.png"}
              alt="User Avatar"
              className={styles.dropdownAvatarImage}
            />
            <div className={styles.dropdownUserInfo}>
              <span className={styles.dropdownUserName}>
                {user.name || "User Name"}
              </span>
              <span className={styles.dropdownUserEmail}>
                {user.email || "user@example.com"}
              </span>
            </div>
          </div>
          <div className={styles.userDropdownContent}>
            <Link
              href="/profile"
              className={styles.userDropdownItem}
              onClick={() => setIsOpen(false)}
            >
              {/* Placeholder Icon - replace with actual SVG or icon component */}
              <span>👤</span> Profile
            </Link>
            <Link
              href="/settings"
              className={styles.userDropdownItem}
              onClick={() => setIsOpen(false)}
            >
              {/* Placeholder Icon */}
              <span>⚙️</span> Settings
            </Link>
            {user.role === "tutor" && (
              <Link
                href="/tutor/dashboard"
                className={styles.userDropdownItem}
                onClick={() => setIsOpen(false)}
              >
                {/* Placeholder Icon */}
                <span>📚</span> Tutor Dashboard
              </Link>
            )}
            {user.role === "lecturer" && (
              <Link
                href="/lecturer/dashboard"
                className={styles.userDropdownItem}
                onClick={() => setIsOpen(false)}
              >
                {/* Placeholder Icon */}
                <span>‍🏫</span> Lecturer Dashboard
              </Link>
            )}
          </div>
          <div className={styles.userDropdownFooter}>
            <button
              onClick={handleLogout}
              className={`${styles.userDropdownItem} ${styles.logoutButton}`}
            >
              {/* Placeholder Icon */}
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
