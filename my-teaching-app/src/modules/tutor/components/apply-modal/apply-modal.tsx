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
            <h3 className={styles.applyModalTitle}>Apply for Course</h3>
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
            {/* Course Info (Read-only) */}
            <div className={styles.applyModalFieldGroup}>
              <label className={styles.applyModalLabel}>Course</label>
              <div className={styles.applyModalReadonlyField}>
                <p className="font-semibold">
                  {course.code} - {course.name}
                </p>
              </div>
            </div>

            {/* Role & Availability (Read-only) */}
            <div className={styles.applyModalGrid}>
              <div className={styles.applyModalFieldGroup}>
                <label className={styles.applyModalLabel}>Role</label>
                <div className={styles.applyModalReadonlyField}>
                  <p className="font-medium">{course.role}</p>
                </div>
              </div>

              <div className={styles.applyModalFieldGroup}>
                <label className={styles.applyModalLabel}>Availability</label>
                <div className={styles.applyModalReadonlyField}>
                  <p className="font-medium">{course.availability}</p>
                </div>
              </div>
            </div>

            {/* Previous Teaching Roles */}
            <div className={styles.applyModalFieldGroup}>
              <label htmlFor="previousRoles" className={styles.applyModalLabel}>
                Previous Teaching Roles
              </label>
              <textarea
                id="previousRoles"
                value={previousRoles}
                onChange={(e) => setPreviousRoles(e.target.value)}
                placeholder="List your previous roles (one per line), e.g., COSC1111 Lab Assistant (2024)"
                className={`${styles.applyModalInput} ${
                  errors.previousRoles ? styles.applyModalInputError : ""
                }`}
                rows={3}
              />
              {errors.previousRoles && (
                <p className={styles.applyModalErrorText}>
                  {errors.previousRoles}
                </p>
              )}
              <p className={styles.applyModalSecondaryText}>
                Format: [Course Code] [Role Type] (Year) - One per line, maximum
                10 roles
              </p>
            </div>

            {/* Academic Credentials */}
            <div className={styles.applyModalFieldGroup}>
              <label
                htmlFor="academicCredentials"
                className={styles.applyModalLabel}
              >
                Academic Credentials
              </label>
              <textarea
                id="academicCredentials"
                value={academicCredentials}
                onChange={(e) => setAcademicCredentials(e.target.value)}
                placeholder="Describe your academic background, degrees, certifications, etc."
                className={`${styles.applyModalInput} ${
                  errors.academicCredentials ? styles.applyModalInputError : ""
                }`}
                rows={4}
                required
              />
              {errors.academicCredentials && (
                <p className={styles.applyModalErrorText}>
                  {errors.academicCredentials}
                </p>
              )}
              <p className={styles.applyModalSecondaryText}>
                Minimum 10 characters required.
              </p>
            </div>

            {/* Skills */}
            <div className={styles.applyModalFieldGroup}>
              <label className={styles.applyModalLabel}>Skills</label>

              <div className={styles.applyModalSkillsContainer}>
                {selectedSkills.map((skill, index) => (
                  <SkillTag
                    key={index}
                    skill={skill}
                    onRemove={handleRemoveSkill}
                  />
                ))}
              </div>

              {/* Skill input field */}
              {showSkillInput ? (
                <div className={styles.applyModalSkillInput}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    placeholder="Type skill and press Enter"
                    className={`${styles.applyModalSkillInputField} ${
                      errors.skills ? styles.applyModalInputError : ""
                    }`}
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
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Skills
                </button>
              )}

              {errors.skills && (
                <p className={styles.applyModalErrorText}>{errors.skills}</p>
              )}
              <p className={styles.applyModalSecondaryText}>
                At least 2 skills required, maximum 5 skills allowed. Skills
                should be relevant to the course.
              </p>

              {/* Popular skills section */}
              <div className={styles.applyModalPopularSkills}>
                <p className={styles.applyModalPopularSkillsLabel}>
                  Popular skills:
                </p>
                <div className={styles.applyModalPopularSkillsContainer}>
                  {availableSkills.slice(0, 6).map((skill, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (!selectedSkills.includes(skill)) {
                          if (selectedSkills.length >= 5) {
                            setErrors((prev) => ({
                              ...prev,
                              skills: "Maximum 5 skills allowed",
                            }));
                            return;
                          }
                          setSelectedSkills([...selectedSkills, skill]);
                          setErrors((prev) => ({
                            ...prev,
                            skills: undefined,
                          }));
                        }
                      }}
                      className={`${styles.popularSkillButton} ${
                        selectedSkills.includes(skill) ? "opacity-50" : ""
                      }`}
                      disabled={selectedSkills.includes(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form actions */}
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
