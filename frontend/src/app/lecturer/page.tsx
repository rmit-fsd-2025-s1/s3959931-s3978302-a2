"use client";

import React, { useState, useEffect } from "react";
import { ApplicationService, ApplicationResponse } from "@/shared/services/applicationService";
import { Application } from "@/shared/types/application";
import ApplicantList from "@/modules/lecturer/components/applicant-list/applicant-list";
import ApplicantDetails from "@/modules/lecturer/components/applicant-details/applicant-details";
import RankedCandidates from "@/modules/lecturer/components/ranked-candidates/ranked-candidates";
import ApplicantStatsVisualization from "@/modules/lecturer/components/applicant-stats-visualization/applicant-stats-visualization";
import Toast from "@/shared/components/common/toast/toast";
import LoadingWrapper from "@/shared/components/common/loading-wrapper/LoadingWrapper";
import { useLecturerAuth } from "@/modules/lecturer/hooks/useLecturerAuth";
import { useApplicationManagement } from "@/modules/lecturer/hooks/useApplicationManagement";
import DashboardHeader from "@/modules/lecturer/components/dashboard-header/DashboardHeader";
import DashboardTabs from "@/modules/lecturer/components/dashboard-tabs/DashboardTabs";
import ApplicationFilters from "@/modules/lecturer/components/application-filters/ApplicationFilters";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { redirect } from "next/navigation";
import styles from "./LecturerPage.module.css";

type TabType = "applications" | "rankings" | "stats";

// Adapter function to convert ApplicationResponse to Application
const convertToLegacyApplication = (appResponse: ApplicationResponse): Application => {
  const availabilityValue = (appResponse.availability as { type: string })?.type || "Part Time";
  const availability: "Full Time" | "Part Time" = availabilityValue === "Full Time" ? "Full Time" : "Part Time";
  
  return {
    id: appResponse.id.toString(),
    userId: appResponse.candidateId.toString(),
    email: appResponse.candidate?.email || "",
    fullName: `${appResponse.candidate?.firstName || ""} ${appResponse.candidate?.lastName || ""}`.trim(),
    courses: [appResponse.course.courseCode],
    availability,
    skills: appResponse.skills ? appResponse.skills.split(",").map(s => s.trim()) : [],
    academicCredentials: appResponse.experience || "",
    dateApplied: appResponse.appliedAt,
    status: appResponse.status as "pending" | "shortlisted" | "rejected" | "hired",
    selected: appResponse.status === "selected",
    comment: "", // Comments would need to be implemented in backend
    rank: undefined,
  };
};

// Convert statistics to legacy format
const convertToLegacyStatistics = (stats: unknown) => {
  if (!stats || typeof stats !== 'object') {
    return {
      totalApplications: 0,
      selectedTutorApplications: 0,
      pendingTutorApplications: 0,
      selectionRate: 0,
    };
  }

  const typedStats = stats as {
    totalApplications?: number;
    applicationsByStatus?: { selected?: number; pending?: number };
  };

  return {
    totalApplications: typedStats.totalApplications || 0,
    selectedTutorApplications: typedStats.applicationsByStatus?.selected || 0,
    pendingTutorApplications: typedStats.applicationsByStatus?.pending || 0,
    selectionRate: typedStats.totalApplications && typedStats.totalApplications > 0 
      ? Math.round(((typedStats.applicationsByStatus?.selected || 0) / typedStats.totalApplications) * 100)
      : 0,
  };
};

