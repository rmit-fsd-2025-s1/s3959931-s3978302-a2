import React, { useState, useEffect } from "react";
import { TutorApplication } from "../../utils/tutorUtils";
import { availableCourses } from "../../utils/coursesUtils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ApplicantDetails Component
 * 
 * This component displays detailed information about a selected tutor application.
 * It allows lecturers to:
 * - View applicant's personal information
 * - Select courses the applicant is applying for
 * - Add comments about the applicant
 * - Select or unselect the applicant
 * - Add the applicant to the ranking list
 * 
 * The component includes validation to ensure at least one course is selected
 * before allowing the applicant to be added to the ranking.
 */

interface ApplicantDetailsProps {
    application: TutorApplication | null;
    comment: string;
    setComment: (comment: string) => void;
    onSaveComment: (selectedCourses: string[]) => void;
    onUnselectApplicant: () => void;
    onAddToRanking: () => void;
    showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
    application,
    comment,
    setComment,
    onSaveComment,
    onUnselectApplicant,
    onAddToRanking,
    showToast
}) => {
    // State to track selected courses for this applicant
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    // Update selected courses when application changes
    useEffect(() => {
        if (application?.selectedForCourses) {
            setSelectedCourses(application.selectedForCourses);
        } else {
            setSelectedCourses([]);
        }
    }, [application]);

    /**
     * Toggles the selection state of a course
     * @param courseCode - The code of the course to toggle
     */
    const handleCourseSelection = (courseCode: string) => {
        setSelectedCourses(prev => {
            if (prev.includes(courseCode)) {
                return prev.filter(course => course !== courseCode);
            } else {
                return [...prev, courseCode];
            }
        });
    };

    /**
     * Selects all courses the applicant has applied for
     */
    const handleSelectAll = () => {
        if (application) {
            setSelectedCourses(application.courses);
        }
    };

    /**
     * Deselects all courses
     */
    const handleDeselectAll = () => {
        setSelectedCourses([]);
    };

    // Show empty state when no application is selected
    if (!application) {
        return (
            <div className="empty-details">
                <div className="empty-details-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h3 className="empty-details-title">No Applicant Selected</h3>
                <p className="empty-details-text">Select an applicant from the list to view their details</p>
            </div>
        );
    }

    /**
     * Saves the comment and selects the applicant for the selected courses
     * Validates that at least one course is selected
     */
    const handleSaveAndSelect = () => {
        if (selectedCourses.length === 0) {
            showToast("Please select at least one course", "error");
            return;
        }
        onSaveComment(selectedCourses);
        showToast("Applicant saved and selected successfully!", "success");
    };

    /**
     * Validates all fields in the applicant details
     * Returns true if all validations pass, false otherwise
     * 
     * @returns {boolean} - Whether all fields are valid
     */
    const validateAllFields = (): boolean => {
        // Check if at least one course is selected
        if (selectedCourses.length === 0) {
            showToast("Please select at least one course", "error");
            return false;
        }
        
        // Check if comment is provided
        if (!comment.trim()) {
            showToast("Please provide a comment about the applicant", "error");
            return false;
        }
        
        // All validations pass
        return true;
    };

    /**
     * Adds the applicant to the ranking list
     * Only works if all fields are validated and the applicant is selected
     */
    const handleAddToRanking = () => {
        if (!validateAllFields()) {
            return;
        }
        if (!application.selected) {
            showToast("Please select the applicant before adding to ranking", "error");
            return;
        }
        onAddToRanking();
        showToast("Applicant added to ranking successfully!", "success");
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={application.id}
                className="details-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {application.fullName}
                        </h2>
                        <p className="text-gray-600">{application.email}</p>
                        <div className="applicant-badges mt-2">
                            <span className={`availability-badge ${application.availability === "Full Time" ? "full-time" : "part-time"}`}>
                                {application.availability}
                            </span>
                            <span className="date-badge">Applied: {new Date(application.dateApplied).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {application.selected ? (
                            <button
                                onClick={onUnselectApplicant}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Unselect
                            </button>
                        ) : (
                            <button
                                onClick={handleSaveAndSelect}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Select Applicant
                            </button>
                        )}
                        {selectedCourses.length > 0 && application.selected && comment.trim() && (
                            <button
                                onClick={handleAddToRanking}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                title="Add to ranking"
                            >
                                Add to Ranking
                            </button>
                        )}
                    </div>
                </div>

                <div className="section mb-6">
                    <h4 className="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        Applied for Courses
                    </h4>
                    <div className="courses-selection mb-4">
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={handleSelectAll}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                onClick={handleDeselectAll}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                            >
                                Deselect All
                            </button>
                        </div>
                        <div className="courses-container">
                            {application.courses.map((courseCode) => {
                                const course = availableCourses.find((c) => c.code === courseCode);
                                const isSelected = selectedCourses.includes(courseCode);
                                return (
                                    <div
                                        key={courseCode}
                                        className={`course-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleCourseSelection(courseCode)}
                                    >
                                        <div className="course-code">{courseCode}</div>
                                        <div className="course-name">{course?.name || "Unknown Course"}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="section mb-6">
                    <h4 className="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        Previous Roles
                    </h4>
                    {application.previousRoles.length > 0 ? (
                        <ul className="roles-list">
                            {application.previousRoles.map((role, index) => (
                                <li key={index} className="role-item">
                                    {role}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-list">No previous roles</p>
                    )}
                </div>

                <div className="section mb-6">
                    <h4 className="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                        </svg>
                        Skills
                    </h4>
                    <div className="skills-container">
                        {application.skills.map((skill) => (
                            <span key={skill} className="skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="section mb-6">
                    <h4 className="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                            />
                        </svg>
                        Academic Credentials
                    </h4>
                    <p className="academic-text">{application.academicCredentials}</p>
                </div>

                <div className="section">
                    <h4 className="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" className="section-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                        </svg>
                        Comments
                    </h4>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="comment-textarea"
                        rows={3}
                        placeholder="Add your comments about this applicant..."
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ApplicantDetails;
