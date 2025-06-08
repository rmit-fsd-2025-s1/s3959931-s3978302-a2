import React from "react";
import { motion } from "framer-motion";
import styles from "./DashboardHeader.module.css";

interface Statistics {
  totalApplications: number;
  selectedTutorApplications: number;
  pendingTutorApplications: number;
  selectionRate: number;
}

interface DashboardHeaderProps {
  lecturerName: string;
  statistics: Statistics;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lecturerName,
  statistics,
}) => {
  return (
    <motion.div
      className={styles.dashboardHeader}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.dashboardTitle}>Lecturer Dashboard</h1>
          <p className={styles.dashboardSubtitle}>
            Welcome back, {lecturerName}
          </p>
        </div>

      </div>
      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.totalIcon}`}>
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Applications</span>
            <span className={styles.statValue}>
              {statistics.totalApplications}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.selectedIcon}`}>
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
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Selected</span>
            <span className={styles.statValue}>
              {statistics.selectedTutorApplications}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.pendingIcon}`}>
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
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Pending</span>
            <span className={styles.statValue}>
              {statistics.pendingTutorApplications}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.rateIcon}`}>
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
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Selection Rate</span>
            <span
              className={styles.statValue}
            >{`${statistics.selectionRate}%`}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
