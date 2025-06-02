"use client";

import React, { useState, useEffect, useCallback, CSSProperties } from "react";
import { User } from "../types/user";
import styles from "./WelcomeBanner.module.css";

interface WelcomeBannerProps {
  user: User;
  autoHideDelay?: number; // Auto-hide delay in milliseconds, defaults to 5000ms
  onHide?: () => void; // Callback when banner is hidden
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  user,
  autoHideDelay = 5000,
  onHide,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHiding, setIsHiding] = useState(false);
  const [topPosition, setTopPosition] = useState('80px'); // Start with expanded header height
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle responsive positioning and scroll position
  useEffect(() => {
    const updatePosition = () => {
      const scrolled = window.scrollY > 10; // Consider scrolled after 10px
      setIsScrolled(scrolled);
      
      // Base values for when header is scrolled (contracted)
      let topValue = scrolled ? '64px' : '80px'; // Desktop
      
      if (window.innerWidth <= 480) {
        topValue = scrolled ? '52px' : '64px'; // Mobile
      } else if (window.innerWidth <= 768) {
        topValue = scrolled ? '56px' : '70px'; // Tablet
      }
      
      setTopPosition(topValue);
    };
    
    // Initial position
    updatePosition();
    
    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  const hideWithAnimation = useCallback(() => {
    setIsHiding(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onHide) {
        onHide();
      }
    }, 300);
  }, [onHide]);

  useEffect(() => {
    const timerId = setTimeout(hideWithAnimation, autoHideDelay);
    return () => {
      clearTimeout(timerId);
    };
  }, [autoHideDelay, hideWithAnimation]);

  const getWelcomeMessage = () => {
    const firstName = user.firstName || "User";
    return `Welcome, ${firstName}!`;
  };

  const getUserTypeLabel = () => {
    switch (user.userType) {
      case "candidate":
        return "Candidate";
      case "lecturer":
        return "Lecturer";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  if (!isVisible) {
    return null;
  }

  // Use inline styles as a fallback to ensure correct positioning
  const bannerStyle: CSSProperties = {
    position: 'fixed',
    top: topPosition,
    zIndex: 30,
    width: '100%',
    left: 0,
    right: 0,
    transition: 'top 0.3s ease', // Smooth transition when header size changes
  };

  return (
    <div 
      className={`${styles.welcomeBanner} ${isHiding ? styles.hiding : ""}`}
      style={bannerStyle}
      data-scrolled={isScrolled ? "true" : "false"} // For debugging
    >
      <div className={styles.welcomeContent}>
        <h1 className={styles.welcomeMessage}>{getWelcomeMessage()}</h1>
        <p className={styles.welcomeSubtitle}>
          You are logged in as a {getUserTypeLabel()}
        </p>
        <button
          className={styles.closeButton}
          onClick={hideWithAnimation}
          aria-label="Close welcome banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
