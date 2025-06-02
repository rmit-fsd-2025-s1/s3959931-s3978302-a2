"use client";

import React from "react";
import { User } from "../types/user";

interface WelcomeBannerProps {
  user: User;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ user }) => {
  const getWelcomeMessage = () => {
    const firstName = user.firstName || "User";
    return `Welcome back, ${firstName}!`;
  };

  const getUserTypeDisplay = () => {
    switch (user.userType) {
      case "candidate":
        return "Candidate Dashboard";
      case "lecturer":
        return "Lecturer Dashboard";
      case "admin":
        return "Admin Dashboard";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="welcome-banner">
      <div className="welcome-content">
        <h1 className="welcome-message">{getWelcomeMessage()}</h1>
        <p className="welcome-subtitle">
          You are logged in as a {user.userType} • {getUserTypeDisplay()}
        </p>
      </div>
    </div>
  );
};