const LecturerDashboardPage: React.FC = () => {
  // Authentication
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    lecturerName,
  } = useLecturerAuth();

  // Application management with enhanced filtering
  const {
    applications: rawApplications,
    statistics: rawStatistics,
    isInitialized,
    selectedApplication: rawSelectedApplication,
    comment,
    setComment,
    rankedApplications: rawRankedApplications,
    // CR Part: Enhanced filters
    selectedCourse,
    setSelectedCourse,
    selectedRankingCourse,
    setSelectedRankingCourse,
    searchQuery,
    setSearchQuery,
    roleTypeFilter,
    setRoleTypeFilter,
    availabilityFilter,
    setAvailabilityFilter,
    skillsFilter,
    setSkillsFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    loadApplications,
    handleSelectApplication: rawHandleSelectApplication,
  } = useApplicationManagement();

  // Convert to legacy format for existing components
  const applications = rawApplications.map(convertToLegacyApplication);
  const statistics = convertToLegacyStatistics(rawStatistics);
  const selectedApplication = rawSelectedApplication ? convertToLegacyApplication(rawSelectedApplication) : null;
  const rankedApplications = rawRankedApplications.map(convertToLegacyApplication);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("applications");
  const [courses, setCourses] = useState<Array<{code: string, name: string}>>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsFilterArray, setSkillsFilterArray] = useState<string[]>([]);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Authentication check
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      redirect("/signin");
      return;
    }

    if (user.userType !== "lecturer") {
      redirect(user.userType === "candidate" ? "/tutor" : "/");
      return;
    }
  }, [user, isAuthenticated, authLoading]);

  // Load available courses and extract skills
  useEffect(() => {
    const loadCourses = async () => {
      try {
        // First set mock courses to ensure UI works immediately
        const mockCourseList = [
          { code: "COSC2758", name: "Full Stack Development" },
          { code: "COSC2671", name: "Introduction to Web Programming" }
        ];
        setCourses(mockCourseList);
        console.log(`✅ Set ${mockCourseList.length} mock assigned courses for lecturer`);

        // Try to get real data from API
        const response = await ApplicationService.getAssignedCoursesForLecturer();
        if (response.success && response.data && response.data.length > 0) {
          const courseList = response.data.map(course => ({
            code: course.courseCode,
            name: course.courseName
          }));
          setCourses(courseList);
          console.log(`✅ Updated with ${courseList.length} real assigned courses for lecturer`);
        } else {
          console.log("📝 Using mock data - API returned no courses or failed");
          // Keep mock data if API fails or returns empty
          if (response.message && !response.success) {
            showToast("Using demonstration data. Contact administrator for course assignments.", "info");
          }
        }
      } catch (error) {
        console.error("Error loading assigned courses, using mock data:", error);
        // Mock data is already set above, so no need to do anything
        showToast("Using demonstration courses. Please check your connection.", "info");
      }
    };

    if (isInitialized) {
      loadCourses();
    }
  }, [isInitialized]);

  // Extract all unique skills from applications
  useEffect(() => {
    const allSkills = new Set<string>();
    rawApplications.forEach(app => {
      if (app.skills) {
        app.skills.split(',').forEach(skill => {
          const trimmedSkill = skill.trim();
          if (trimmedSkill) {
            allSkills.add(trimmedSkill);
          }
        });
      }
    });
    setAvailableSkills(Array.from(allSkills).sort());
  }, [rawApplications]);

  // Sync skillsFilterArray with the string skillsFilter from the hook
  useEffect(() => {
    if (skillsFilter) {
      setSkillsFilterArray(skillsFilter.split(',').map(s => s.trim()).filter(s => s));
    } else {
      setSkillsFilterArray([]);
    }
  }, [skillsFilter]);

  // Handle skills filter change - convert array to comma-separated string
  const handleSkillsFilterChange = (skills: string[]) => {
    setSkillsFilterArray(skills);
    setSkillsFilter(skills.join(', '));
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCourse && selectedCourse !== 'all') count++;
    if (roleTypeFilter && roleTypeFilter !== 'all') count++;
    if (availabilityFilter && availabilityFilter !== 'all') count++;
    if (statusFilter && statusFilter !== 'all') count++;
    if (skillsFilterArray.length > 0) count += skillsFilterArray.length;
    return count;
  };

  // Clear all filters function
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCourse('all');
    setRoleTypeFilter('all');
    setAvailabilityFilter('all');
    setStatusFilter('all');
    setSkillsFilter('');
    setSkillsFilterArray([]);
    setSortBy('none');
  };

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

  // Wrap the selection handler to convert back to ApplicationResponse
  const handleSelectApplication = (app: Application) => {
    const originalApp = rawApplications.find(rawApp => rawApp.id.toString() === app.id);
    if (originalApp) {
      rawHandleSelectApplication(originalApp);
    }
  };

  // Application actions (simplified - using new backend)
  const handleSaveComment = async () => {
    if (!rawSelectedApplication) return;
    
    try {
      const response = await ApplicationService.updateApplicationComment(
        rawSelectedApplication.id,
        comment
      );

      if (response.success) {
        showToast("Comment saved successfully", "success");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to save comment", "error");
      }
    } catch {
      showToast("Error saving comment", "error");
    }
  };

  const handleDeleteComment = async () => {
    if (!rawSelectedApplication) return;

    try {
      const response = await ApplicationService.deleteApplicationComment(
        rawSelectedApplication.id
      );

      if (response.success) {
        setComment("");
        showToast("Comment deleted", "info");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to delete comment", "error");
      }
    } catch {
      showToast("Error deleting comment", "error");
    }
  };

  const handleSelectApplicantButton = async (selectedCourses: string[]) => {
    if (!rawSelectedApplication) return;

    try {
      const response = await ApplicationService.updateApplicationStatus(
        rawSelectedApplication.id,
        "selected",
        comment,
        selectedCourses
      );

      if (response.success) {
        showToast("Applicant selected successfully", "success");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to select applicant", "error");
      }
    } catch {
      showToast("Error selecting applicant", "error");
    }
  };

  const handleUnselectApplicant = async () => {
    if (!rawSelectedApplication) return;

    try {
      const response = await ApplicationService.updateApplicationStatus(
        rawSelectedApplication.id,
        "pending"
      );

      if (response.success) {
        showToast("Applicant unselected", "info");
        await loadApplications();
      } else {
        showToast(response.message || "Failed to unselect applicant", "error");
      }
    } catch {
      showToast("Error unselecting applicant", "error");
    }
  };

  // Enhanced ranking functions with backend integration
  const handleAddToRanking = async () => {
    if (!selectedApplication) return;

    // Validation checks
    if (!selectedApplication.selected) {
      showToast("Please select the applicant before adding to ranking", "error");
      return;
    }

    if (selectedApplication.rank !== undefined) {
      showToast("Applicant is already added to ranking", "info");
      return;
    }

    if (!selectedApplication.comment || !comment.trim()) {
      showToast("Please add and save a comment before adding to ranking", "error");
      return;
    }

    const hasUnsavedComment = comment !== (selectedApplication.comment || "");
    if (hasUnsavedComment) {
      showToast("Please save your comment before adding to ranking", "error");
      return;
    }

    if (!selectedRankingCourse) {
      showToast("Please select a course for ranking", "error");
      return;
    }

    try {
      // Calculate next rank (add to end of list)
      const currentRankedForCourse = rankedApplications.filter(app => 
        app.selectedForCourses?.includes(selectedRankingCourse) || 
        app.courses.includes(selectedRankingCourse)
      );
      const nextRank = currentRankedForCourse.length + 1;

      const response = await ApplicationService.addApplicationToRanking(
        parseInt(selectedApplication.id),
        nextRank,
        selectedRankingCourse
      );

      if (response.success) {
        showToast("Added to ranking successfully", "success");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to add to ranking", "error");
      }
    } catch {
      showToast("Error adding to ranking", "error");
    }
  };

  const handleMoveUp = async (app: Application) => {
    if (!selectedRankingCourse) return;

    const filteredRanked = rankedApplications.filter(ranked => 
      ranked.selectedForCourses?.includes(selectedRankingCourse) || 
      ranked.courses.includes(selectedRankingCourse)
    );

    const currentIndex = filteredRanked.findIndex(ranked => ranked.id === app.id);
    if (currentIndex <= 0) return; // Already at top or not found

    const currentRank = currentIndex + 1;
    const newRank = currentRank - 1;

    try {
      // Update the rank of the current application
      const response = await ApplicationService.updateApplicationRanking(
        parseInt(app.id),
        newRank,
        selectedRankingCourse
      );

      if (response.success) {
        // Also update the application that was above (move it down)
        const appAbove = filteredRanked[currentIndex - 1];
        await ApplicationService.updateApplicationRanking(
          parseInt(appAbove.id),
          currentRank,
          selectedRankingCourse
        );

        showToast("Ranking updated successfully", "success");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to update ranking", "error");
      }
    } catch {
      showToast("Error updating ranking", "error");
    }
  };

  const handleMoveDown = async (app: Application) => {
    if (!selectedRankingCourse) return;

    const filteredRanked = rankedApplications.filter(ranked => 
      ranked.selectedForCourses?.includes(selectedRankingCourse) || 
      ranked.courses.includes(selectedRankingCourse)
    );

    const currentIndex = filteredRanked.findIndex(ranked => ranked.id === app.id);
    if (currentIndex >= filteredRanked.length - 1 || currentIndex < 0) return; // Already at bottom or not found

    const currentRank = currentIndex + 1;
    const newRank = currentRank + 1;

    try {
      // Update the rank of the current application
      const response = await ApplicationService.updateApplicationRanking(
        parseInt(app.id),
        newRank,
        selectedRankingCourse
      );

      if (response.success) {
        // Also update the application that was below (move it up)
        const appBelow = filteredRanked[currentIndex + 1];
        await ApplicationService.updateApplicationRanking(
          parseInt(appBelow.id),
          currentRank,
          selectedRankingCourse
        );

        showToast("Ranking updated successfully", "success");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to update ranking", "error");
      }
    } catch {
      showToast("Error updating ranking", "error");
    }
  };

  const handleRemoveFromRanking = async (id: string) => {
    try {
      const response = await ApplicationService.removeApplicationFromRanking(
        parseInt(id)
      );

      if (response.success) {
        showToast("Removed from ranking", "info");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to remove from ranking", "error");
      }
    } catch {
      showToast("Error removing from ranking", "error");
    }
  };

  useEffect(() => {
    // Initialize ranking course selection when switching to rankings tab
    if (
      activeTab === "rankings" &&
      !selectedRankingCourse &&
      courses.length > 0
    ) {
      setSelectedRankingCourse(courses[0].code);
    }
  }, [activeTab, selectedRankingCourse, setSelectedRankingCourse, courses]);

  // Show loading state during authentication or data initialization
  if (authLoading || !isInitialized) {
    return (
      <main className={`flex-grow pt-24 ${styles.lecturerDashboardContainer}`}>
        <LoadingWrapper
          isLoading={true}
          loadingMessage="Loading lecturer dashboard..."
          minHeight="60vh"
        >
          <div />
        </LoadingWrapper>
      </main>
    );
  }

  return (
    <LoadingWrapper isLoading={false}>
      <div className={styles.lecturerDashboard}>
        <div className="container">
          {/* Dashboard Header */}
          <DashboardHeader
            lecturerName={lecturerName}
            statistics={statistics}
          />

          {/* Enhanced Application Filters */}
          <ApplicationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            courses={courses}
            roleTypeFilter={roleTypeFilter}
            onRoleTypeChange={setRoleTypeFilter}
            availabilityFilter={availabilityFilter}
            onAvailabilityChange={setAvailabilityFilter}
            skillsFilter={skillsFilterArray}
            onSkillsFilterChange={handleSkillsFilterChange}
            availableSkills={availableSkills}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearAllFilters}
            activeFilterCount={getActiveFilterCount()}
          />

          {/* Dashboard Tabs */}
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Main Content */}
          <div className={styles.dashboardContent}>
            {activeTab === "applications" && (
              <div className={styles.applicationsSection}>
                <div className={styles.applicationsGrid}>
                  <div className={styles.applicantListSection}>
                    {/* Course Selection for Applications Tab */}
                    <div className={styles.courseSelector}>
                      <label htmlFor="applicationsCourseSelect">
                        View Applications for:
                      </label>
                      {courses.length > 0 ? (
                        <select
                          id="applicationsCourseSelect"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className={styles.courseSelect}
                        >
                          <option value="all">All Assigned Courses</option>
                          {courses.map((course) => (
                            <option key={course.code} value={course.code}>
                              {course.code} - {course.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className={styles.noCourseMessage}>
                          <span className={styles.warningIcon}>⚠️</span>
                          No courses assigned. Contact administrator.
                        </div>
                      )}
                    </div>

                    <ApplicantList
                      applications={applications}
                      selectedApplication={selectedApplication}
                      onSelectApplication={handleSelectApplication}
                    />
                  </div>

                  <div className={styles.applicantDetailsSection}>
                    <ApplicantDetails
                      application={selectedApplication}
                      comment={comment}
                      setComment={setComment}
                      onSaveComment={handleSaveComment}
                      onDeleteComment={handleDeleteComment}
                      onSelectApplicant={handleSelectApplicantButton}
                      onUnselectApplicant={handleUnselectApplicant}
                      onAddToRanking={handleAddToRanking}
                      showToast={showToast}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rankings" && (
              <div className={styles.rankingsSection}>
                {/* Course Selection for Rankings Tab */}
                <div className={styles.courseSelector}>
                  <label htmlFor="rankingsCourseSelect">
                    View Rankings for:
                  </label>
                  {courses.length > 0 ? (
                    <select
                      id="rankingsCourseSelect"
                      value={selectedRankingCourse}
                      onChange={(e) => setSelectedRankingCourse(e.target.value)}
                      className={styles.courseSelect}
                    >
                      <option value="">Select an Assigned Course</option>
                      {courses.map((course) => (
                        <option key={course.code} value={course.code}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={styles.noCourseMessage}>
                      <span className={styles.warningIcon}>⚠️</span>
                      No courses assigned. Contact administrator.
                    </div>
                  )}
                </div>

                <RankedCandidates
                  rankedApplications={rankedApplications}
                  selectedCourse={selectedRankingCourse}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onRemove={handleRemoveFromRanking}
                  showCourseFilter={true}
                  onCourseChange={setSelectedRankingCourse}
                  availableCourses={courses}
                />
              </div>
            )}

            {activeTab === "stats" && (
              <div className={styles.statsSection}>
                <ApplicantStatsVisualization 
                  applications={applications}
                />
              </div>
            )}
          </div>
        </div>

        {/* Toast Notifications */}
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={() => setToast({ ...toast, visible: false })}
          variant="toast"
          position="bottom-left"
          autoClose={true}
          autoCloseDelay={3000}
        />
      </div>
    </LoadingWrapper>
  );
};

export default LecturerDashboardPage;
