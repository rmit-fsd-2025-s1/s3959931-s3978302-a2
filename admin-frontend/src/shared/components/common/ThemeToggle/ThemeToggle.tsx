"use client";

import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import styles from "./ThemeToggle.module.css";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={styles["theme-toggle-btn"]}
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
  );
};

export default ThemeToggle; 