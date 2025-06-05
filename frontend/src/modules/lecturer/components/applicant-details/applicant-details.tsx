import React, { useState, useEffect } from "react";
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import { availableCourses } from "@/shared/data/courses";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./applicant-details.module.css";
import { 
  validateLecturerComment, 
  validateStatusUpdate,
  sanitizeComment,
  formatValidationErrors,
  DEFAULT_COMMENT_CONFIG 
} from "../../utils/lecturerValidation.utils";

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
  // Validation states
  const [commentError, setCommentError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Course selection states
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseSelectionError, setCourseSelectionError] = useState<string>("");

  // Clear validation errors when application changes
  useEffect(() => {
    setCommentError("");
    setCourseSelectionError("");
    setHasUnsavedChanges(false);
    // Reset course selection when application changes
    if (application) {
      setSelectedCourses([]);
    }
  }, [application?.id, application]);

  // Track unsaved changes
  useEffect(() => {
    const originalComment = application?.comment || "";
    setHasUnsavedChanges(comment !== originalComment);
  }, [comment, application?.comment]);

  // Course selection handlers
  const handleCourseToggle = (courseCode: string) => {
    setCourseSelectionError("");
    setSelectedCourses(prev => {
      if (prev.includes(courseCode)) {
        return prev.filter(code => code !== courseCode);
      } else {
        return [...prev, courseCode];
      }
    });
  };

  const handleSelectAllCourses = () => {
    setCourseSelectionError("");
    if (application) {
      setSelectedCourses([...application.courses]);
    }
  };

  const handleDeselectAllCourses = () => {
    setCourseSelectionError("");
    setSelectedCourses([]);
  };

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

  // Handle comment changes with validation
  const handleCommentChange = (value: string) => {
    setComment(value);
    setCommentError(""); // Clear error on change
  };

  // Validate and save comment
  const handleSaveComment = async () => {
    if (!application || isSubmitting) return;

    setIsSubmitting(true);
    setCommentError("");

    try {
      // Sanitize comment
      const sanitizedComment = sanitizeComment(comment);
      
      // Validate comment
      const validation = validateLecturerComment(sanitizedComment, {
        ...DEFAULT_COMMENT_CONFIG,
        allowEmpty: true,
        minLength: 3
      });

      if (!validation.isValid) {
        const errorMessages = formatValidationErrors(validation.errors);
        setCommentError(errorMessages[0] || "Invalid comment");
        setIsSubmitting(false);
        return;
      }

      // Update comment value with sanitized version
      if (sanitizedComment !== comment) {
        setComment(sanitizedComment);
      }

      // Call the parent's save function (this should handle the API call)
      await onSaveComment(application.courses);
      
      showToast("Comment saved successfully!", "success");
      setHasUnsavedChanges(false);
      
    } catch {
      setCommentError("Failed to save comment. Please try again.");
      showToast("Failed to save comment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status updates with validation
  const handleSelectButtonClick = () => {
    if (!application) return;

    // Validate course selection
    if (selectedCourses.length === 0) {
      setCourseSelectionError("Please select at least one course before selecting the applicant.");
      showToast("Please select at least one course", "error");
      return;
    }

    // Validate status update
    const validation = validateStatusUpdate(
      application.id,
      "selected",
      selectedCourses,
      comment,
      {
        allowedStatuses: ["pending", "shortlisted", "selected", "rejected"],
        requireComment: false,
        requireCourseSelection: true
      }
    );

    if (!validation.isValid) {
      const errorMessages = formatValidationErrors(validation.errors);
      showToast(errorMessages[0] || "Validation failed", "error");
      return;
    }

    onSelectApplicant(selectedCourses);
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
    if (!application.comment || !comment.trim()) {
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
                  disabled={selectedCourses.length === 0}
                  title={selectedCourses.length === 0 ? "Please select at least one course" : "Select applicant for chosen courses"}
                >
                  Select Applicant
                </button>
              )}
            </div>
          </div>

          {/* Course Selection Section - Only show if not selected */}
          {!application.selected && (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Course Selection
              </h4>
              <p className={styles.sectionDescription}>
                Select the courses you want to consider this applicant for:
              </p>
              
              {courseSelectionError && (
                <div className={styles.errorMessage}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.errorIcon}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {courseSelectionError}
                </div>
              )}

              <div className={styles.courseSelectionControls}>
                <button
                  onClick={handleSelectAllCourses}
                  className={`${styles.courseControlButton} ${styles.selectAllButton}`}
                  disabled={selectedCourses.length === application.courses.length}
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAllCourses}
                  className={`${styles.courseControlButton} ${styles.deselectAllButton}`}
                  disabled={selectedCourses.length === 0}
                >
                  Deselect All
                </button>
              </div>

              <div className={styles.courseSelectionContainer}>
                {application.courses.map((courseCode) => {
                  const courseInfo = availableCourses.find(
                    (course) => course.code === courseCode
                  );
                  const isSelected = selectedCourses.includes(courseCode);
                  
                  return (
                    <div 
                      key={courseCode} 
                      className={`${styles.courseSelectionCard} ${isSelected ? styles.courseSelected : ''}`}
                      onClick={() => handleCourseToggle(courseCode)}
                    >
                      <div className={styles.courseCheckbox}>
                        <input
                          type="checkbox"
                          id={`course-${courseCode}`}
                          checked={isSelected}
                          onChange={() => handleCourseToggle(courseCode)}
                          className={styles.courseCheckboxInput}
                        />
                        <label htmlFor={`course-${courseCode}`} className={styles.courseCheckboxLabel}>
                          <svg
                            className={styles.courseCheckboxIcon}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </label>
                      </div>
                      <div className={styles.courseInfo}>
                        <div className={styles.courseCode}>{courseCode}</div>
                        <div className={styles.courseName}>
                          {courseInfo ? courseInfo.name : "Course not found"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.selectionSummary}>
                <span className={styles.selectionCount}>
                  {selectedCourses.length} of {application.courses.length} courses selected
                </span>
              </div>
            </div>
          )}

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
            <div className={styles.commentInputContainer}>
              <textarea
                value={comment}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="Add your comments about this applicant..."
                className={`${styles.commentTextarea} ${commentError ? styles.commentTextareaError : ''}`}
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div className={styles.commentMeta}>
                <span className={styles.characterCount}>
                  {comment.length}/1000 characters
                </span>
                {hasUnsavedChanges && (
                  <span className={styles.unsavedIndicator}>
                    • Unsaved changes
                  </span>
                )}
              </div>
              {commentError && (
                <div className={styles.errorMessage}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.errorIcon}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {commentError}
                </div>
              )}
            </div>
            <div className={styles.commentActions}>
              <button
                onClick={handleSaveComment}
                disabled={isSubmitting || (!comment.trim() && !application.comment)}
                className={`${styles.actionButton} ${styles.addToRankingButton}`}
                style={{ fontSize: "0.875rem" }}
              >
                {isSubmitting ? (
                  <>
                    <svg className={styles.spinner} viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="32"
                        strokeDashoffset="32"
                      >
                        <animate
                          attributeName="strokeDasharray"
                          dur="2s"
                          values="0 32;16 16;0 32;0 32"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="strokeDashoffset"
                          dur="2s"
                          values="0;-16;-32;-32"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Comment"
                )}
              </button>
              {application.comment && (
                <button
                  onClick={onDeleteComment}
                  disabled={isSubmitting}
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
