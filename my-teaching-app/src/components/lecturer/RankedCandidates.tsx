import React from "react";
import { TutorApplication } from "../../utils/tutorUtils";
import { motion, AnimatePresence } from "framer-motion";

interface RankedCandidatesProps {
    rankedApplications: TutorApplication[];
    selectedCourse: string;
    onMoveUp: (app: TutorApplication) => void;
    onMoveDown: (app: TutorApplication) => void;
    onRemove: (appId: string) => void;
}

const RankedCandidates: React.FC<RankedCandidatesProps> = ({ rankedApplications, selectedCourse, onMoveUp, onMoveDown, onRemove }) => {
    // Filter applications by selected course if any
    const filteredApplications = selectedCourse ? rankedApplications.filter((app) => app.courses.includes(selectedCourse)) : rankedApplications;

    // Sort applications by rank to ensure proper display
    const sortedApplications = [...filteredApplications].sort((a, b) => (a.rank || 999) - (b.rank || 999));

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 },
    };

    if (sortedApplications.length === 0) {
        return (
            <div className="empty-rankings">
                <div className="empty-rankings-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                    </svg>
                </div>
                <h3 className="empty-rankings-title">No Ranked Candidates</h3>
                <p className="empty-rankings-text">
                    {selectedCourse ? `No candidates have been ranked for ${selectedCourse} yet.` : "No candidates have been ranked yet."}
                </p>
                <p className="empty-rankings-help">To rank candidates, select an applicant and click &quot;Add to Ranking&quot;</p>
            </div>
        );
    }

    return (
        <motion.div className="rankings-list-container" variants={containerVariants} initial="hidden" animate="show">
            <AnimatePresence>
                {sortedApplications.map((app, index) => (
                    <motion.div
                        key={app.id}
                        className="ranked-item"
                        variants={itemVariants}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}>
                        <div className="rank-badge">
                            <span>{index + 1}</span>
                        </div>
                        <div className="ranked-info">
                            <div className="ranked-name">{app.fullName}</div>
                            <div className="ranked-courses">
                                {app.courses
                                    .filter((c) => (selectedCourse ? c === selectedCourse : true))
                                    .map((c) => c)
                                    .join(", ")}
                            </div>
                            <div className="ranked-skills">
                                {app.skills.slice(0, 2).map((skill, idx) => (
                                    <span key={idx} className="ranked-skill">
                                        {skill}
                                    </span>
                                ))}
                                {app.skills.length > 2 && <span className="more-skills">+{app.skills.length - 2}</span>}
                            </div>
                        </div>
                        <div className="ranked-actions">
                            {index > 0 && (
                                <button onClick={() => onMoveUp(app)} className="rank-btn move-up-btn" title="Move up">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}

                            {index < sortedApplications.length - 1 && (
                                <button onClick={() => onMoveDown(app)} className="rank-btn move-down-btn" title="Move down">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}

                            <button onClick={() => onRemove(app.id)} className="rank-btn remove-btn" title="Remove from ranking">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default RankedCandidates;
