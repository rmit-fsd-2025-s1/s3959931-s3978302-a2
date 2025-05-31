import React, { useState, useEffect } from "react";
import type { CourseDetails } from "@/shared/types/course";
import type { Application as TutorApplication } from "@/shared/types/application";
import { availableSkills } from "@/modules/tutor/utils/applicationDisplay.utils";
import SkillTag from "@/modules/tutor/components/skill-tag/skill-tag";
import styles from "./apply-modal.module.css";

/**
 * Validation Rules for Tutor Application Form:
 *
 * 1. Previous Roles:
 *    - Optional field
 *    - Each role should be on a separate line
 *    - Format: [Course Code] [Role Type] (Year)
 *    - Example: COSC1111 Lab Assistant (2024)
 *    - Maximum 10 roles allowed
 *    - Each role should be at least 5 characters long
 *
 * 2. Academic Credentials:
 *    - Required field
 *    - Minimum 10 characters
 *
 * 3. Skills:
 *    - At least 2 skills required
 *    - Maximum 5 skills allowed
 *    - Skills should be relevant to the course
 *    - Duplicate skills are not allowed
 *    - Custom skills should be at least 2 characters long
 *    - Custom skills should not contain special characters
 *    - Skills should be alphanumeric with optional spaces
 */

interface ApplyModalProps {
  isOpen: boolean;
  course: CourseDetails | null;
  onClose: () => void;
  onSubmit: (application: TutorApplication) => void;
  currentUserId: string;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  course,
  onClose,
  onSubmit,
  currentUserId,
}) => {
  // State for form fields
  const [previousRoles, setPreviousRoles] = useState("");
  const [academicCredentials, setAcademicCredentials] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // Validation error states
  const [errors, setErrors] = useState<{
    previousRoles?: string;
    academicCredentials?: string;
    skills?: string;
  }>({});

  // When modal opens, initialize with random skills
  useEffect(() => {
    if (isOpen && course) {
      // Select 2-3 random skills when modal opens
      const shuffled = [...availableSkills].sort(() => 0.5 - Math.random());
      setSelectedSkills(shuffled.slice(0, 2 + Math.floor(Math.random() * 2)));
      // Reset errors when modal opens
      setErrors({});
    }
  }, [isOpen, course]);

  /**
   * Validates and handles skill input when Enter key is pressed
   * Validation rules:
   * - Skill must be at least 2 characters long
   * - Maximum 5 skills allowed
   * - No duplicate skills
   * - Skills should be alphanumeric with optional spaces
   *
   * @param e - The keyboard event
   */
  const handleSkillInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && skillInput.trim() !== "") {
      e.preventDefault();
      // Validate custom skill input
      if (skillInput.trim().length < 2) {
        setErrors((prev) => ({
          ...prev,
          skills: "Custom skills must be at least 2 characters long",
        }));
        return;
      }
      if (selectedSkills.length >= 5) {
        setErrors((prev) => ({
          ...prev,
          skills: "Maximum 5 skills allowed",
        }));
        return;
      }
      // Check for special characters
      if (!/^[a-zA-Z0-9\s]+$/.test(skillInput.trim())) {
        setErrors((prev) => ({
          ...prev,
          skills: "Skills should only contain letters, numbers, and spaces",
        }));
        return;
      }
      if (!selectedSkills.includes(skillInput.trim())) {
        setSelectedSkills([...selectedSkills, skillInput.trim()]);
        setErrors((prev) => ({ ...prev, skills: undefined }));
      }
      setSkillInput("");
    }
  };

  /**
   * Removes a skill from the selected skills list
   *
   * @param skillToRemove - The skill to remove
   */
  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  /**
   * Validates all form fields according to the validation rules
   * Returns true if all validations pass, false otherwise
   *
   * @returns {boolean} - Whether the form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: {
      previousRoles?: string;
      academicCredentials?: string;
      skills?: string;
    } = {};

    // Validate previous roles (optional field)
    const roles = previousRoles
      .split("\n")
      .filter((role) => role.trim() !== "");
    if (roles.length > 10) {
      newErrors.previousRoles = "Maximum 10 previous roles allowed";
    }
    // Check each role format
    for (const role of roles) {
      if (role.trim().length < 5) {
        newErrors.previousRoles =
          "Each role must be at least 5 characters long";
        break;
      }
      // Basic format validation: should contain course code and year
      if (!/^[A-Z]+\d+.*\(\d{4}\)$/.test(role.trim())) {
        newErrors.previousRoles =
          "Roles should follow format: COSC1111 Lab Assistant (2024)";
        break;
      }
    }

    // Validate academic credentials - only minimum length required
    if (!academicCredentials.trim()) {
      newErrors.academicCredentials = "Academic credentials are required";
    } else if (academicCredentials.trim().length < 10) {
      newErrors.academicCredentials =
        "Academic credentials must be at least 10 characters long";
    }

    // Validate skills
    if (selectedSkills.length < 2) {
      newErrors.skills = "At least 2 skills are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * Validates the form before creating and submitting the application
   *
   * @param e - The form event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!course) return;

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Create application object
    const application: TutorApplication = {
      id: Date.now().toString(), // Generate unique ID for new application
      userId: currentUserId,
      email: "", // Will be populated from user data in saveApplication
      fullName: "", // Will be populated from user data in saveApplication
      courses: [course.code],
      previousRoles: previousRoles
        .split("\n")
        .filter((role) => role.trim() !== ""),
      availability: course.availability,
      skills: selectedSkills,
      academicCredentials: academicCredentials,
      dateApplied: new Date().toISOString().split("T")[0],
    };

    onSubmit(application);
  };

  // Don't render if modal is not open or no course is selected
  if (!isOpen || !course) return null;

  return (
    <div className={styles.applyModalBackdrop}>
      <div className={styles.applyModal}>
        {/* Header */}
        <div className={styles.applyModalHeader}>
          <div className={styles.applyModalHeaderContent}>
            <h2 className={styles.applyModalTitle}>Apply for Tutor Position</h2>
            <button
              type="button"
              onClick={onClose}
              className={styles.applyModalClose}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className={styles.applyModalForm}>
          <form onSubmit={handleSubmit}>
            {/* Course Details */}
            <div className={styles.applyModalGrid}>
              <div className={styles.applyModalFieldGroup}>
                <label className={styles.applyModalLabel}>Course Code</label>
                <div className={styles.applyModalReadonlyField}>
                  {course.code}
                </div>
              </div>
              <div className={styles.applyModalFieldGroup}>
                <label className={styles.applyModalLabel}>Course Name</label>
                <div className={styles.applyModalReadonlyField}>
                  {course.name}
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className={styles.applyModalFieldGroup}>
              <label
                htmlFor="previous_roles"
                className={styles.applyModalLabel}
              >
                Previous Teaching Roles (Optional)
              </label>
              <textarea
                id="previous_roles"
                name="previous_roles"
                rows={4}
                value={previousRoles}
                onChange={(e) => setPreviousRoles(e.target.value)}
                className={styles.applyModalInput}
                placeholder="List any previous teaching or tutoring experience (one per line)&#10;Format: [Course Code] [Role Type] (Year)&#10;Example: COSC1111 Lab Assistant (2024)"
              />
              <div className={styles.applyModalSecondaryText}>
                Each role should be on a separate line. Format: [Course Code]
                [Role Type] (Year)
              </div>
            </div>

            <div className={styles.applyModalFieldGroup}>
              <label htmlFor="motivation" className={styles.applyModalLabel}>
                Why do you want to tutor this course? *
              </label>
              <textarea
                id="motivation"
                name="motivation"
                rows={4}
                required
                value={academicCredentials}
                onChange={(e) => setAcademicCredentials(e.target.value)}
                className={styles.applyModalInput}
                placeholder="Explain your motivation for tutoring this course..."
              />
            </div>

            <div className={styles.applyModalFieldGroup}>
              <label
                htmlFor="qualifications"
                className={styles.applyModalLabel}
              >
                Relevant Qualifications *
              </label>
              <textarea
                id="qualifications"
                name="qualifications"
                rows={4}
                required
                value={academicCredentials}
                onChange={(e) => setAcademicCredentials(e.target.value)}
                className={styles.applyModalInput}
                placeholder="Describe your academic background, relevant experience, and qualifications..."
              />
            </div>

            {/* Skills */}
            <div className={styles.applyModalFieldGroup}>
              <label className={styles.applyModalLabel}>Skills</label>

              {/* Display current skills */}
              {selectedSkills.length > 0 && (
                <div className={styles.applyModalSkillsContainer}>
                  {selectedSkills.map((skill, index) => (
                    <SkillTag
                      key={index}
                      skill={skill}
                      onRemove={handleRemoveSkill}
                    />
                  ))}
                </div>
              )}

              {/* Add skills input */}
              {showSkillInput ? (
                <div className={styles.applyModalSkillInput}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSkillInputKeyDown(e);
                      }
                    }}
                    placeholder="Enter a skill..."
                    className={styles.applyModalSkillInputField}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (skillInput.trim() !== "") {
                        // Validate custom skill input
                        if (skillInput.trim().length < 2) {
                          setErrors((prev) => ({
                            ...prev,
                            skills:
                              "Custom skills must be at least 2 characters long",
                          }));
                          return;
                        }
                        if (selectedSkills.length >= 5) {
                          setErrors((prev) => ({
                            ...prev,
                            skills: "Maximum 5 skills allowed",
                          }));
                          return;
                        }
                        // Check for special characters
                        if (!/^[a-zA-Z0-9\s]+$/.test(skillInput.trim())) {
                          setErrors((prev) => ({
                            ...prev,
                            skills:
                              "Skills should only contain letters, numbers, and spaces",
                          }));
                          return;
                        }
                        if (!selectedSkills.includes(skillInput.trim())) {
                          setSelectedSkills([
                            ...selectedSkills,
                            skillInput.trim(),
                          ]);
                          setErrors((prev) => ({ ...prev, skills: undefined }));
                        }
                        setSkillInput("");
                      } else {
                        setShowSkillInput(false);
                      }
                    }}
                    className={styles.applyModalAddButton}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSkillInput(true)}
                  className={styles.applyModalAddSkillsButton}
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Skills
                </button>
              )}

              {/* Popular skills */}
              <div className={styles.applyModalPopularSkills}>
                <span className={styles.applyModalPopularSkillsLabel}>
                  Popular skills:
                </span>
                <div className={styles.applyModalPopularSkillsContainer}>
                  {availableSkills
                    .filter((skill) => !selectedSkills.includes(skill))
                    .slice(0, 10)
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          if (!selectedSkills.includes(skill)) {
                            setSelectedSkills([...selectedSkills, skill]);
                          }
                        }}
                        className={styles.popularSkillButton}
                      >
                        {skill}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Error display */}
            {errors.skills && (
              <div className={styles.applyModalErrorText}>{errors.skills}</div>
            )}

            {/* Form Actions */}
            <div className={styles.applyModalActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.applyModalButtonCancel}
              >
                Cancel
              </button>
              <button type="submit" className={styles.applyModalButtonSubmit}>
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
