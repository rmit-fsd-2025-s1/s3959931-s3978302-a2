"use client";

import React, { useState, useEffect } from "react";
import { AuthService } from "../services/authService";
import { User, UserType } from "../types/user";
import { useAuth } from "../../modules/auth/hooks/useAuth";

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

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Error Loading Profile</h2>
          <p>{error || "Profile information could not be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-initials">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {user.firstName} {user.lastName}
            </h1>
            <p className="profile-type">{getUserTypeLabel(user.userType)}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Contact Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Email Address</label>
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="detail-item">
                  <label>Phone Number</label>
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Account Type</label>
                <span className={`user-type-badge ${user.userType}`}>
                  {getUserTypeLabel(user.userType)}
                </span>
              </div>
              <div className="detail-item">
                <label>Date of Joining</label>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className="detail-item">
                <label>Account Status</label>
                <span
                  className={`status-badge ${user.isBlocked ? "blocked" : "active"}`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {user.userType === UserType.CANDIDATE && (
            <div className="detail-section">
              <h3>Candidate Information</h3>
              <p className="info-text">
                As a candidate, you can apply for tutor and lab assistant
                positions for various courses.
              </p>
            </div>
          )}

          {user.userType === UserType.LECTURER && (
            <div className="detail-section">
              <h3>Lecturer Information</h3>
              <p className="info-text">
                As a lecturer, you can view and manage applications for your
                assigned courses.
              </p>
            </div>
          )}

          {user.userType === UserType.ADMIN && (
            <div className="detail-section">
              <h3>Administrator Information</h3>
              <p className="info-text">
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
