import React from "react";
import { CourseWithDetails } from "../../utils/coursesUtils";
import { availableSkills } from "../../utils/tutorUtils";
import { motion } from "framer-motion";

interface CourseCardProps {
    course: CourseWithDetails;
    openApplyModal: (course: CourseWithDetails) => void;
    hasApplied?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, openApplyModal, hasApplied = false }) => {
    // Status indicators based on availability and whether user has applied
    const getStatusInfo = () => {
        if (hasApplied) {
            return {
                label: "Applied",
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-800 dark:text-green-300",
            };
        }

        return {
            label: course.availability,
            bgColor: course.availability === "Full Time" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-purple-100 dark:bg-purple-900/30",
            textColor: course.availability === "Full Time" ? "text-blue-800 dark:text-blue-300" : "text-purple-800 dark:text-purple-300",
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="enhanced-course-card">
            {/* Card top section with code and status */}
            <div className="card-top">
                <span className="course-code">{course.code}</span>
                <span className={`course-status ${statusInfo.bgColor} ${statusInfo.textColor}`}>{statusInfo.label}</span>
            </div>

            {/* Card body */}
            <div className="card-body">
                <h3 className="course-title">{course.name}</h3>

                {/* Skills tags */}
                <div className="skills-container">
                    {course.skills?.map((skill, index) => (
                        <span key={index} className="skill-tag">
                            {skill}
                        </span>
                    ))}
                    {!course.skills &&
                        availableSkills.slice(0, 2).map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                            </span>
                        ))}
                </div>

                {/* Role tag */}
                <div className="role-tag">
                    <div className={`role-icon ${course.role === "Tutor" ? "tutor-role" : "assistant-role"}`}>
                        {course.role === "Tutor" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </div>
                    <span className="role-name">{course.role}</span>
                </div>
            </div>

            {/* Card footer */}
            <div className="card-footer">
                {!hasApplied ? (
                    <motion.button
                        className="apply-button"
                        onClick={() => openApplyModal(course)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        Apply Now
                    </motion.button>
                ) : (
                    <div className="applied-status">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

            {/* Card decorations */}
            <div className="card-decoration top-dot"></div>
            <div className="card-decoration bottom-dot"></div>
        </div>
    );
};

export default CourseCard;
