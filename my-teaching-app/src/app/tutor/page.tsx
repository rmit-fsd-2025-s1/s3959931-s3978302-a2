"use client";

import React, { useState } from "react";
import type { CourseDetails } from "@/shared/types/courseTypes";
import type { Application as TutorApplication } from "@/shared/types/application";
import { saveApplicationToStorage } from "@/modules/tutor/utils/applicationDisplay.utils";
import ApplyModal from "@/modules/tutor/components/apply-modal/apply-modal";
import Toast from "@/shared/components/common/toast/toast";
import LoadingWrapper from "@/shared/components/common/loading-wrapper/LoadingWrapper";
import { useToast } from "@/shared/hooks/useNotification";
import { useTutorAuth } from "@/modules/tutor/hooks/useTutorAuth";
import { useCourseFiltering } from "@/modules/tutor/hooks/useCourseFiltering";
import TutorHeroSection from "@/modules/tutor/components/hero-section/TutorHeroSection";
import SearchFilters from "@/modules/tutor/components/search-filters/SearchFilters";
import CourseGrid from "@/modules/tutor/components/course-grid/CourseGrid";
import styles from "./TutorPage.module.css";

const TutorDashboardPage: React.FC = () => {
  // Custom hooks for state management
  const {
    userData,
    existingApplications,
    isLoading,
    updateExistingApplications,
  } = useTutorAuth();
  const {
    courses,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredCourses,
  } = useCourseFiltering(existingApplications);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(
    null
  );

  // Toast notifications
  const {
    toast: successToast,
    showSuccess,
    hideToast: hideSuccess,
  } = useToast();
  const { toast: errorToast, showError, hideToast: hideError } = useToast();

  const openApplyModal = (course: CourseDetails) => {
    console.log("Apply button clicked for course:", course.code);
    console.log("User data:", userData);
    console.log("Existing applications:", existingApplications);

    // Check if user is logged in
    if (!userData) {
      console.log("Error: User not logged in");
      showError("You must be logged in to apply for courses.");
      return;
    }

    // Check if user has already applied for this course
    if (existingApplications.includes(course.code)) {
      console.log("Error: Already applied to this course");
      showError(`You have already applied for ${course.code}.`);
      return;
    }

    console.log("Opening modal for course:", course.code);
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeApplyModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSubmitApplication = (applicationData: TutorApplication) => {
    if (!userData) {
      showError("You must be logged in to apply for courses.");
      return;
    }

    // Add user information
    applicationData.email = userData.email;
    applicationData.fullName = userData.fullName;

    // Save application
    try {
      saveApplicationToStorage(applicationData);

      // Update existing applications list
      updateExistingApplications(applicationData.courses[0]);

      // Show success message
      setIsModalOpen(false);
      showSuccess("Your application has been submitted successfully!");

      // Clear the success message after 5 seconds
      setTimeout(() => {
        hideSuccess();
      }, 5000);
    } catch (error) {
      showError("Failed to submit your application. Please try again.");
      console.error(error);
    }
  };

  return (
    <LoadingWrapper
      isLoading={isLoading}
      loadingMessage="Loading tutor dashboard..."
    >
      {/* Hero Section */}
      <TutorHeroSection
        totalCourses={courses.length}
        userApplications={existingApplications.length}
      />

      {/* Main Content */}
      <main className={`flex-grow pt-0 ${styles.tutorContainer}`}>
        {/* Success/Error Messages */}
        <Toast
          message={successToast.message}
          type={successToast.type}
          visible={successToast.visible}
          onClose={hideSuccess}
          variant="toast"
          position="bottom-left"
          autoClose={true}
          autoCloseDelay={5000}
        />

        <Toast
          message={errorToast.message}
          type={errorToast.type}
          visible={errorToast.visible}
          onClose={hideError}
          variant="toast"
          position="bottom-left"
          autoClose={false}
        />

        {/* Search and Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Course Cards */}
        <CourseGrid
          isLoading={false} // We handle loading at the page level now
          filteredCourses={filteredCourses}
          existingApplications={existingApplications}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          onApplyToCourse={openApplyModal}
        />
      </main>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isModalOpen}
        course={selectedCourse}
        onClose={closeApplyModal}
        onSubmit={handleSubmitApplication}
        currentUserId={userData?.id || ""}
      />
    </LoadingWrapper>
  );
};

export default TutorDashboardPage;
