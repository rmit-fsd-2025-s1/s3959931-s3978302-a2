"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AuthService } from "../../../../shared/services/authService";
import { User, UserType } from "../../../../shared/types/user";
import { useAuth } from "../../../auth/hooks/useAuth";
import styles from "./ProfilePage.module.css";

export const ProfilePage: React.FC = () => {
  const { user: contextUser, updateUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      // First, try to get user from context or local storage
      const savedUser = contextUser || AuthService.getUser();

      if (savedUser) {
        setUser(savedUser);
        setIsLoading(false);

        // Optionally try to fetch fresh data in the background
        try {
          const response = await AuthService.getProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
            updateUser(response.data.user);
          }
          // If API call fails, we still have the cached user data, so don't show error
        } catch (apiError) {
          console.warn(
            "Failed to fetch fresh profile data, using cached data:",
            apiError
          );
          // Don't set error state, just use cached data
        }
      } else {
        setError("Please log in to view your profile.");
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [authLoading, contextUser, updateUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserTypeLabel = (userType: UserType) => {
    switch (userType) {
      case UserType.CANDIDATE:
        return "Candidate";
      case UserType.LECTURER:
        return "Lecturer";
      case UserType.ADMIN:
        return "Admin";
      default:
        return "User";
    }
  };

  // Function to get avatar path - same logic as user dropdown
  const getAvatarPath = (userData: User) => {
    // Generate a consistent avatar number based on email
    const emailHash = userData.email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Use lecturer images if user is a lecturer
    if (userData.userType === UserType.LECTURER) {
      return `/lecturers/lecturer-${(emailHash % 4) + 1}.jpg`;
    }

    return `/avatars/avatar-${(emailHash % 12) + 1}.jpg`;
  };

  if (isLoading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileError}>
          <h2>Error Loading Profile</h2>
          <p>{error || "Profile information could not be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            <Image
              src={getAvatarPath(user)}
              alt={`${user.firstName} ${user.lastName} avatar`}
              width={80}
              height={80}
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>
              {user.firstName} {user.lastName}
            </h1>
            <p className={styles.profileType}>
              {getUserTypeLabel(user.userType)}
            </p>
          </div>
        </div>

        <div className={styles.profileDetails}>
          <div className={styles.detailSection}>
            <h3>Contact Information</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>Email Address</label>
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className={styles.detailItem}>
                  <label>Phone Number</label>
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Account Information</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>Account Type</label>
                <span
                  className={`${styles.userTypeBadge} ${styles[user.userType]}`}
                >
                  {getUserTypeLabel(user.userType)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <label>Date of Joining</label>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className={styles.detailItem}>
                <label>Account Status</label>
                <span
                  className={`${styles.statusBadge} ${user.isBlocked ? styles.blocked : styles.active}`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {user.userType === UserType.CANDIDATE && (
            <div className={styles.detailSection}>
              <h3>Candidate Information</h3>
              <p className={styles.infoText}>
                As a candidate, you can apply for tutor and lab assistant
                positions for various courses.
              </p>
            </div>
          )}

          {user.userType === UserType.LECTURER && (
            <div className={styles.detailSection}>
              <h3>Lecturer Information</h3>
              <p className={styles.infoText}>
                As a lecturer, you can view and manage applications for your
                assigned courses.
              </p>
            </div>
          )}

          {user.userType === UserType.ADMIN && (
            <div className={styles.detailSection}>
              <h3>Administrator Information</h3>
              <p className={styles.infoText}>
                As an administrator, you have full access to manage the system,
                courses, and users.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
