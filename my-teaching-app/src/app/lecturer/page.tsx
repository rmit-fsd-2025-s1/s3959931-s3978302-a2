"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { availableCourses } from "@/shared/data/courses";
import ApplicantList from "@/modules/lecturer/components/applicant-list/applicant-list";
import ApplicantDetails from "@/modules/lecturer/components/applicant-details/applicant-details";
import RankedCandidates from "@/modules/lecturer/components/ranked-candidates/ranked-candidates";
import ApplicantStatsVisualization from "@/modules/lecturer/components/applicant-stats-visualization/applicant-stats-visualization";
import Toast from "@/shared/components/common/toast/toast";
import SearchInput from "@/shared/components/common/search-input/SearchInput";
import { useLecturerAuth } from "@/modules/lecturer/hooks/useLecturerAuth";
import { useApplicationManagement } from "@/modules/lecturer/hooks/useApplicationManagement";
import { useApplicationActions } from "@/modules/lecturer/hooks/useApplicationActions";
import DashboardHeader from "@/modules/lecturer/components/dashboard-header/DashboardHeader";
import DashboardTabs from "@/modules/lecturer/components/dashboard-tabs/DashboardTabs";
import styles from "./LecturerPage.module.css";
import filterStyles from "@/modules/lecturer/components/application-filters/ApplicationFilters.module.css";

type TabType = "applications" | "rankings" | "stats";

const LecturerDashboardPage: React.FC = () => {
  // Authentication
  const { lecturerName, currentLecturerId } = useLecturerAuth();

  // Application management
  const {
    applications,
    selectedCourse,
    setSelectedCourse,
    selectedApplication,
    setSelectedApplication,
    comment,
    setComment,
    rankedApplications,
    setRankedApplications,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortedApplications,
    loadApplications,
    handleSelectApplication,
    statistics,
    saveApplication,
  } = useApplicationManagement();

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("applications");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Toast function
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Application actions
  const {
    handleSaveComment,
    handleDeleteComment,
    handleSelectApplicantButton,
    handleUnselectApplicant,
    handleAddToRanking,
    handleMoveUp,
    handleMoveDown,
    handleRemoveFromRanking,
  } = useApplicationActions({
    selectedApplication,
    comment,
    setComment,
    currentLecturerId,
    loadApplications,
    showToast,
    saveApplication,
    setSelectedApplication,
    rankedApplications,
    setRankedApplications,
  });

  useEffect(() => {
    if (
      activeTab === "rankings" &&
      !selectedCourse &&
      availableCourses.length > 0
    ) {
      setSelectedCourse(availableCourses[0].code);
    }
  }, [activeTab, selectedCourse, setSelectedCourse]);

  return (
    <>
      <main className={`flex-grow pt-24 ${styles.lecturerDashboardContainer}`}>
        <div>
          <DashboardHeader
            lecturerName={lecturerName}
            statistics={statistics}
          />

          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className={styles.dashboardContent}>
            {activeTab === "applications" && (
              <motion.div
                className={styles.applicationsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={filterStyles.filterTools}>
                  <div className={filterStyles.filterGroup}>
                    <SearchInput
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search by name, course, availability, or skills..."
                      label="Search"
                      showLabel={true}
                      variant="default"
                    />
                  </div>
                  <div className={filterStyles.filterSelects}>
                    <div className={filterStyles.filterGroup}>
                      <label htmlFor="courseFilter">Course:</label>
                      <select
                        id="courseFilter"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className={filterStyles.filterSelect}
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
                    <div className={filterStyles.filterGroup}>
                      <label htmlFor="sortBy">Sort by:</label>
                      <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={filterStyles.filterSelect}
                      >
                        <option value="none">Default</option>
                        <option value="name">Name</option>
                        <option value="availability">Availability</option>
                        <option value="date">Date Applied</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.applicationPanels}>
                  <ApplicantList
                    applications={sortedApplications}
                    selectedApplication={selectedApplication}
                    onSelectApplication={handleSelectApplication}
                  />
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
              </motion.div>
            )}
            {activeTab === "rankings" && (
              <motion.div
                className={styles.rankingsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <RankedCandidates
                  rankedApplications={rankedApplications}
                  selectedCourse={selectedCourse}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onRemove={handleRemoveFromRanking}
                  showCourseFilter={true}
                  onCourseChange={setSelectedCourse}
                  availableCourses={availableCourses}
                />
              </motion.div>
            )}
            {activeTab === "stats" && (
              <motion.div
                className={styles.analyticsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ApplicantStatsVisualization applications={applications} />
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
};

export default LecturerDashboardPage;
