import React, { useState, useEffect } from "react";
import type { CourseDetails } from "@/shared/types/course"; // Updated
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import { availableSkills } from "@/modules/tutor/utils/applicationDisplay.utils"; // Updated
import SkillTag from "@/modules/tutor/components/skill-tag/skill-tag";
import styles from "./apply-modal.module.css";

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
  const [previousRoles, setPreviousRoles] = useState("");
  const [academicCredentials, setAcademicCredentials] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<{
    previousRoles?: string;
    academicCredentials?: string;
    skills?: string;
  }>({});

  useEffect(() => {
    if (isOpen && course) {
      const shuffled = [...availableSkills].sort(() => 0.5 - Math.random());
      setSelectedSkills(shuffled.slice(0, 2 + Math.floor(Math.random() * 2)));
      setErrors({});
      setPreviousRoles("");
      setAcademicCredentials("");
      setSkillInput("");
      setShowSkillInput(false);
    }
  }, [isOpen, course]);

  const handleSkillInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && skillInput.trim() !== "") {
      e.preventDefault();
      if (skillInput.trim().length < 2) {
        setErrors((prev) => ({
          ...prev,
          skills: "Custom skills must be at least 2 characters long",
        }));
        return;
      }
      if (selectedSkills.length >= 5) {
        setErrors((prev) => ({ ...prev, skills: "Maximum 5 skills allowed" }));
        return;
      }
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

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const validateForm = (): boolean => {
    const newErrors: {
      previousRoles?: string;
      academicCredentials?: string;
      skills?: string;
    } = {};
    const roles = previousRoles
      .split("\n")
      .filter((role) => role.trim() !== "");
    if (roles.length > 10) {
      newErrors.previousRoles = "Maximum 10 previous roles allowed";
    }
    for (const role of roles) {
      if (role.trim().length < 5) {
        newErrors.previousRoles =
          "Each role must be at least 5 characters long";
        break;
      }
      if (!/^[A-Z]+\d+.*\(\d{4}\)$/.test(role.trim())) {
        newErrors.previousRoles =
          "Roles should follow format: COSC1111 Lab Assistant (2024)";
        break;
      }
    }
    if (!academicCredentials.trim()) {
      newErrors.academicCredentials = "Academic credentials are required";
    } else if (academicCredentials.trim().length < 10) {
      newErrors.academicCredentials =
        "Academic credentials must be at least 10 characters long";
    }
    if (selectedSkills.length < 2) {
      newErrors.skills = "At least 2 skills are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !validateForm()) return;
    const application: TutorApplication = {
      id: Date.now().toString(),
      userId: currentUserId,
      email: "",
      fullName: "",
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

  if (!isOpen || !course) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${styles.applyModalBackdrop}`}
    >
      <div
        className={`${styles.applyModal} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className={`${styles.applyModalHeader} p-6`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-bold ${styles.applyModalTitle}`}>
              Apply for Course
            </h3>
            <button onClick={onClose} className={styles.applyModalClose}>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className={`block font-bold mb-2 ${styles.applyModalLabel}`}>
              Course
            </label>
            <div className={`${styles.applyModalReadonlyField} p-3 rounded-lg`}>
              <p className={`font-semibold ${styles.applyModalTextPrimary}`}>
                {course.code} - {course.name}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                className={`block font-bold mb-2 ${styles.applyModalLabel}`}
              >
                Role
              </label>
              <div
                className={`${styles.applyModalReadonlyField} p-3 rounded-lg`}
              >
                <p className={`font-medium ${styles.applyModalTextPrimary}`}>
                  {course.role}
                </p>
              </div>
            </div>
            <div>
              <label
                className={`block font-bold mb-2 ${styles.applyModalLabel}`}
              >
                Availability
              </label>
              <div
                className={`${styles.applyModalReadonlyField} p-3 rounded-lg`}
              >
                <p className={`font-medium ${styles.applyModalTextPrimary}`}>
                  {course.availability}
                </p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label
              className={`block font-bold mb-2 ${styles.applyModalLabel}`}
              htmlFor="previousRoles"
            >
              Previous Teaching Roles
            </label>
            <textarea
              id="previousRoles"
              value={previousRoles}
              onChange={(e) => setPreviousRoles(e.target.value)}
              placeholder="List your previous roles (one per line), e.g., COSC1111 Lab Assistant (2024)"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 ${styles.applyModalInput} ${errors.previousRoles ? styles.errorText : ""}`}
              rows={3}
            />
            {errors.previousRoles && (
              <p className={styles.errorText}>{errors.previousRoles}</p>
            )}
            <p className={`text-xs mt-1 ${styles.applyModalSecondaryText}`}>
              Format: [Course Code] [Role Type] (Year) - One per line, maximum
              10 roles
            </p>
          </div>
          <div className="mb-6">
            <label
              className={`block font-bold mb-2 ${styles.applyModalLabel}`}
              htmlFor="academicCredentials"
            >
              Academic Credentials
            </label>
            <textarea
              id="academicCredentials"
              value={academicCredentials}
              onChange={(e) => setAcademicCredentials(e.target.value)}
              placeholder="Describe your academic background, degrees, certifications, etc."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 ${styles.applyModalInput} ${errors.academicCredentials ? styles.errorText : ""}`}
              rows={4}
              required
            />
            {errors.academicCredentials && (
              <p className={styles.errorText}>{errors.academicCredentials}</p>
            )}
            <p className={`text-xs mt-1 ${styles.applyModalSecondaryText}`}>
              Minimum 10 characters required.
            </p>
          </div>
          <div className="mb-6">
            <label className={`block font-bold mb-2 ${styles.applyModalLabel}`}>
              Skills
            </label>
            <div className="flex flex-wrap gap-3 mb-2">
              {selectedSkills.map((skill, index) => (
                <SkillTag
                  key={index}
                  skill={skill}
                  onRemove={handleRemoveSkill}
                />
              ))}
            </div>
            {showSkillInput ? (
              <div className="flex mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                  placeholder="Type skill and press Enter"
                  className={`flex-1 p-2 border rounded-l-lg focus:ring-2 focus:ring-primary/20 ${styles.applyModalInput} ${styles.skillInputField} ${errors.skills ? styles.errorText : ""}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (skillInput.trim() !== "") {
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
                  className={`px-4 py-2 rounded-r-lg ${styles.addSkillButton}`}
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSkillInput(true)}
                className="flex items-center text-primary hover:text-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
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
              <p className={styles.errorText}>{errors.skills}</p>
            )}
            <p className={`text-xs mt-1 ${styles.applyModalSecondaryText}`}>
              At least 2 skills required, maximum 5 skills allowed. Skills
              should be relevant to the course.
            </p>
            <div className="mt-4">
              <p className={`text-sm mb-2 ${styles.applyModalSecondaryText}`}>
                Popular skills:
              </p>
              <div className="flex flex-wrap">
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
                        setErrors((prev) => ({ ...prev, skills: undefined }));
                      }
                    }}
                    className={`${styles.popularSkillButton} ${selectedSkills.includes(skill) ? "opacity-50" : ""}`}
                    disabled={selectedSkills.includes(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`flex justify-end pt-4 border-t ${styles.applyModalBorder}`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`mr-2 px-4 py-2 rounded-lg ${styles.applyModalButtonCancel}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg ${styles.applyModalButtonSubmit}`}
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
