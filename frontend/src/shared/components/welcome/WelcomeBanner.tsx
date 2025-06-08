"use client";

import React, { useState, useEffect, useCallback, CSSProperties } from "react";
import { User } from "../../types/user";
import Fireworks from "../fireworks/Fireworks";
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
  const [showFireworks, setShowFireworks] = useState(true);

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

  const handleFireworksComplete = useCallback(() => {
    setShowFireworks(false);
  }, []);

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

  const getRoleIcon = () => {
    switch (user.userType) {
      case "candidate":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case "lecturer":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "admin":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
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
    <>
      <div 
        className={`${styles.welcomeBanner} ${isHiding ? styles.hiding : ""} ${styles.enhanced}`}
        style={bannerStyle}
        data-scrolled={isScrolled ? "true" : "false"} // For debugging
      >
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeContent}>
            <div className={styles.celebrationSection}>
              <div className={styles.celebrationIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className={styles.roleIcon}>
                {getRoleIcon()}
              </div>
            </div>
            <div className={styles.messageSection}>
              <h1 className={styles.welcomeMessage}>{getWelcomeMessage()}</h1>
              <p className={styles.welcomeSubtitle}>
                Successfully logged in as {getUserTypeLabel()}
              </p>
            </div>
            <button
              className={styles.closeButton}
              onClick={hideWithAnimation}
              aria-label="Close welcome banner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar showing auto-hide countdown */}
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{
                animationDuration: `${autoHideDelay}ms`
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Fireworks animation */}
      <Fireworks 
        isVisible={showFireworks} 
        onComplete={handleFireworksComplete}
        duration={3000}
      />
    </>
  );
};
