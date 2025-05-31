import React from "react";
import type { CourseDetails } from "@/shared/types/course";
import { availableSkills } from "@/modules/tutor/utils/applicationDisplay.utils";
import { motion } from "framer-motion";
import styles from "@/modules/tutor/styles/tutor-dashboard-layout.module.css";

interface CourseCardProps {
  course: CourseDetails;
  openApplyModal: (course: CourseDetails) => void;
  hasApplied?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  openApplyModal,
  hasApplied = false,
}) => {
  // Status indicators based on availability and whether user has applied
  const getStatusInfo = () => {
    if (hasApplied) {
      return {
        label: "Applied",
        bgClass: styles.bgGreen100,
        textClass: styles.textGreen800,
      };
    }

    return {
      label: course.availability,
      bgClass:
        course.availability === "Full Time"
          ? styles.bgBlue100
          : styles.bgPurple100,
      textClass:
        course.availability === "Full Time"
          ? styles.textBlue800
          : styles.textPurple800,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={styles.enhancedCourseCard}>
      {/* Card top section with code and status */}
      <div className={styles.cardTop}>
        <span className={styles.courseCode}>{course.code}</span>
        <span
          className={`${styles.courseStatus} ${statusInfo.bgClass} ${statusInfo.textClass}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Card body */}
      <div className={styles.cardBody}>
        <h3 className={styles.courseTitle}>{course.name}</h3>

        {/* Skills tags */}
        <div className={styles.skillsContainer}>
          {course.skills?.map((skill, index) => (
            <span key={index} className={styles.skillTag}>
              {skill}
            </span>
          ))}
          {!course.skills &&
            availableSkills.slice(0, 2).map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
              </span>
            ))}
        </div>

        {/* Role tag */}
        <div className={styles.roleTag}>
          <div
            className={`${styles.roleIcon} ${
              course.role === "Tutor"
                ? styles.roleIconTutor
                : styles.roleIconAssistant
            }`}
          >
            {course.role === "Tutor" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <span className={styles.roleName}>{course.role}</span>
        </div>
      </div>

      {/* Card footer */}
      <div className={styles.cardFooter}>
        {!hasApplied ? (
          <motion.button
            className={styles.applyButton}
            onClick={() => openApplyModal(course)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply Now
          </motion.button>
        ) : (
          <div className={styles.appliedStatus}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Application Submitted</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
