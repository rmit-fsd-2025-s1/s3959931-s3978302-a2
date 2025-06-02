import React from "react";
import { useTheme } from "../../../hooks/useTheme"; // Fixed path to useTheme hook
import styles from "./DarkModeToggle.module.css"; // Import the CSS module

// Assuming you have SVG icons or similar for Sun and Moon
const SunIcon = () => (
  <svg
    className={`${styles.toggleIcon} ${styles.sun}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-2.05 6.464a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM4.464 4.54a1 1 0 00-1.414 1.414L3.757 6.66a1 1 0 001.414-1.414L4.464 4.54zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const MoonIcon = () => (
  <svg
    className={`${styles.toggleIcon} ${styles.moon}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
  </svg>
);

const DarkModeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={styles.darkModeToggle} // Base class for the button
      aria-label={isDarkMode ? "Activate light mode" : "Activate dark mode"}
      title={isDarkMode ? "Activate light mode" : "Activate dark mode"}
    >
      <div className={styles.toggleIconContainer}>
        <SunIcon />
        <MoonIcon />
      </div>
      {/* Basic accessible text, can be visually hidden if icons are clear enough */}
      {/* <span className="sr-only">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span> */}
    </button>
  );
};

export default DarkModeToggle;
