"use client";
// import { useRouter } from "next/router"; // To be refactored
import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation"; // Import redirect
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import {
  getApplicationsFromStorage as getApplications,
  saveApplicationToStorage as saveApplication,
  initializeDetailedApplicationsInStorage, // Updated import
} from "@/modules/tutor/utils/applicationDisplay.utils"; // Updated
import {
  availableCourses,
  // getCoursesWithDetails, // Removed as unused
} from "@/modules/course/utils/courseDisplay.utils"; // Updated & added
// import Head from "next/head"; // Head component is handled by App Router layout
import ApplicantList from "@/modules/lecturer/components/applicant-list/applicant-list";
import ApplicantDetails from "@/modules/lecturer/components/applicant-details/applicant-details";
import RankedCandidates from "@/modules/lecturer/components/ranked-candidates/ranked-candidates";
import ApplicantStatsVisualization from "@/modules/lecturer/components/applicant-stats-visualization/applicant-stats-visualization";
import Toast from "@/shared/components/common/toast/toast"; // Updated path to shared Toast
import { motion } from "framer-motion";
import stylesLecturer from "../styles/lecturer-dashboard-layout.module.css"; // Import CSS module

// TODO: Refactor localStorage logic to use services/API calls
// TODO: Refactor navigation (router.push) to use Next.js 13+ App Router navigation (e.g. redirect, Link, or navigation hooks)
// TODO: Further break down this page into smaller components if needed
// TODO: Update styles to use lecturer-dashboard-layout.module.css

