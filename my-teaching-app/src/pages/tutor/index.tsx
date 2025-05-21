import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Layout from "../../components/layout/Layout";
import {
    CourseWithDetails,
    getCoursesWithDetails,
} from "../../utils/coursesUtils";
import { TutorApplication, saveApplication } from "../../utils/tutorUtils";
import CourseCard from "../../components/tutor/CourseCard";
import ApplyModal from "../../components/tutor/ApplyModal";
import { motion } from "framer-motion";

interface UserData {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

const TutorPage: React.FC = () => {
    const [courses, setCourses] = useState<CourseWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] =
        useState<CourseWithDetails | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [userData, setUserData] = useState<UserData | null>(null);
    const [existingApplications, setExistingApplications] = useState<string[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<
        "all" | "applied" | "available"
    >("all");
    const router = useRouter();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
            },
        },
    };

    // Get current user from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const userJson = localStorage.getItem("currentUser");
            if (userJson) {
                try {
                    const user = JSON.parse(userJson);
                    setUserData({
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                    });

                    // Get user's existing applications
                    const applications = localStorage.getItem("applications");
                    if (applications) {
                        const parsed = JSON.parse(applications);
                        const userApplications = parsed
                            .filter(
                                (app: TutorApplication) =>
                                    app.userId === user.id
                            )
                            .map((app: TutorApplication) => app.courses)
                            .flat();

                        setExistingApplications(userApplications);
                    }
                } catch (error) {
                    console.error("Error parsing user data:", error);
                }
            } else {
                // User not logged in, redirect to sign in
                router.push("/signin");
            }
            setIsLoading(false);
        }
    }, [router]);

    // Initialize courses
    useEffect(() => {
        const fetchedCourses = getCoursesWithDetails();
        setCourses(fetchedCourses);
    }, []);

    // Filter courses
    const filteredCourses = React.useMemo(() => {
        return courses.filter((course) => {
            // Apply search filter
            const matchesSearch =
                course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.availability
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            // Apply application status filter
            const isApplied = existingApplications.includes(course.code);
            let matchesApplicationFilter = true;

            if (activeFilter === "applied") {
                matchesApplicationFilter = isApplied;
            } else if (activeFilter === "available") {
                matchesApplicationFilter = !isApplied;
            }

            return matchesSearch && matchesApplicationFilter;
        });
    }, [courses, searchQuery, activeFilter, existingApplications]);

    const openApplyModal = (course: CourseWithDetails) => {
        // Check if user is logged in
        if (!userData) {
            setErrorMessage("You must be logged in to apply for courses.");
            return;
        }

        // Check if user has already applied for this course
        if (existingApplications.includes(course.code)) {
            setErrorMessage(`You have already applied for ${course.code}.`);
            return;
        }

        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const closeApplyModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleSubmitApplication = (applicationData: TutorApplication) => {
        if (!userData) {
            setErrorMessage("You must be logged in to apply for courses.");
            return;
        }

        // Add user information
        applicationData.email = userData.email;
        applicationData.fullName = userData.fullName;

        // Save application
        try {
            saveApplication(applicationData);

            // Update existing applications list
            setExistingApplications([
                ...existingApplications,
                applicationData.courses[0],
            ]);

            // Show success message
            setIsModalOpen(false);
            setSuccessMessage(
                "Your application has been submitted successfully!"
            );

            // Clear the success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 5000);
        } catch (error) {
            setErrorMessage(
                "Failed to submit your application. Please try again."
            );
            console.error(error);
        }
    };

    // Card count by row for animation
    const getRowStartDelay = (index: number) => {
        const itemsPerRow =
            window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        return Math.floor(index / itemsPerRow) * 0.1;
    };

    return (
        <Layout>
            <Head>
                <title>TeachTeam - Tutor Portal</title>
            </Head>

            {/* Hero Section */}
            <motion.div
                className="tutor-hero-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="tutor-hero-content">
                    <motion.h1
                        className="tutor-hero-title"
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Find Your Perfect{" "}
                        <span className="hero-highlight">Teaching</span>{" "}
                        Opportunity
                    </motion.h1>
                    <motion.p
                        className="tutor-hero-subtitle"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        Browse available courses and apply for tutor or
                        lab-assistant positions with the School of Computer
                        Science
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        className="tutor-stats"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                    >
                        <div className="stat-item">
                            <div className="stat-value">{courses.length}</div>
                            <div className="stat-label">Available Courses</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {existingApplications.length}
                            </div>
                            <div className="stat-label">Your Applications</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {courses.length - existingApplications.length}
                            </div>
                            <div className="stat-label">Opportunities</div>
                        </div>
                    </motion.div>
                </div>

                <div className="hero-decoration">
                    <div className="circle-decoration circle-1"></div>
                    <div className="circle-decoration circle-2"></div>
                    <div className="circle-decoration circle-3"></div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="tutor-container">
                {/* Success/Error Messages */}
                {successMessage && (
                    <motion.div
                        className="message success-message"
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            left: "20px",
                            display: "flex",
                            alignItems: "center",
                            minWidth: "320px",
                            maxWidth: "600px",
                            width: "auto",
                            padding: "1rem",
                            borderRadius: "0.75rem",
                            boxShadow: "0 4px 10px #00000020",
                            zIndex: 9999,
                            backgroundColor: "#ecfdf5",
                            border: "1px solid #10b981",
                        }}
                    >
                        <div
                            className="message-icon success"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                marginRight: "1rem",
                                flexShrink: 0,
                                backgroundColor: "#d1fae5",
                                color: "#10b981",
                            }}
                        >
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div
                            className="message-content"
                            style={{
                                flex: 1,
                                color: "#111827",
                                marginRight: "1rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            <p>{successMessage}</p>
                        </div>
                        <button
                            className="message-close"
                            onClick={() => setSuccessMessage("")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#6b7280",
                                cursor: "pointer",
                                padding: "0.5rem",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: "1rem",
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </motion.div>
                )}

                {errorMessage && (
                    <motion.div
                        className="message error-message"
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            left: "20px",
                            display: "flex",
                            alignItems: "center",
                            minWidth: "320px",
                            maxWidth: "600px",
                            width: "auto",
                            padding: "1rem",
                            borderRadius: "0.75rem",
                            boxShadow: "0 4px 10px #00000020",
                            zIndex: 9999,
                            backgroundColor: "#fef2f2",
                            border: "1px solid #ef4444",
                        }}
                    >
                        <div
                            className="message-icon error"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                marginRight: "1rem",
                                flexShrink: 0,
                                backgroundColor: "#fee2e2",
                                color: "#ef4444",
                            }}
                        >
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
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div
                            className="message-content"
                            style={{
                                flex: 1,
                                color: "#111827",
                                marginRight: "1rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            <p>{errorMessage}</p>
                        </div>
                        <button
                            className="message-close"
                            onClick={() => setErrorMessage("")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#6b7280",
                                cursor: "pointer",
                                padding: "0.5rem",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: "1rem",
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </motion.div>
                )}

                {/* Search and Filters */}
                <motion.div
                    className="search-filters-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {/* Search Bar */}
                    <div className="search-bar">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="search-icon"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search courses, skills, or roles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                className="search-clear"
                                onClick={() => setSearchQuery("")}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter Pills */}
                    <div className="filter-pills">
                        <button
                            className={`filter-pill ${
                                activeFilter === "all" ? "active" : ""
                            }`}
                            onClick={() => setActiveFilter("all")}
                        >
                            All Courses
                        </button>
                        <button
                            className={`filter-pill ${
                                activeFilter === "available" ? "active" : ""
                            }`}
                            onClick={() => setActiveFilter("available")}
                        >
                            Available
                        </button>
                        <button
                            className={`filter-pill ${
                                activeFilter === "applied" ? "active" : ""
                            }`}
                            onClick={() => setActiveFilter("applied")}
                        >
                            Applied
                        </button>
                    </div>
                </motion.div>

                {/* Course Cards */}
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading courses...</p>
                    </div>
                ) : filteredCourses.length > 0 ? (
                    <motion.div
                        className="courses-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.code}
                                className="course-card-wrapper"
                                variants={itemVariants}
                                transition={{ delay: getRowStartDelay(index) }}
                            >
                                <CourseCard
                                    course={course}
                                    openApplyModal={openApplyModal}
                                    hasApplied={existingApplications.includes(
                                        course.code
                                    )}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="no-courses">
                        <Image
                            src="/empty-box.svg"
                            alt="No courses found"
                            width={150}
                            height={150}
                        />
                        <h3>No courses found</h3>
                        <p>
                            {searchQuery
                                ? "Try adjusting your search or filters"
                                : activeFilter === "applied"
                                ? "You haven't applied to any courses yet"
                                : "No available courses at the moment"}
                        </p>
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            <ApplyModal
                isOpen={isModalOpen}
                course={selectedCourse}
                onClose={closeApplyModal}
                onSubmit={handleSubmitApplication}
                currentUserId={userData?.id || ""}
            />
        </Layout>
    );
};

export default TutorPage;
