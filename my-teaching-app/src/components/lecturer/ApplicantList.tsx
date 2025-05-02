import React from "react";
import { TutorApplication } from "../../utils/tutorUtils";
import { motion } from "framer-motion";

/**
 * ApplicantList Component
 * 
 * This component displays a list of tutor applications for a selected course.
 * It provides a visual interface for lecturers to browse through applications
 * and select one to view in detail.
 * 
 * Features:
 * - Displays applicant name, courses, availability, and skills
 * - Highlights the currently selected applicant
 * - Shows a visual indicator for already selected applicants
 * - Provides empty state when no applications are available
 * - Includes animations for a better user experience
 */

interface ApplicantListProps {
    applications: TutorApplication[];
    selectedApplication: TutorApplication | null;
    onSelectApplication: (app: TutorApplication) => void;
}

const ApplicantList: React.FC<ApplicantListProps> = ({ applications, selectedApplication, onSelectApplication }) => {
    // Animation variants for list items - controls the staggered animation of list items
    const listVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Stagger the animation of child elements
            },
        },
    };

    // Animation variants for individual list items
    const itemVariants = {
        hidden: { opacity: 0, y: 20 }, // Start slightly below and invisible
        show: { opacity: 1, y: 0 },    // Animate to normal position and visible
    };

    return (
        <div className="applicant-list-container">
            {/* Display empty state when no applications are available */}
            {applications.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                    </div>
                    <p className="empty-text">No applications found for this course.</p>
                </div>
            ) : (
                // Animated list of applications
                <motion.div className="applicant-list" variants={listVariants} initial="hidden" animate="show">
                    {applications.map((application) => (
                        <motion.div
                            key={application.id}
                            className={`applicant-item ${selectedApplication?.id === application.id ? "selected" : ""}`}
                            onClick={() => onSelectApplication(application)}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }} // Slight scale up on hover
                            whileTap={{ scale: 0.98 }}   // Slight scale down on click
                        >
                            {/* Applicant avatar with initials */}
                            <div className="applicant-avatar">
                                {application.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                            </div>
                            
                            {/* Applicant information */}
                            <div className="applicant-info">
                                <div className="applicant-name">{application.fullName}</div>
                                <div className="applicant-details">
                                    {/* Number of courses applied for */}
                                    <span className="detail-item">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="detail-icon"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                            />
                                        </svg>
                                        {application.courses.length} course(s)
                                    </span>
                                    
                                    {/* Availability status */}
                                    <span className="detail-item">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="detail-icon"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                        {application.availability}
                                    </span>
                                </div>
                                
                                {/* Applicant skills (showing first 3 with count of remaining) */}
                                <div className="applicant-skills">
                                    {application.skills.slice(0, 3).map((skill, index) => (
                                        <span key={index} className="skill-badge">
                                            {skill}
                                        </span>
                                    ))}
                                    {application.skills.length > 3 && <span className="more-skills">+{application.skills.length - 3}</span>}
                                </div>
                            </div>
                            
                            {/* Visual indicator for already selected applicants */}
                            {application.selected && (
                                <div className="applicant-selected">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="selected-icon"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            )}
                            
                            {/* Application date */}
                            <div className="applied-date">{new Date(application.dateApplied).toLocaleDateString()}</div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default ApplicantList;