export default function LecturerDashboardPage() {
  // const router = useRouter(); // To be refactored
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedApplication, setSelectedApplication] =
    useState<TutorApplication | null>(null);
  const [comment, setComment] = useState<string>("");
  const [rankedApplications, setRankedApplications] = useState<
    TutorApplication[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("none");
  const [activeTab, setActiveTab] = useState<
    "applications" | "rankings" | "stats"
  >("applications");
  const [lecturerName, setLecturerName] = useState<string>("");
  const [currentLecturerId, setCurrentLecturerId] = useState<string>("");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser");
      if (!user) {
        redirect("/signin");
        return;
      }
      const userData = JSON.parse(user);
      if (userData.role !== "lecturer") {
        redirect("/signin");
        return;
      }
      setLecturerName(userData.fullName || "Lecturer");
      initializeDetailedApplicationsInStorage(); // Use new function
      loadApplications();
      setCurrentLecturerId(userData.id);
    }
  }, []);

  useEffect(() => {
    loadApplications();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "applications") {
        loadApplications();
      }
    };
    const handleApplicationUpdate = () => {
      loadApplications();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("applicationUpdated", handleApplicationUpdate);
    const intervalId = setInterval(loadApplications, 5000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("applicationUpdated", handleApplicationUpdate);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (
      activeTab === "rankings" &&
      !selectedCourse &&
      availableCourses.length > 0
    ) {
      setSelectedCourse(availableCourses[0].code);
    }
  }, [activeTab, selectedCourse]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const loadApplications = () => {
    const appData = getApplications();
    setApplications(appData);
    const ranked = appData.filter((app) => app.rank !== undefined);
    setRankedApplications(
      ranked.sort((a, b) => (a.rank || 999) - (b.rank || 999))
    );
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedCourse && !app.courses.includes(selectedCourse)) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const courseMatches = app.courses.some((course) => {
        const courseInfo = availableCourses.find(
          (c: { code: string; name: string }) => c.code === course
        );
        return (
          courseInfo &&
          (courseInfo.code.toLowerCase().includes(query) ||
            courseInfo.name.toLowerCase().includes(query))
        );
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

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === "none") return 0;
    if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
    if (sortBy === "availability")
      return a.availability.localeCompare(b.availability);
    if (sortBy === "date") {
      return (
        new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
      );
    }
    return 0;
  });

  const handleSelectApplication = (application: TutorApplication) => {
    setSelectedApplication(application);
    setComment(application.comment || "");
  };

  const handleSaveComment = () => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        comment: comment,
      };
      saveApplication(updatedApplication);
      loadApplications(); // Refresh applications list after saving
      setSelectedApplication(updatedApplication);
      showToast("Comment saved!", "success");
    }
  };

  const handleDeleteComment = () => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        comment: "",
      };
      saveApplication(updatedApplication);
      loadApplications(); // Refresh applications list after deleting
      setSelectedApplication(updatedApplication);
      setComment("");
      showToast("Comment deleted!", "success");
    }
  };

  const handleSelectApplicantButton = (selectedCourses: string[]) => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        selected: true,
        selectedBy: currentLecturerId,
        selectedDate: new Date().toISOString().split("T")[0],
        selectedForCourses: selectedCourses,
      };
      saveApplication(updatedApplication);
      loadApplications(); // Refresh applications list
      setSelectedApplication(updatedApplication);
      showToast("Applicant selected successfully!", "success");
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
        rank: undefined,
      };
      saveApplication(updatedApplication);
      loadApplications(); // Refresh applications list
      setSelectedApplication(updatedApplication);
      showToast("Applicant unselected successfully!", "success");
    }
  };

  const handleAddToRanking = () => {
    if (!selectedApplication) return;
    if (!selectedApplication.comment) {
      showToast(
        "Please add and save a comment before adding to ranking.",
        "error"
      );
      return;
    }
    const hasUnsavedComment = comment !== (selectedApplication.comment || "");
    if (hasUnsavedComment) {
      showToast("Please save your comment before adding to ranking.", "error");
      return;
    }
    const nextRank = rankedApplications.length + 1;
    const updatedApplication = { ...selectedApplication, rank: nextRank };
    saveApplication(updatedApplication);
    setSelectedApplication(updatedApplication);
    loadApplications();
    showToast("Applicant added to ranking successfully!");
  };

  const handleMoveUp = (application: TutorApplication) => {
    const currentRank = application.rank;
    if (!currentRank) return;
    const prevRankApp = rankedApplications.find(
      (app) => app.rank === currentRank - 1
    );
    if (prevRankApp && prevRankApp.rank) {
      const updatedApp = { ...application, rank: currentRank - 1 };
      const updatedPrevApp = { ...prevRankApp, rank: prevRankApp.rank + 1 };
      saveApplication(updatedApp);
      saveApplication(updatedPrevApp);
      loadApplications();
      showToast(`Moved ${application.fullName} up in rankings`);
    }
  };

  const handleMoveDown = (application: TutorApplication) => {
    const currentRank = application.rank;
    if (!currentRank) return;
    const nextRankApp = rankedApplications.find(
      (app) => app.rank === currentRank + 1
    );
    if (nextRankApp && nextRankApp.rank) {
      const updatedApp = { ...application, rank: currentRank + 1 };
      const updatedNextApp = { ...nextRankApp, rank: nextRankApp.rank - 1 };
      saveApplication(updatedApp);
      saveApplication(updatedNextApp);
      loadApplications();
      showToast(`Moved ${application.fullName} down in rankings`);
    }
  };

  const handleRemoveFromRanking = (applicationId: string) => {
    const application = applications.find((app) => app.id === applicationId);
    if (!application) return;
    const updatedApplication = { ...application, rank: undefined };
    saveApplication(updatedApplication);
    loadApplications();
    showToast(`Removed ${application.fullName} from rankings`, "info");
  };

  const totalApplications = applications.length;
  const selectedTutorApplications = applications.filter(
    (app) => app.selected
  ).length;
  const pendingTutorApplications =
    totalApplications - selectedTutorApplications;
  const selectionRate =
    totalApplications > 0
      ? Math.round((selectedTutorApplications / totalApplications) * 100)
      : 0;

  return (
    <>
      {/* <Head> // Removed Head
        <title>TeachTeam - Lecturer Portal</title>
      </Head> */}
      <main
        className={`flex-grow pt-24 ${stylesLecturer.lecturerDashboardContainer}`}
      >
        {/* Existing JSX structure, class names will be updated with CSS modules later */}
        <div>
          {" "}
          {/* Removed lecturer-dashboard, container handles padding */}
          <motion.div
            className={stylesLecturer.dashboardHeader}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={stylesLecturer.headerContent}>
              {" "}
              <h1 className={stylesLecturer.dashboardTitle}>
                Lecturer Dashboard
              </h1>{" "}
              <p className={stylesLecturer.dashboardSubtitle}>
                Welcome back, {lecturerName}
              </p>{" "}
            </div>
            <div className={stylesLecturer.quickStats}>
              {" "}
              <div className={stylesLecturer.statCard}>
                {" "}
                <div
                  className={`${stylesLecturer.summaryIcon} ${stylesLecturer.totalIcon}`}
                >
                  {" "}
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className={stylesLecturer.statDetails}>
                  {" "}
                  <span className={stylesLecturer.statLabel}>
                    Total Applications
                  </span>{" "}
                  <span className={stylesLecturer.statValue}>
                    {totalApplications}
                  </span>{" "}
                </div>
              </div>
              <div className={stylesLecturer.statCard}>
                {" "}
                <div
                  className={`${stylesLecturer.summaryIcon} ${stylesLecturer.selectedIcon}`}
                >
                  {" "}
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
                <div className={stylesLecturer.statDetails}>
                  {" "}
                  <span className={stylesLecturer.statLabel}>Selected</span>
                  <span className={stylesLecturer.statValue}>
                    {selectedTutorApplications}
                  </span>
                </div>
              </div>
              <div className={stylesLecturer.statCard}>
                {" "}
                <div
                  className={`${stylesLecturer.summaryIcon} ${stylesLecturer.pendingIcon}`}
                >
                  {" "}
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className={stylesLecturer.statDetails}>
                  {" "}
                  <span className={stylesLecturer.statLabel}>Pending</span>
                  <span className={stylesLecturer.statValue}>
                    {pendingTutorApplications}
                  </span>{" "}
                </div>
              </div>
              <div className={stylesLecturer.statCard}>
                {" "}
                <div
                  className={`${stylesLecturer.summaryIcon} ${stylesLecturer.rateIcon}`}
                >
                  {" "}
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
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className={stylesLecturer.statDetails}>
                  {" "}
                  <span className={stylesLecturer.statLabel}>
                    Selection Rate
                  </span>{" "}
                  <span className={stylesLecturer.statValue}>
                    {selectionRate}%
                  </span>{" "}
                </div>
              </div>
            </div>
          </motion.div>
          <div className={stylesLecturer.dashboardTabs}>
            {" "}
            <button
              className={`${stylesLecturer.tabButton} ${activeTab === "applications" ? stylesLecturer.tabButtonActive : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={stylesLecturer.tabIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Applications
            </button>
            <button
              className={`${stylesLecturer.tabButton} ${activeTab === "rankings" ? stylesLecturer.tabButtonActive : ""}`}
              onClick={() => setActiveTab("rankings")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={stylesLecturer.tabIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Rankings
            </button>
            <button
              className={`${stylesLecturer.tabButton} ${activeTab === "stats" ? stylesLecturer.tabButtonActive : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={stylesLecturer.tabIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
          <div className={stylesLecturer.dashboardContent}>
            {" "}
            {activeTab === "applications" && (
              <motion.div
                className={stylesLecturer.applicationsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={stylesLecturer.filterTools}>
                  {" "}
                  <div className={stylesLecturer.filterGroup}>
                    {" "}
                    <label htmlFor="searchInput">Search:</label>
                    <div className={stylesLecturer.searchInputContainer}>
                      {" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={stylesLecturer.searchIcon}
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
                        id="searchInput"
                        type="text"
                        placeholder="Search by name, course, availability, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={stylesLecturer.searchInput}
                      />
                      {searchQuery && (
                        <button
                          className={stylesLecturer.searchClear}
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
                  </div>
                  <div className={stylesLecturer.filterSelects}>
                    {" "}
                    <div className={stylesLecturer.filterGroup}>
                      {" "}
                      <label htmlFor="courseFilter">Course:</label>
                      <select
                        id="courseFilter"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className={stylesLecturer.filterSelect}
                      >
                        <option value="">All Courses</option>
                        {availableCourses.map(
                          (course: { code: string; name: string }) => (
                            <option key={course.code} value={course.code}>
                              {course.code} - {course.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className={stylesLecturer.filterGroup}>
                      {" "}
                      <label htmlFor="sortBy">Sort by:</label>
                      <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={stylesLecturer.filterSelect}
                      >
                        <option value="none">Default</option>
                        <option value="name">Name</option>
                        <option value="availability">Availability</option>
                        <option value="date">Date Applied</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={stylesLecturer.applicationPanels}>
                  {" "}
                  <div className={stylesLecturer.applicantListPanel}>
                    {" "}
                    <h2 className={stylesLecturer.panelTitle}>
                      Applicants
                    </h2>{" "}
                    <ApplicantList
                      applications={sortedApplications}
                      selectedApplication={selectedApplication}
                      onSelectApplication={handleSelectApplication}
                    />
                  </div>
                  <div className={stylesLecturer.applicantDetailsPanel}>
                    {" "}
                    <h2 className={stylesLecturer.panelTitle}>
                      Applicant Details
                    </h2>{" "}
                    <ApplicantDetails
                      application={selectedApplication}
                      comment={comment}
                      setComment={setComment}
                      onSelectApplicant={handleSelectApplicantButton}
                      onSaveComment={handleSaveComment}
                      onDeleteComment={handleDeleteComment}
                      onUnselectApplicant={handleUnselectApplicant}
                      onAddToRanking={handleAddToRanking}
                      showToast={showToast}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === "rankings" && (
              <motion.div
                className={stylesLecturer.rankingsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={stylesLecturer.rankingsContainer}>
                  {" "}
                  <h2 className={stylesLecturer.rankingsTitle}>
                    Ranked Candidates
                  </h2>{" "}
                  <div
                    className={`${stylesLecturer.filterGroup} ${stylesLecturer.courseFilter}`}
                  >
                    {" "}
                    <label htmlFor="rankingCourseFilter">
                      Filter by Course:
                    </label>
                    <select
                      id="rankingCourseFilter"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className={stylesLecturer.filterSelect}
                    >
                      {availableCourses.map(
                        (course: { code: string; name: string }) => (
                          <option key={course.code} value={course.code}>
                            {course.code} - {course.name}
                          </option>
                        )
                      )}
                    </select>
                    <p className={stylesLecturer.filterNote}>
                      {" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={stylesLecturer.noteIcon}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Rankings are course-specific to avoid confusion with
                      candidates who may have the same rank for different
                      courses.
                    </p>
                  </div>
                  <div className={stylesLecturer.rankingsList}>
                    {" "}
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
            {activeTab === "stats" && (
              <motion.div
                className={stylesLecturer.analyticsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={stylesLecturer.analyticsContainer}>
                  {" "}
                  <h2 className={stylesLecturer.analyticsTitle}>
                    Application Analytics
                  </h2>{" "}
                  <div className={stylesLecturer.analyticsContent}>
                    {" "}
                    <ApplicantStatsVisualization applications={applications} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
