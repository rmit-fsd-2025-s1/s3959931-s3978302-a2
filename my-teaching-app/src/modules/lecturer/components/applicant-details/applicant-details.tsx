import React from "react";
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import { availableCourses } from "@/modules/course/utils/courseDisplay.utils"; // Updated
import { motion, AnimatePresence } from "framer-motion";
import SkillTag from "@/modules/tutor/components/skill-tag/skill-tag";
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
}) => {
  if (!application) {
    return (
      <div className={styles.emptyDetails}>
        <div className={styles.emptyDetailsIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
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
    <AnimatePresence mode="wait">
      <motion.div
        key={application.id}
        className={styles.detailsContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-start mb-6">
          {" "}
          {/* Tailwind class, consider moving to module if more complex */}
          <div>
            <h2 className={styles.applicantName}>{application.fullName}</h2>
            <p className={`${styles.applicantEmail} mb-2`}>
              {application.email}
            </p>
            <div className={`${styles.applicantBadges} mt-2`}>
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
          <div className="flex gap-2">
            {" "}
            {/* Tailwind class */}
            {application.selected ? (
              <>
                <button
                  onClick={onUnselectApplicant}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  {" "}
                  {/* Tailwind classes */}
                  Unselect
                </button>
                {application.rank !== undefined ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-purple-500 text-white rounded cursor-default flex items-center"
                    title="Already added to ranking"
                  >
                    {" "}
                    {/* Tailwind classes */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
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
                    className={`px-4 py-2 rounded transition-colors ${
                      !application.comment ||
                      comment !== (application.comment || "")
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
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
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {" "}
                {/* Tailwind classes */}
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
            Applied for Course
          </h4>
          <div className={`${styles.coursesSelection} mb-4`}>
            {application.courses.map((courseCode) => {
              const course = availableCourses.find(
                (c) => c.code === courseCode
              );
              return (
                <div key={courseCode} className={styles.courseCard}>
                  <div className={styles.courseCode}>{courseCode}</div>
                  <div className={styles.courseName}>
                    {course?.name || "Unknown Course"}
                  </div>
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
                <p className={styles.emptyList}>No previous roles</p>
              )}
            </div>
            <div className={styles.skillsSection}>
              <h5 className={styles.subsectionTitle}>Skills</h5>
              <div className={styles.skillsContainer}>
                {application.skills.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Academic Credentials
          </h4>
          <p className={styles.academicText}>
            {application.academicCredentials}
          </p>
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Lecturer Comment
          </h4>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comment about the applicant..."
            className={styles.commentTextarea}
            rows={4}
          ></textarea>
          <button
            onClick={() => onSaveComment(application.courses)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300" /* Tailwind */
            disabled={!comment.trim()}
          >
            Save Comment
          </button>
          <button
            onClick={onDeleteComment}
            className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300" /* Tailwind */
            disabled={!comment && (!application || !application.comment)}
          >
            Delete Comment
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplicantDetails;
