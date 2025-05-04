// src/pages/lecturer/index.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import { TutorApplication, getApplications, saveApplication, initializeDetailedApplications } from "../../utils/tutorUtils";
import { availableCourses } from "../../utils/coursesUtils";
import Head from "next/head";
import ApplicantList from "../../components/lecturer/ApplicantList";
import ApplicantDetails from "../../components/lecturer/ApplicantDetails";
import RankedCandidates from "../../components/lecturer/RankedCandidates";
import ApplicantStatsVisualization from "../../components/lecturer/ApplicantStatsVisualization";
import Toast from "../../components/Toast";
import { motion } from "framer-motion";

export default function LecturerPage() {
    // Existing state and hooks
    const router = useRouter();
    const [applications, setApplications] = useState<TutorApplication[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
    const [comment, setComment] = useState<string>("");
    const [rankedApplications, setRankedApplications] = useState<TutorApplication[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("none");
    const [activeTab, setActiveTab] = useState<"applications" | "rankings" | "stats">("applications");
    const [lecturerName, setLecturerName] = useState<string>("");
    const [currentLecturerId, setCurrentLecturerId] = useState<string>("");

    // Toast notification state
    const [toast, setToast] = useState({
        visible: false,
        message: "",
        type: "success" as "success" | "error" | "info",
    });

    // Check if user is logged in and has lecturer role
    useEffect(() => {
        if (typeof window !== "undefined") {
            const user = localStorage.getItem("currentUser");

            if (!user) {
                router.push("/signin");
                return;
            }

            const userData = JSON.parse(user);

            if (userData.role !== "lecturer") {
                router.push("/signin");
                return;
            }

            setLecturerName(userData.fullName || "Lecturer");

            // Initialize applications
            initializeDetailedApplications();

            // Load applications
            loadApplications();

            // Get current lecturer ID
            setCurrentLecturerId(userData.id);
        }
    }, [router]);

    // Load applications and listen for updates
    useEffect(() => {
        loadApplications();

        // Listen for storage events (when another tab makes changes)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "applications") {
                loadApplications();
            }
        };

        // Listen for custom application updated events
        const handleApplicationUpdate = () => {
            loadApplications();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("applicationUpdated", handleApplicationUpdate);

        // Check for updates periodically (every 5 seconds)
        const intervalId = setInterval(loadApplications, 5000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("applicationUpdated", handleApplicationUpdate);
            clearInterval(intervalId);
        };
    }, []);

    // Show toast notification
    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        setToast({
            visible: true,
            message,
            type,
        });

        // Auto hide after 3 seconds
        setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Existing functions for loading applications, filtering, sorting, etc.
    const loadApplications = () => {
        const appData = getApplications();
        setApplications(appData);

        // Get previously ranked applications
        const ranked = appData.filter((app) => app.rank !== undefined);
        // Sort by rank to ensure proper display
        setRankedApplications(ranked.sort((a, b) => (a.rank || 999) - (b.rank || 999)));
    };

    // Filter applications by course and search query
    const filteredApplications = applications.filter((app) => {
        // First, filter by selected course if any
        if (selectedCourse && !app.courses.includes(selectedCourse)) {
            return false;
        }

        // Then filter by search query if any
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const courseMatches = app.courses.some((course) => {
                const courseInfo = availableCourses.find((c) => c.code === course);
                return courseInfo && (courseInfo.code.toLowerCase().includes(query) || courseInfo.name.toLowerCase().includes(query));
            });

            return (
                app.fullName.toLowerCase().includes(query) ||
                courseMatches ||
                app.availability.toLowerCase().includes(query) ||
                app.skills.some((skill) => skill.toLowerCase().includes(query))
            );
        }

        return true;
    });

    // Sort filtered applications
    const sortedApplications = [...filteredApplications].sort((a, b) => {
        if (sortBy === "none") return 0;
        if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
        if (sortBy === "availability") return a.availability.localeCompare(b.availability);
        if (sortBy === "date") {
            return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
        }
        return 0;
    });

    const handleSelectApplication = (application: TutorApplication) => {
        setSelectedApplication(application);
        setComment(application.comment || "");
    };

    const handleSaveComment = (selectedCourses: string[]) => {
        if (selectedApplication) {
            const updatedApplication = {
                ...selectedApplication,
                selected: true,
                selectedBy: currentLecturerId,
                selectedDate: new Date().toISOString().split("T")[0],
                selectedForCourses: selectedCourses,
                comment: comment,
            };
            saveApplication(updatedApplication);
            setApplications(getApplications());
            setSelectedApplication(updatedApplication);
        }
    };

    const handleUnselectApplicant = () => {
        if (selectedApplication) {
            const updatedApplication = {
                ...selectedApplication,
                selected: false,
                selectedBy: undefined,
                selectedDate: undefined,
                selectedForCourses: undefined,
                comment: comment,
            };
            saveApplication(updatedApplication);
            setApplications(getApplications());
            setSelectedApplication(updatedApplication);
            showToast("Applicant unselected successfully!", "success");
        }
    };

    const handleAddToRanking = () => {
        if (!selectedApplication) return;

        // Determine the next rank number
        const nextRank = rankedApplications.length + 1;

        const updatedApplication = {
            ...selectedApplication,
            rank: nextRank,
        };

        saveApplication(updatedApplication);

        // Refresh applications
        loadApplications();

        // Show toast notification
        showToast("Applicant added to ranking successfully!");
    };

    const handleMoveUp = (application: TutorApplication) => {
        // Early return if rank is undefined
        const currentRank = application.rank;
        if (!currentRank) return;

        // Find the application that's currently at the position we want to move to
        const prevRankApp = rankedApplications.find((app) => app.rank === currentRank - 1);

        if (prevRankApp && prevRankApp.rank) {
            // Update ranks for both applications
            const updatedApp = { ...application, rank: currentRank - 1 };
            const updatedPrevApp = { ...prevRankApp, rank: prevRankApp.rank + 1 };

            // Save both updates
            saveApplication(updatedApp);
            saveApplication(updatedPrevApp);

            // Refresh applications to get the new order
            loadApplications();

            // Show toast notification
            showToast(`Moved ${application.fullName} up in rankings`);
        }
    };

    const handleMoveDown = (application: TutorApplication) => {
        // Early return if rank is undefined
        const currentRank = application.rank;
        if (!currentRank) return;

        // Find the application that's currently at the position we want to move to
        const nextRankApp = rankedApplications.find((app) => app.rank === currentRank + 1);

        if (nextRankApp && nextRankApp.rank) {
            // Update ranks for both applications
            const updatedApp = { ...application, rank: currentRank + 1 };
            const updatedNextApp = { ...nextRankApp, rank: nextRankApp.rank - 1 };

            // Save both updates
            saveApplication(updatedApp);
            saveApplication(updatedNextApp);

            // Refresh applications to get the new order
            loadApplications();

            // Show toast notification
            showToast(`Moved ${application.fullName} down in rankings`);
        }
    };

    const handleRemoveFromRanking = (applicationId: string) => {
        const application = applications.find((app) => app.id === applicationId);
        if (!application) return;

        const updatedApplication = {
            ...application,
            rank: undefined,
        };

        saveApplication(updatedApplication);

        // Refresh applications
        loadApplications();

        // Show toast notification
        showToast(`Removed ${application.fullName} from rankings`, "info");
    };

    // Dashboard stats
    const totalApplications = applications.length;
    const selectedApplications = applications.filter((app) => app.selected).length;
    const pendingApplications = totalApplications - selectedApplications;
    const selectionRate = totalApplications > 0 ? Math.round((selectedApplications / totalApplications) * 100) : 0;

    return (
        <>
            <Head>
                <title>TeachTeam - Lecturer Dashboard</title>
            </Head>
            <Layout>
                <div className="lecturer-dashboard">
                    {/* Dashboard Header */}
                    <motion.div
                        className="dashboard-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}>
                        <div className="header-content">
                            <h1 className="dashboard-title">Lecturer Dashboard</h1>
                            <p className="dashboard-subtitle">Welcome back, {lecturerName}</p>
                        </div>
                        <div className="quick-stats">
                            <div className="stat-card">
                                <div className="summary-icon total-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="stat-details">
                                    <span className="stat-value">{totalApplications}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="summary-icon selected-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="stat-details">
                                    <span className="stat-value">{selectedApplications}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="summary-icon pending-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="stat-details">
                                    <span className="stat-value">{pendingApplications}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="summary-icon rate-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div className="stat-details">
                                    <span className="stat-value">{selectionRate}%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Tab Navigation */}
                    <div className="dashboard-tabs">
                        <button className={`tab-button ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            Applications
                        </button>
                        <button className={`tab-button ${activeTab === "rankings" ? "active" : ""}`} onClick={() => setActiveTab("rankings")}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                            </svg>
                            Rankings
                        </button>
                        <button className={`tab-button ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Analytics
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="dashboard-content">
                        {/* Applications Tab */}
                        {activeTab === "applications" && (
                            <motion.div className="applications-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                <div className="filter-tools">
                                    <div className="search-bar">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="search-icon"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search by name, course, availability, or skills..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="search-input"
                                        />
                                        {searchQuery && (
                                            <button className="search-clear" onClick={() => setSearchQuery("")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="filter-selects">
                                        <div className="filter-group">
                                            <label htmlFor="courseFilter">Course:</label>
                                            <select
                                                id="courseFilter"
                                                value={selectedCourse}
                                                onChange={(e) => setSelectedCourse(e.target.value)}
                                                className="filter-select">
                                                <option value="">All Courses</option>
                                                {availableCourses.map((course) => (
                                                    <option key={course.code} value={course.code}>
                                                        {course.code} - {course.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="filter-group">
                                            <label htmlFor="sortBy">Sort by:</label>
                                            <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                                                <option value="none">Default</option>
                                                <option value="name">Name</option>
                                                <option value="availability">Availability</option>
                                                <option value="date">Date Applied</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="application-panels">
                                    <div className="applicant-list-panel">
                                        <h2 className="panel-title">Applicants</h2>
                                        <ApplicantList
                                            applications={sortedApplications}
                                            selectedApplication={selectedApplication}
                                            onSelectApplication={handleSelectApplication}
                                        />
                                    </div>
                                    <div className="applicant-details-panel">
                                        <h2 className="panel-title">Applicant Details</h2>
                                        <ApplicantDetails
                                            application={selectedApplication}
                                            comment={comment}
                                            setComment={setComment}
                                            onSaveComment={handleSaveComment}
                                            onUnselectApplicant={handleUnselectApplicant}
                                            onAddToRanking={handleAddToRanking}
                                            showToast={showToast}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Rankings Tab */}
                        {activeTab === "rankings" && (
                            <motion.div className="rankings-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                <div className="rankings-container">
                                    <h2 className="rankings-title">Ranked Candidates</h2>
                                    <div className="filter-group course-filter">
                                        <label htmlFor="rankingCourseFilter">Filter by Course:</label>
                                        <select
                                            id="rankingCourseFilter"
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            className="filter-select">
                                            <option value="">All Courses</option>
                                            {availableCourses.map((course) => (
                                                <option key={course.code} value={course.code}>
                                                    {course.code} - {course.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="rankings-list">
                                        <RankedCandidates
                                            rankedApplications={rankedApplications}
                                            selectedCourse={selectedCourse}
                                            onMoveUp={handleMoveUp}
                                            onMoveDown={handleMoveDown}
                                            onRemove={handleRemoveFromRanking}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === "stats" && (
                            <motion.div className="analytics-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                <div className="analytics-container">
                                    <h2 className="analytics-title">Application Analytics</h2>
                                    <div className="analytics-content">
                                        <ApplicantStatsVisualization applications={applications} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Toast notification */}
                <Toast
                    message={toast.message}
                    visible={toast.visible}
                    type={toast.type}
                    onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
                />
            </Layout>
        </>
    );
}
