import React, { useState, useEffect } from "react";
import { CourseWithDetails } from "../../utils/coursesUtils";
import { TutorApplication, availableSkills } from "../../utils/tutorUtils";
import SkillTag from "./SkillTag";

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
    course: CourseWithDetails | null;
    onClose: () => void;
    onSubmit: (application: TutorApplication) => void;
    currentUserId: string;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, course, onClose, onSubmit, currentUserId }) => {
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
    const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && skillInput.trim() !== "") {
            e.preventDefault();
            // Validate custom skill input
            if (skillInput.trim().length < 2) {
                setErrors((prev) => ({ ...prev, skills: "Custom skills must be at least 2 characters long" }));
                return;
            }
            if (selectedSkills.length >= 5) {
                setErrors((prev) => ({ ...prev, skills: "Maximum 5 skills allowed" }));
                return;
            }
            // Check for special characters
            if (!/^[a-zA-Z0-9\s]+$/.test(skillInput.trim())) {
                setErrors((prev) => ({ ...prev, skills: "Skills should only contain letters, numbers, and spaces" }));
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
        setSelectedSkills(selectedSkills.filter((skill) => skill !== skillToRemove));
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
        const roles = previousRoles.split("\n").filter((role) => role.trim() !== "");
        if (roles.length > 10) {
            newErrors.previousRoles = "Maximum 10 previous roles allowed";
        }
        // Check each role format
        for (const role of roles) {
            if (role.trim().length < 5) {
                newErrors.previousRoles = "Each role must be at least 5 characters long";
                break;
            }
            // Basic format validation: should contain course code and year
            if (!/^[A-Z]+\d+.*\(\d{4}\)$/.test(role.trim())) {
                newErrors.previousRoles = "Roles should follow format: COSC1111 Lab Assistant (2024)";
                break;
            }
        }

        // Validate academic credentials - only minimum length required
        if (!academicCredentials.trim()) {
            newErrors.academicCredentials = "Academic credentials are required";
        } else if (academicCredentials.trim().length < 10) {
            newErrors.academicCredentials = "Academic credentials must be at least 10 characters long";
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
            previousRoles: previousRoles.split("\n").filter((role) => role.trim() !== ""),
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
        <div className="fixed inset-0 apply-modal-backdrop flex items-center justify-center z-50 p-4">
            <div className="apply-modal rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal header with title and close button */}
                <div className="apply-modal-header p-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold apply-modal-title">Apply for Course</h3>
                        <button onClick={onClose} className="apply-modal-close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Course Info (Read-only) */}
                    <div className="mb-6">
                        <label className="block apply-modal-label font-bold mb-2">Course</label>
                        <div className="apply-modal-readonly-field p-3 rounded-lg">
                            <p className="font-semibold apply-modal-text-primary">
                                {course.code} - {course.name}
                            </p>
                        </div>
                    </div>

                    {/* Role & Availability (Read-only) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block apply-modal-label font-bold mb-2">Role</label>
                            <div className="apply-modal-readonly-field p-3 rounded-lg">
                                <p className="font-medium apply-modal-text-primary">{course.role}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block apply-modal-label font-bold mb-2">Availability</label>
                            <div className="apply-modal-readonly-field p-3 rounded-lg">
                                <p className="font-medium apply-modal-text-primary">{course.availability}</p>
                            </div>
                        </div>
                    </div>

                    {/* Previous Teaching Roles */}
                    <div className="mb-6">
                        <label className="block apply-modal-label font-bold mb-2" htmlFor="previousRoles">
                            Previous Teaching Roles
                        </label>
                        <textarea
                            id="previousRoles"
                            value={previousRoles}
                            onChange={(e) => setPreviousRoles(e.target.value)}
                            placeholder="List your previous roles (one per line), e.g., COSC1111 Lab Assistant (2024)"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 apply-modal-input ${
                                errors.previousRoles ? "border-red-500" : ""
                            }`}
                            rows={3}
                        />
                        {errors.previousRoles && <p className="text-red-500 text-sm mt-1">{errors.previousRoles}</p>}
                        <p className="text-xs apply-modal-secondary-text mt-1">
                            Format: [Course Code] [Role Type] (Year) - One per line, maximum 10 roles
                        </p>
                    </div>

                    {/* Academic Credentials */}
                    <div className="mb-6">
                        <label className="block apply-modal-label font-bold mb-2" htmlFor="academicCredentials">
                            Academic Credentials
                        </label>
                        <textarea
                            id="academicCredentials"
                            value={academicCredentials}
                            onChange={(e) => setAcademicCredentials(e.target.value)}
                            placeholder="Describe your academic background, degrees, certifications, etc."
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 apply-modal-input ${
                                errors.academicCredentials ? "border-red-500" : ""
                            }`}
                            rows={4}
                            required
                        />
                        {errors.academicCredentials && <p className="text-red-500 text-sm mt-1">{errors.academicCredentials}</p>}
                        <p className="text-xs apply-modal-secondary-text mt-1">Minimum 10 characters required.</p>
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                        <label className="block apply-modal-label font-bold mb-2">Skills</label>
                        <div className="flex flex-wrap mb-2">
                            {selectedSkills.map((skill, index) => (
                                <SkillTag key={index} skill={skill} onRemove={handleRemoveSkill} />
                            ))}
                        </div>

                        {/* Skill input field */}
                        {showSkillInput ? (
                            <div className="flex mb-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleSkillInputKeyDown}
                                    placeholder="Type skill and press Enter"
                                    className={`flex-1 p-2 border rounded-l-lg focus:ring-2 focus:ring-primary/20 apply-modal-input ${
                                        errors.skills ? "border-red-500" : ""
                                    }`}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (skillInput.trim() !== "") {
                                            // Validate custom skill input
                                            if (skillInput.trim().length < 2) {
                                                setErrors((prev) => ({ ...prev, skills: "Custom skills must be at least 2 characters long" }));
                                                return;
                                            }
                                            if (selectedSkills.length >= 5) {
                                                setErrors((prev) => ({ ...prev, skills: "Maximum 5 skills allowed" }));
                                                return;
                                            }
                                            // Check for special characters
                                            if (!/^[a-zA-Z0-9\s]+$/.test(skillInput.trim())) {
                                                setErrors((prev) => ({ ...prev, skills: "Skills should only contain letters, numbers, and spaces" }));
                                                return;
                                            }
                                            if (!selectedSkills.includes(skillInput.trim())) {
                                                setSelectedSkills([...selectedSkills, skillInput.trim()]);
                                                setErrors((prev) => ({ ...prev, skills: undefined }));
                                            }
                                            setSkillInput("");
                                        } else {
                                            setShowSkillInput(false);
                                        }
                                    }}
                                    className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-secondary">
                                    Add
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowSkillInput(true)}
                                className="flex items-center text-primary hover:text-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Add Skills
                            </button>
                        )}

                        {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                        <p className="text-xs apply-modal-secondary-text mt-1">
                            At least 2 skills required, maximum 5 skills allowed. Skills should be relevant to the course.
                        </p>

                        {/* Popular skills section */}
                        <div className="mt-4">
                            <p className="text-sm apply-modal-secondary-text mb-2">Popular skills:</p>
                            <div className="flex flex-wrap">
                                {availableSkills.slice(0, 6).map((skill, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                            if (!selectedSkills.includes(skill)) {
                                                if (selectedSkills.length >= 5) {
                                                    setErrors((prev) => ({ ...prev, skills: "Maximum 5 skills allowed" }));
                                                    return;
                                                }
                                                setSelectedSkills([...selectedSkills, skill]);
                                                setErrors((prev) => ({ ...prev, skills: undefined }));
                                            }
                                        }}
                                        className={`popular-skill-button ${selectedSkills.includes(skill) ? "opacity-50" : ""}`}
                                        disabled={selectedSkills.includes(skill)}>
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex justify-end pt-4 border-t apply-modal-border">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border rounded-lg">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-white rounded-lg">
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyModal;
