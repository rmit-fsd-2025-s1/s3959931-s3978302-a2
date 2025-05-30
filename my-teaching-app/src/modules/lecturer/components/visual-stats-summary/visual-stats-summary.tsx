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
  const selectedCount = applications.filter((app) => app.selected).length;
  const notSelectedCount = applications.length - selectedCount;
  const selectedPercentage =
    applications.length > 0
      ? Math.round((selectedCount / applications.length) * 100)
      : 0;

  const applicantSelectionCounts: Record<string, number> = {};
  applications.forEach((app) => {
    if (app.selected) {
      applicantSelectionCounts[app.fullName] =
        (applicantSelectionCounts[app.fullName] || 0) + 1;
    }
  });

  let mostSelectedName = "";
  let mostSelectedCount = 0;
  let leastSelectedName = "";
  let leastSelectedCount = Infinity;

  Object.entries(applicantSelectionCounts).forEach(([name, count]) => {
    if (count > mostSelectedCount) {
      mostSelectedName = name;
      mostSelectedCount = count;
    }
    if (count < leastSelectedCount) {
      leastSelectedName = name;
      leastSelectedCount = count;
    }
  });

  if (mostSelectedCount === 0) {
    mostSelectedName = "None";
    leastSelectedName = "None";
    leastSelectedCount = 0;
  }

  const courseDistribution: Record<string, number> = {};
  applications.forEach((app) => {
    app.courses.forEach((course) => {
      courseDistribution[course] = (courseDistribution[course] || 0) + 1;
    });
  });

  let popularCourse = "";
  let popularCourseCount = 0;
  Object.entries(courseDistribution).forEach(([course, count]) => {
    if (count > popularCourseCount) {
      popularCourse = course;
      popularCourseCount = count;
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (applications.length === 0) {
    return (
      <div className={styles.emptySummary}>
        <div className={styles.emptySummaryIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className={styles.emptySummaryTitle}>No Application Data</h3>
        <p className={styles.emptySummaryText}>
          Statistics will be displayed when applications are submitted.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.visualStatsSummary}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.h3 className={styles.summaryTitle} variants={itemVariants}>
        Application Selection Summary
      </motion.h3>
      <motion.div className={styles.progressSection} variants={itemVariants}>
        <div className="flex justify-between text-sm mb-1">
          <span>Selection Progress</span>
          <span>{selectedPercentage}%</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${selectedPercentage}%` }}
          ></div>
        </div>
        <div className={styles.progressDetails}>
          <span>Selected: {selectedCount}</span>
          <span>Remaining: {notSelectedCount}</span>
        </div>
      </motion.div>
      <motion.div className={styles.statCardsGrid} variants={itemVariants}>
        <div className={`${styles.statCard} ${styles.mostSelected}`}>
          <h4 className={styles.statCardTitle}>Most Selected</h4>
          <div className={styles.statCardContent}>
            <div className={styles.statApplicantAvatar}>
              {mostSelectedName !== "None"
                ? mostSelectedName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "N/A"}
            </div>
            <div className={styles.statDetails}>
              <p className={styles.statName}>
                {mostSelectedName !== "None"
                  ? mostSelectedName.split(" ")[0]
                  : "None"}
              </p>
              <p className={styles.statCount}>
                {mostSelectedCount} selection
                {mostSelectedCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.leastSelected}`}>
          <h4 className={styles.statCardTitle}>Least Selected</h4>
          <div className={styles.statCardContent}>
            <div className={`${styles.statApplicantAvatar} ${styles.blue}`}>
              {leastSelectedName !== "None"
                ? leastSelectedName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "N/A"}
            </div>
            <div className={styles.statDetails}>
              <p className={styles.statName}>
                {leastSelectedName !== "None"
                  ? leastSelectedName.split(" ")[0]
                  : "None"}
              </p>
              <p className={styles.statCount}>
                {leastSelectedCount} selection
                {leastSelectedCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className={styles.notSelectedContainer}
        variants={itemVariants}
      >
        <h4 className={styles.notSelectedTitle}>Not Selected Applicants</h4>
        <div className={styles.notSelectedVisual}>
          <div className={styles.notSelectedBar}>
            <div
              className={styles.notSelectedProgress}
              style={{
                width: `${applications.length ? (notSelectedCount / applications.length) * 100 : 0}%`,
              }}
            ></div>
          </div>
          <span className={styles.notSelectedCount}>{notSelectedCount}</span>
        </div>
        <p className={styles.notSelectedText}>
          {notSelectedCount} out of {applications.length} applicants pending
          selection
        </p>
      </motion.div>
      {popularCourse && (
        <motion.div
          className={styles.popularCourseContainer}
          variants={itemVariants}
        >
          <h4 className={styles.popularCourseTitle}>Popular Course</h4>
          <div className={styles.popularCourseContent}>
            <div className={styles.courseIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className={styles.courseDetails}>
              <p className={styles.courseCode}>{popularCourse}</p>
              <p className={styles.courseApplications}>
                {popularCourseCount} applications
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VisualStatsSummary;
