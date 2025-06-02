import React from "react";
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import { motion } from "framer-motion";
import styles from "./visual-stats-summary.module.css";

interface VisualStatsSummaryProps {
  applications: TutorApplication[];
}

const VisualStatsSummary: React.FC<VisualStatsSummaryProps> = ({
  applications,
}) => {
  const totalApplications = applications.length;
  const selectedApplications = applications.filter(
    (app) => app.selected
  ).length;
  const pendingApplications = totalApplications - selectedApplications;
  const selectionRate =
    totalApplications > 0
      ? Math.round((selectedApplications / totalApplications) * 100)
      : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={styles.summaryContainer}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className={styles.summaryCard}
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
      >
        <div className={`${styles.summaryIcon} ${styles.totalIcon}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div className={styles.summaryContent}>
          <span className={styles.summaryLabel}>Total Applications</span>
          <span className={styles.summaryValue}>{totalApplications}</span>
          <span className={styles.summaryDesc}>All submitted applications</span>
        </div>
      </motion.div>

      <motion.div
        className={styles.summaryCard}
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
      >
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressPercentage}>{selectionRate}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${selectionRate}%` }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.statCardsGrid} variants={itemVariants}>
        <motion.div className={styles.statCard} whileHover={{ scale: 1.02 }}>
          <div className={`${styles.summaryIcon} ${styles.selectedIcon}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className={styles.statDetails}>
            <div className={styles.statValue}>{selectedApplications}</div>
            <div className={styles.statLabel}>Selected</div>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ scale: 1.02 }}>
          <div className={`${styles.summaryIcon} ${styles.pendingIcon}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className={styles.statDetails}>
            <div className={styles.statValue}>{pendingApplications}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default VisualStatsSummary;
