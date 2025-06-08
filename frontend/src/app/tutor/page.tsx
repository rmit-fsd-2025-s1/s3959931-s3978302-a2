"use client";

import React, { useState, useEffect } from "react";
import { ApplicationService, Course, Role, ApplicationData, ApplicationResponse } from "@/shared/services/applicationService";
import CourseCard from "@/modules/tutor/components/course-card/course-card";
import ApplyModal from "@/modules/tutor/components/apply-modal/apply-modal";
import Toast from "@/shared/components/common/toast/Toast";
import LoadingWrapper from "@/shared/components/common/loading-wrapper/LoadingWrapper";
import { useToast } from "@/shared/hooks/useNotification";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { redirect } from "next/navigation";
import TutorHeroSection from "@/modules/tutor/components/hero-section/TutorHeroSection";
import SearchFilters from "@/modules/tutor/components/search-filters/SearchFilters";

import styles from "./TutorPage.module.css";

const TutorDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "applied" | "available">("all");

  // Toast notifications
  const {
    toast: successToast,
    showSuccess,
    hideToast: hideSuccess,
  } = useToast();
  const { toast: errorToast, showError, hideToast: hideError } = useToast();

  // Authentication and authorization check
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      redirect("/signin");
      return;
    }

    // Check if user has candidate role (tutors are candidates)
    if (user.userType !== "candidate") {
      redirect(user.userType === "lecturer" ? "/lecturer" : "/");
      return;
    }
  }, [user, isAuthenticated, authLoading]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Load courses, roles, and user's applications in parallel
        const [coursesResponse, applicationsResponse] = await Promise.all([
          ApplicationService.getCoursesAndRoles(),
          ApplicationService.getMyCandidateApplications(),
        ]);

        if (coursesResponse.success && coursesResponse.data) {
          setCourses(coursesResponse.data.courses);
          setRoles(coursesResponse.data.roles);
        } else {
          showError(coursesResponse.message || "Failed to load courses and roles");
        }

        if (applicationsResponse.success && applicationsResponse.data) {
          setMyApplications(applicationsResponse.data);
        } else {
          showError(applicationsResponse.message || "Failed to load your applications");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        showError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, showError]);

  // Calculate comprehensive statistics
  const getComprehensiveStats = () => {
    const totalRoleCourseCombinations = courses.length * roles.length;
    const appliedCombinations = myApplications.length;
    
    // Calculate available opportunities (role-course combinations the user can apply for)
    let availableOpportunities = 0;
    
    courses.forEach(course => {
      roles.forEach(role => {
        const hasApplied = myApplications.some(
          app => app.courseId === course.id && app.roleId === role.id
        );
        
        if (!hasApplied) {
          availableOpportunities += 1; // Count each role-course combination as one opportunity
        }
      });
    });

    return {
      totalCourses: courses.length,
      totalApplications: myApplications.length,
      availableOpportunities, // Number of role-course combinations user can still apply for
      completionRate: totalRoleCourseCombinations > 0 
        ? Math.round((appliedCombinations / totalRoleCourseCombinations) * 100)
        : 0
    };
  };

  const stats = getComprehensiveStats();

  // Check if user has applied to any role in a course
  const hasAppliedToCourse = React.useCallback((courseId: number) => {
    return myApplications.some(app => app.courseId === courseId);
  }, [myApplications]);



  // Filter courses based on search query and active filter with memoization
  const filteredCourses = React.useMemo(() => {
    return courses.filter((course) => {
      const searchTerm = searchQuery.toLowerCase();
      
      // Search only in courseCode, courseName, semester, and description
      const matchesSearch = !searchQuery || 
        course.courseCode.toLowerCase().includes(searchTerm) ||
        course.courseName.toLowerCase().includes(searchTerm) ||
        course.semester.toLowerCase().includes(searchTerm) ||
        (course.description && course.description.toLowerCase().includes(searchTerm));

      let matchesFilter = true;
      
      switch (activeFilter) {
        case "available":
          // Show courses where user hasn't applied for ANY positions
          matchesFilter = !hasAppliedToCourse(course.id);
          break;
        case "applied":
          // Show courses where user has applied for ANY positions
          matchesFilter = hasAppliedToCourse(course.id);
          break;
        case "all":
        default:
          matchesFilter = true;
          break;
      }

      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, activeFilter, hasAppliedToCourse]);

  const openApplyModal = (course: Course, role: Role) => {
    console.log("Apply button clicked for:", course.courseCode, role.roleName);

    if (!user) {
      showError("You must be logged in to apply for courses.");
      return;
    }

    // Check if user has already applied for this specific role-course combination
    const existingApplication = myApplications.find(
      (app) => app.courseId === course.id && app.roleId === role.id
    );

    if (existingApplication) {
      showError(`You have already applied for ${role.roleName} position in ${course.courseCode}.`);
      return;
    }

    setSelectedCourse(course);
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const closeApplyModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSelectedRole(null);
  };

  const handleSubmitApplication = async (applicationData: ApplicationData) => {
    if (!user || !selectedCourse || !selectedRole) {
      showError("Missing required information to submit application.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit application to backend
      const response = await ApplicationService.createApplication(applicationData);

      if (response.success && response.data) {
        // Add new application to local state
        setMyApplications((prev) => [...prev, response.data!]);

        // Close modal and show success message
        setIsModalOpen(false);
        showSuccess(
          `Application submitted for ${selectedCourse.courseCode}!`
        );

        // Clear the success message after 3 seconds
        setTimeout(() => {
          hideSuccess();
        }, 3000);
      } else {
        showError(response.message || "Failed to submit your application. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      showError("Failed to submit your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while auth is being checked or data is loading
  if (authLoading || isLoading) {
    return (
      <LoadingWrapper
        isLoading={true}
        loadingMessage="Loading tutor dashboard..."
        minHeight="100vh"
        position="top-center"
      >
        <div />
      </LoadingWrapper>
    );
  }

  return (
    <LoadingWrapper isLoading={false}>
      {/* Hero Section with improved statistics */}
      <TutorHeroSection
        totalCourses={stats.totalCourses}
        userApplications={stats.totalApplications}
        availableOpportunities={stats.availableOpportunities}
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

        {/* Course Cards Grid - Modified to show 3 cards per row */}
        <div className="container mx-auto px-4 py-8">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchQuery || activeFilter !== "all"
                  ? "No courses match your current filters."
                  : "No courses available at the moment."}
              </p>
              {activeFilter === "available" && myApplications.length > 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  You have applied to all available courses. Check the &quot;Applied&quot; filter to see your applications.
                </p>
              )}
              {activeFilter === "applied" && myApplications.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  You haven&apos;t applied to any courses yet. Check the &quot;Available&quot; filter to see opportunities.
                </p>
              )}
            </div>
          ) : (
            <div className={`${styles.courseGrid} grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`}>
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  roles={roles}
                  myApplications={myApplications}
                  onApplyForRole={openApplyModal}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isModalOpen}
        course={selectedCourse}
        role={selectedRole}
        onClose={closeApplyModal}
        onSubmit={handleSubmitApplication}
        isSubmitting={isSubmitting}
      />
    </LoadingWrapper>
  );
};

export default TutorDashboardPage;
