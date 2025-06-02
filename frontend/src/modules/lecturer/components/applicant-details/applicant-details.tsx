import React from "react";
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import { availableCourses } from "@/shared/data/courses";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./applicant-details.module.css";

interface ApplicantDetailsProps {
  application: TutorApplication | null;
  comment: string;
  setComment: (comment: string) => void;
  onSelectApplicant: (selectedCourses: string[]) => void;
  onSaveComment: (selectedCourses: string[]) => void;
  onDeleteComment: () => void;
  onUnselectApplicant: () => void;
  onAddToRanking: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  title?: string;
}

const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
  application,
  comment,
  setComment,
  onSelectApplicant,
  onSaveComment,
  onDeleteComment,
  onUnselectApplicant,
  onAddToRanking,
  showToast,
  title = "Applicant Details",
}) => {
  if (!application) {
    return (
      <div className={styles.applicantDetailsPanel}>
        <h2 className={styles.panelTitle}>{title}</h2>
        <div className={styles.emptyDetails}>
          <div className={styles.emptyDetailsIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className={styles.emptyDetailsTitle}>No Applicant Selected</h3>
          <p className={styles.emptyDetailsText}>
            Select an applicant from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  const handleSelectButtonClick = () => {
    if (application) {
      onSelectApplicant(application.courses);
    }
  };

  const handleAddToRankingClick = () => {
    if (!application.selected) {
      showToast(
        "Please select the applicant before adding to ranking",
        "error"
      );
      return;
    }
    if (application.rank !== undefined) {
      showToast("Applicant is already added to ranking", "info");
      return;
    }
    if (!application.comment) {
      showToast(
        "Please add and save a comment before adding to ranking.",
        "error"
      );
      return;
    }
    const hasUnsavedComment = comment !== (application.comment || "");
    if (hasUnsavedComment) {
      showToast("Please save your comment before adding to ranking.", "error");
      return;
    }
    onAddToRanking();
  };

  return (
    <div className={styles.applicantDetailsPanel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={application.id}
          className={styles.detailsContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.actionButtonsContainer}>
            <div>
              <h2 className={styles.applicantNameLarge}>
                {application.fullName}
              </h2>
              <p className={styles.applicantEmail}>{application.email}</p>
              <div className={styles.applicantBadges}>
                <span
                  className={`${styles.availabilityBadge} ${application.availability === "Full Time" ? styles.fullTime : styles.partTime}`}
                >
                  {application.availability}
                </span>
                <span className={styles.dateBadge}>
                  Applied:{" "}
                  {new Date(application.dateApplied).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className={styles.buttonGroup}>
              {application.selected ? (
                <>
                  <button
                    onClick={onUnselectApplicant}
                    className={`${styles.actionButton} ${styles.unselectButton}`}
                  >
                    Unselect
                  </button>
                  {application.rank !== undefined ? (
                    <button
                      disabled
                      className={`${styles.actionButton} ${styles.alreadyRankedButton}`}
                      title="Already added to ranking"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={styles.buttonIcon}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Added to Ranking
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToRankingClick}
                      className={`${styles.actionButton} ${styles.addToRankingButton}`}
                      title={
                        !application.comment
                          ? "Please add and save a comment before adding to ranking"
                          : comment !== (application.comment || "")
                            ? "Please save your comment before adding to ranking"
                            : "Add to ranking"
                      }
                      disabled={
                        !application.comment ||
                        comment !== (application.comment || "")
                      }
                    >
                      Add to Ranking
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleSelectButtonClick}
                  className={`${styles.actionButton} ${styles.selectButton}`}
                >
                  Select Applicant
                </button>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.sectionIcon}
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
              Course Applications
            </h4>
            <div className={styles.coursesContainer}>
              {application.courses.map((courseCode) => {
                const courseInfo = availableCourses.find(
                  (course) => course.code === courseCode
                );
                return (
                  <div key={courseCode} className={styles.courseCard}>
                    <div className={styles.courseCode}>{courseCode}</div>
                    <div className={styles.courseName}>
                      {courseInfo ? courseInfo.name : "Course not found"}
                    </div>
                    {application.selectedForCourses?.includes(courseCode) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={styles.courseSelectedIcon}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.sectionIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Experience & Skills
            </h4>
            <div className={styles.experienceSkillsGrid}>
              <div className={styles.previousRolesSection}>
                <h5 className={styles.subsectionTitle}>Previous Roles</h5>
                {application.previousRoles &&
                application.previousRoles.length > 0 ? (
                  <ul className={styles.rolesList}>
                    {application.previousRoles.map((role, index) => (
                      <li key={index} className={styles.roleItem}>
                        {role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyList}>No previous roles listed</p>
                )}
              </div>

              <div className={styles.skillsSection}>
                <h5 className={styles.subsectionTitle}>Skills</h5>
                <div className={styles.skillsContainer}>
                  {application.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.sectionIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m12 14 6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
              Academic Background
            </h4>
            <div className={styles.academicText}>
              {application.academicCredentials ||
                "No academic credentials provided"}
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.sectionIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Comments & Notes
            </h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comments about this applicant..."
              className={styles.commentTextarea}
            />
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => onSaveComment(application.courses)}
                className={`${styles.actionButton} ${styles.addToRankingButton}`}
                style={{ fontSize: "0.875rem" }}
              >
                Save Comment
              </button>
              {application.comment && (
                <button
                  onClick={onDeleteComment}
                  className={`${styles.actionButton} ${styles.unselectButton}`}
                  style={{ fontSize: "0.875rem" }}
                >
                  Delete Comment
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ApplicantDetails;
