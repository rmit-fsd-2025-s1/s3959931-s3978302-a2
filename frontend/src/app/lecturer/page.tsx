"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ApplicationService,
  ApplicationResponse,
} from "@/shared/services/applicationService";
import { Application } from "@/shared/types/application";
import ApplicantList from "@/modules/lecturer/components/applicant-list/applicant-list";
import ApplicantDetails from "@/modules/lecturer/components/applicant-details/applicant-details";
import RankedCandidates from "@/modules/lecturer/components/ranked-candidates/ranked-candidates";
import ApplicantStatsVisualization from "@/modules/lecturer/components/applicant-stats-visualization/applicant-stats-visualization";
import Toast from "@/shared/components/common/toast/Toast";
import LoadingWrapper from "@/shared/components/common/loading-wrapper/LoadingWrapper";
import { useLecturerAuth } from "@/modules/lecturer/hooks/useLecturerAuth";
import { useApplicationManagement } from "@/modules/lecturer/hooks/useApplicationManagement";
import DashboardHeader from "@/modules/lecturer/components/dashboard-header/DashboardHeader";
import DashboardTabs from "@/modules/lecturer/components/dashboard-tabs/DashboardTabs";
import ApplicationFilters from "@/modules/lecturer/components/application-filters/ApplicationFilters";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { redirect } from "next/navigation";
import styles from "./LecturerPage.module.css";
import { AdminApolloProvider } from "@/components/AdminApolloProvider";
import { useCandidateBlockingSubscription } from "@/hooks/useCandidateBlockingSubscription";
import { CandidateBlockedEvent } from "@/lib/graphql-subscriptions";

type TabType = "applications" | "rankings" | "stats";

// Adapter function to convert ApplicationResponse to Application
const convertToLegacyApplication = (
  appResponse: ApplicationResponse
): Application & {
  role?: { roleName: string };
  course?: { courseCode: string; courseName: string; semester: string };
  rankedForCourse?: string;
  isBlocked?: boolean;
} => {
  const availabilityValue =
    (appResponse.availability as { type: string })?.type || "Part Time";
  const availability: "Full Time" | "Part Time" =
    availabilityValue === "Full Time" ? "Full Time" : "Part Time";

  return {
    id: appResponse.id.toString(),
    userId: appResponse.candidateId.toString(),
    email: appResponse.candidate?.email || "",
    fullName:
      `${appResponse.candidate?.firstName || ""} ${appResponse.candidate?.lastName || ""}`.trim(),
    courses: [appResponse.course.courseCode],
    availability,
    skills: appResponse.skills
      ? appResponse.skills.split(",").map((s) => s.trim())
      : [],
    academicCredentials: appResponse.experience || "",
    dateApplied: appResponse.appliedAt,
    status: appResponse.status as
      | "pending"
      | "shortlisted"
      | "rejected"
      | "hired",
    selected: appResponse.status === "selected",
    comment: appResponse.comment || "",
    rank: appResponse.rank, // Preserve rank from backend
    // Extended properties
    role: appResponse.role
      ? { roleName: appResponse.role.roleName }
      : undefined,
    course: appResponse.course
      ? {
          courseCode: appResponse.course.courseCode,
          courseName: appResponse.course.courseName,
          semester: appResponse.course.semester,
        }
      : undefined,
    // Add fields needed for ranking
    selectedForCourses:
      appResponse.status === "selected"
        ? [appResponse.course.courseCode]
        : undefined,
    rankedForCourse: appResponse.rankedForCourse,
    // Add blocking status
    isBlocked: appResponse.candidate?.isBlocked || false,
  };
};

// Convert statistics to legacy format
const convertToLegacyStatistics = (stats: unknown) => {
  if (!stats || typeof stats !== "object") {
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
    selectionRate:
      typedStats.totalApplications && typedStats.totalApplications > 0
        ? Math.round(
            ((typedStats.applicationsByStatus?.selected || 0) /
              typedStats.totalApplications) *
              100
          )
        : 0,
  };
};

const LecturerDashboardInner: React.FC = () => {
  // Authentication
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { lecturerName } = useLecturerAuth();

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("applications");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success"
  );

  // Show toast function
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      console.log("🍞 showToast called:", { message, type });

      // Clear any existing toast first
      setToastMessage(null);

      // Set new toast after a small delay to ensure the previous one is cleared
      setTimeout(() => {
        setToastMessage(message);
        setToastType(type);
      }, 10);
    },
    []
  );

  // Test function to manually trigger toast
  const testToast = useCallback(() => {
    console.log("🧪 Testing toast functionality");
    showToast("Test notification: Candidate blocked", "info");
    showToast("Test notification: Candidate unblocked", "success");
  }, [showToast]);

  // Test backend connectivity first
  const testBackendConnectivity = useCallback(async () => {
    console.log("🧪 Testing backend connectivity...");
    const httpUrl =
      process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT ||
      "http://localhost:4002/graphql";
    const healthUrl = "http://localhost:4002/health";

    // Test 1: Health endpoint
    try {
      console.log("🏥 Testing health endpoint:", healthUrl);
      const healthResponse = await fetch(healthUrl);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log("✅ Health endpoint response:", healthData);
        showToast("Health check: Connected", "success");
      } else {
        console.log("❌ Health endpoint failed:", healthResponse.status);
        showToast(`Health check failed: ${healthResponse.status}`, "error");
      }
    } catch (error) {
      console.error("❌ Health endpoint error:", error);
      showToast("Health check: Network error", "error");
    }

    // Test 2: GraphQL endpoint
    try {
      console.log("🔗 Testing GraphQL endpoint:", httpUrl);
      const response = await fetch(httpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "query { __typename }" }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ GraphQL endpoint response:", data);
        showToast("GraphQL test: Connected", "success");
      } else {
        console.log("❌ GraphQL endpoint failed:", response.status);
        showToast(`GraphQL test failed: ${response.status}`, "error");
      }
    } catch (error) {
      console.error("❌ GraphQL endpoint error:", error);
      showToast("GraphQL test: Network error", "error");
    }
  }, [showToast]);

  // Application management with enhanced filtering
  const {
    applications: rawApplications,
    statistics: rawStatistics,
    isInitialized,
    selectedApplication: rawSelectedApplication,
    setSelectedApplication: setRawSelectedApplication,
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

  // Memoize the callback function to prevent excessive re-initializations
  const onCandidateBlocked = useCallback(
    (event: CandidateBlockedEvent) => {
      console.log("🔔 Candidate blocking event received:", event);

      // Check if current lecturer should be affected by this blocking event
      const shouldReceiveNotification =
        user?.userType === "lecturer" &&
        event.affectedLecturerIds &&
        event.affectedLecturerIds.includes(user.id);

      console.log("🎯 onCandidateBlocked targeting check:", {
        candidateName: event.candidateName,
        currentUserId: user?.id,
        affectedLecturerIds: event.affectedLecturerIds,
        shouldReceiveNotification,
      });

      // Only show toast notifications for affected lecturers
      if (shouldReceiveNotification) {
        if (event.isBlocked) {
          console.log(
            `🚫 Candidate ${event.candidateName} has been blocked - automatically unselecting and unranking their applications`
          );

          const unselectedCount = event.unselectedApplicationsCount || 0;
          const unrankedCount = event.unrankedApplicationsCount || 0;

          let message = `${event.candidateName} blocked`;
          if (unselectedCount > 0 || unrankedCount > 0) {
            const details = [];
            if (unselectedCount > 0)
              details.push(
                `${unselectedCount} application${unselectedCount === 1 ? "" : "s"} unselected`
              );
            if (unrankedCount > 0)
              details.push(
                `${unrankedCount} ranking${unrankedCount === 1 ? "" : "s"} removed`
              );
            message += ` - ${details.join(", ")}`;
          }

          showToast(message, "info");
        } else {
          console.log(`✅ Candidate ${event.candidateName} has been unblocked`);
          showToast(`${event.candidateName} unblocked`, "success");
        }
      } else {
        console.log(
          `🚫 Not showing toast for ${event.candidateName} - lecturer not affected`
        );
      }

      console.log("🔄 Refreshing applications after blocking event...");

      // Check if the currently selected application is affected by this blocking event
      const isCurrentlySelectedAffected =
        rawSelectedApplication &&
        rawSelectedApplication.candidateId === event.candidateId;

      if (isCurrentlySelectedAffected) {
        console.log(
          "⚠️ Currently selected application is affected by blocking event"
        );
        console.log("🔄 Clearing selected application state to force refresh");
        // Clear the selected application to force a proper refresh
        setRawSelectedApplication(null);

        if (event.isBlocked && shouldReceiveNotification) {
          // Show specific message when the currently selected candidate is blocked (only for affected lecturers)
          showToast(
            `Currently selected candidate ${event.candidateName} has been blocked and unselected`,
            "error"
          );
        }
      }

      // Refresh applications to get updated data
      loadApplications()
        .then(() => {
          console.log("✅ Applications refreshed after blocking event");

          // If we cleared a selected application and it was unblocked, try to re-select it
          if (isCurrentlySelectedAffected && !event.isBlocked) {
            console.log("🔄 Re-selecting application after unblock event");
            setTimeout(() => {
              // Find the updated application by candidate ID
              const updatedApplication = rawApplications.find(
                (app) => app.candidateId === event.candidateId
              );
              if (updatedApplication) {
                console.log(
                  "✅ Re-selecting unblocked application:",
                  updatedApplication.id
                );
                rawHandleSelectApplication(updatedApplication);
              }
            }, 100); // Small delay to ensure applications are loaded
          }
        })
        .catch((error) => {
          console.error("❌ Failed to refresh applications:", error);
        });
    },
    [
      user,
      loadApplications,
      rawSelectedApplication,
      setRawSelectedApplication,
      rawHandleSelectApplication,
      rawApplications,
      showToast,
    ]
  );

  // Candidate blocking subscription with memoized callbacks
  const subscriptionResult = useCandidateBlockingSubscription({
    showToast,
    onCandidateBlocked,
  });

  const {
    isConnected: subscriptionConnected,
    loading: subscriptionLoading,
    error: subscriptionError,
    dataReceived,
  } = subscriptionResult;

  // Track if connection toast has been shown
  const [connectionToastShown, setConnectionToastShown] = useState(false);

  // Test subscription connection via Apollo Client (defined after subscription variables)
  const testSubscriptionConnection = useCallback(() => {
    console.log("🧪 Testing Apollo Client subscription connection");

    if (subscriptionConnected) {
      showToast("✅ Subscription is already connected!", "success");
      console.log("✅ Subscription status: Connected and ready");
    } else if (subscriptionLoading) {
      showToast("🔄 Subscription is connecting...", "info");
      console.log("🔄 Subscription status: Loading/Connecting");
    } else if (subscriptionError) {
      showToast(`❌ Subscription error: ${subscriptionError.message}`, "error");
      console.log("❌ Subscription status: Error -", subscriptionError.message);
    } else {
      showToast("❓ Subscription status unknown", "info");
      console.log("❓ Subscription status: Unknown state");
    }

    console.log("🔍 Full subscription state:", {
      connected: subscriptionConnected,
      loading: subscriptionLoading,
      error: subscriptionError?.message,
      dataReceived,
    });
  }, [
    subscriptionConnected,
    subscriptionLoading,
    subscriptionError,
    dataReceived,
    showToast,
  ]);

  // Test subscription event trigger
  const testSubscriptionEvent = useCallback(async () => {
    console.log("🧪 Triggering test subscription event...");
    showToast("🧪 Triggering test subscription event...", "info");

    try {
      const response = await fetch("http://localhost:4002/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `mutation { testSubscription }`,
        }),
      });

      const result = await response.json();
      console.log("🧪 Test subscription response:", result);

      if (result.data?.testSubscription) {
        showToast("✅ Test event triggered successfully!", "success");
        console.log("✅ Test subscription event triggered successfully");
      } else {
        showToast("❌ Failed to trigger test event", "error");
        console.error("❌ Test subscription failed:", result.errors);
      }
    } catch (error) {
      console.error("❌ Error triggering test subscription:", error);
      showToast("❌ Error triggering test event", "error");
    }
  }, [showToast]);

  // Log subscription connection status for debugging
  useEffect(() => {
    console.log("🔗 Subscription status:", {
      connected: subscriptionConnected,
      loading: subscriptionLoading,
      error: subscriptionError?.message,
      dataReceived,
    });
  }, [
    subscriptionConnected,
    subscriptionLoading,
    subscriptionError,
    dataReceived,
  ]);

  // Add debug info for subscription - only show connection toast once
  useEffect(() => {
    if (subscriptionConnected && !connectionToastShown) {
      console.log("✅ Real-time notifications are active");
      showToast("Real-time notifications connected", "info");
      setConnectionToastShown(true);
    } else if (!subscriptionConnected) {
      console.log("🔌 Real-time notifications disconnected");
      setConnectionToastShown(false);
    }
  }, [subscriptionConnected, showToast, connectionToastShown]);

  // Convert to legacy format for existing components
  const applications = rawApplications.map(convertToLegacyApplication);
  const statistics = convertToLegacyStatistics(rawStatistics);
  const selectedApplication = useMemo(
    () =>
      rawSelectedApplication
        ? convertToLegacyApplication(rawSelectedApplication)
        : null,
    [rawSelectedApplication]
  );
  const rankedApplications = rawRankedApplications.map(
    convertToLegacyApplication
  );

  // Debug log to track selectedApplication conversion
  useEffect(() => {
    if (selectedApplication) {
      console.log("🔄 selectedApplication converted:", {
        id: selectedApplication.id,
        comment: selectedApplication.comment,
        rawComment: rawSelectedApplication?.comment,
      });
    }
  }, [selectedApplication, rawSelectedApplication]);

  // Additional UI state
  const [courses, setCourses] = useState<Array<{ code: string; name: string }>>(
    []
  );
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsFilterArray, setSkillsFilterArray] = useState<string[]>([]);

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
  const loadCourses = useCallback(async () => {
    try {
      console.log("🔄 Loading courses for lecturer...");

      // Try to get real data from API first
      const response = await ApplicationService.getAssignedCoursesForLecturer();
      if (response.success && response.data && response.data.length > 0) {
        const courseList = response.data.map((course) => ({
          code: course.courseCode,
          name: course.courseName,
        }));
        setCourses(courseList);
        console.log(
          `✅ Updated with ${courseList.length} real assigned courses for lecturer`
        );
      } else {
        console.log("📝 No courses assigned to this lecturer yet");
        setCourses([]);
        if (response.message && !response.success) {
          showToast(
            "No courses assigned yet. Contact administrator for course assignments.",
            "info"
          );
        }
      }
    } catch (error) {
      console.error("Error loading assigned courses:", error);
      setCourses([]);
      showToast(
        "Error loading courses. Please check your connection.",
        "error"
      );
    }
  }, [showToast]);

  useEffect(() => {
    if (isInitialized) {
      loadCourses();
    }
  }, [isInitialized, loadCourses]);

  // Add a periodic refresh to detect course changes
  useEffect(() => {
    if (!isInitialized) return;

    const refreshInterval = setInterval(() => {
      console.log("🔄 Periodic refresh of courses and applications...");
      loadCourses();
      loadApplications();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(refreshInterval);
  }, [isInitialized, loadCourses, loadApplications]);

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    showToast("Refreshing data...", "success");
    try {
      await Promise.all([loadCourses(), loadApplications()]);
      showToast("Data refreshed successfully", "success");
    } catch (error) {
      console.error("Error during manual refresh:", error);
      showToast("Error refreshing data", "error");
    }
  }, [loadCourses, loadApplications, showToast]);

  // Extract all unique skills from applications
  useEffect(() => {
    const allSkills = new Set<string>();
    rawApplications.forEach((app) => {
      if (app.skills) {
        app.skills.split(",").forEach((skill) => {
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
      setSkillsFilterArray(
        skillsFilter
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      );
    } else {
      setSkillsFilterArray([]);
    }
  }, [skillsFilter]);

  // Handle skills filter change - convert array to comma-separated string
  const handleSkillsFilterChange = (skills: string[]) => {
    setSkillsFilterArray(skills);
    setSkillsFilter(skills.join(", "));
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCourse && selectedCourse !== "all") count++;
    if (roleTypeFilter && roleTypeFilter !== "all") count++;
    if (availabilityFilter && availabilityFilter !== "all") count++;
    if (statusFilter && statusFilter !== "all") count++;
    if (skillsFilterArray.length > 0) count += skillsFilterArray.length;
    return count;
  };

  // Clear all filters function
  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedCourse("all");
    setRoleTypeFilter("all");
    setAvailabilityFilter("all");
    setStatusFilter("all");
    setSkillsFilter("");
    setSkillsFilterArray([]);
    setSortBy("none");
  };

  // Wrap the selection handler to convert back to ApplicationResponse
  const handleSelectApplication = (app: Application) => {
    console.log("🎯 handleSelectApplication called:", {
      appId: app.id,
      appName: app.fullName,
      rawApplicationsCount: rawApplications.length,
    });

    const originalApp = rawApplications.find(
      (rawApp) => rawApp.id.toString() === app.id
    );

    console.log("🔍 Looking for original app:", {
      found: !!originalApp,
      originalAppId: originalApp?.id,
      searchingFor: app.id,
      rawAppIds: rawApplications.map((raw) => ({
        id: raw.id,
        stringId: raw.id.toString(),
      })),
    });

    if (originalApp) {
      console.log("✅ Found original app, calling rawHandleSelectApplication");
      rawHandleSelectApplication(originalApp);
    } else {
      console.error("❌ Could not find original app in rawApplications");
    }
  };

  // Application actions (simplified - using new backend)
  const handleSaveComment = async () => {
    if (!rawSelectedApplication) return;

    console.log(
      "💾 Saving comment:",
      comment,
      "for application:",
      rawSelectedApplication.id
    );

    try {
      const response = await ApplicationService.updateApplicationComment(
        rawSelectedApplication.id,
        comment
      );

      console.log("💾 Save comment response:", response);

      if (response.success) {
        showToast("Comment saved successfully", "success");
        await loadApplications(); // Reload to get updated data
        console.log("💾 Applications reloaded after comment save");
      } else {
        showToast(response.message || "Failed to save comment", "error");
      }
    } catch (error) {
      console.error("💾 Error saving comment:", error);
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
        showToast("Comment deleted", "success");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to delete comment", "error");
      }
    } catch {
      showToast("Error deleting comment", "error");
    }
  };

  const handleSelectApplicantButton = async (selectedCourses: string[]) => {
    console.log("🎯 handleSelectApplicantButton called:", {
      rawSelectedApplication: !!rawSelectedApplication,
      rawSelectedAppId: rawSelectedApplication?.id,
      rawSelectedAppName:
        rawSelectedApplication?.candidate?.firstName +
        " " +
        rawSelectedApplication?.candidate?.lastName,
      selectedApplication: !!selectedApplication,
      selectedAppId: selectedApplication?.id,
      selectedCourses,
      selectedCoursesType: typeof selectedCourses,
      selectedCoursesLength: selectedCourses?.length,
      selectedCoursesContent: selectedCourses,
      comment: comment,
    });

    // Try to get the raw application from rawSelectedApplication first
    let targetApplication: ApplicationResponse | null = rawSelectedApplication;

    // If rawSelectedApplication is null but we have selectedApplication, try to find it
    if (!targetApplication && selectedApplication) {
      console.log(
        "🔍 rawSelectedApplication is null, trying to find from selectedApplication"
      );
      targetApplication =
        rawApplications.find(
          (rawApp) => rawApp.id.toString() === selectedApplication.id
        ) || null;
      console.log("🔍 Found target application:", !!targetApplication);

      // If we found it, set it as the selected application for future use
      if (targetApplication) {
        console.log("✅ Setting rawSelectedApplication for future use");
        rawHandleSelectApplication(targetApplication);
      }
    }

    if (!targetApplication) {
      console.error("❌ No application found - cannot select applicant");
      showToast(
        "No application found. Please try selecting the applicant from the list first.",
        "error"
      );
      return;
    }

    try {
      console.log("🌐 Calling updateApplicationStatus API...");
      const response = await ApplicationService.updateApplicationStatus(
        targetApplication.id,
        "selected",
        comment,
        selectedCourses
      );

      console.log("🌐 API response:", response);

      if (response.success) {
        console.log("✅ Applicant selected successfully");
        showToast("Applicant selected successfully", "success");
        await loadApplications(); // Reload to get updated data
      } else {
        console.error("❌ API returned error:", response.message);
        showToast(response.message || "Failed to select applicant", "error");
      }
    } catch (error) {
      console.error("❌ Error in handleSelectApplicantButton:", error);
      showToast("Error selecting applicant", "error");
    }
  };

  const handleUnselectApplicant = async () => {
    if (!rawSelectedApplication) return;

    try {
      // First, remove from ranking if ranked
      if (selectedApplication?.rank && selectedApplication.rank > 0) {
        console.log("🗑️ Removing from ranking before unselecting:", {
          applicationId: selectedApplication.id,
          currentRank: selectedApplication.rank,
        });

        const removeRankingResponse =
          await ApplicationService.removeApplicationFromRanking(
            parseInt(selectedApplication.id)
          );

        if (!removeRankingResponse.success) {
          console.warn(
            "Failed to remove from ranking:",
            removeRankingResponse.message
          );
        }
      }

      // Then unselect the application
      const response = await ApplicationService.updateApplicationStatus(
        rawSelectedApplication.id,
        "pending"
      );

      if (response.success) {
        showToast("Applicant unselected and removed from ranking", "success");
        await loadApplications(); // Reload to get updated data
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
      showToast(
        "Please select the applicant before adding to ranking",
        "error"
      );
      return;
    }

    if (
      selectedApplication.rank !== undefined &&
      selectedApplication.rank !== null &&
      selectedApplication.rank > 0
    ) {
      showToast("Applicant is already added to ranking", "info");
      return;
    }

    if (!selectedApplication.comment || !comment.trim()) {
      showToast(
        "Please add and save a comment before adding to ranking",
        "error"
      );
      return;
    }

    const hasUnsavedComment = comment !== (selectedApplication.comment || "");
    if (hasUnsavedComment) {
      showToast("Please save your comment before adding to ranking", "error");
      return;
    }

    // Auto-select the course since there's only one course
    let courseForRanking = selectedRankingCourse;
    if (!courseForRanking && selectedApplication.courses.length > 0) {
      courseForRanking = selectedApplication.courses[0];
    }

    if (!courseForRanking) {
      showToast("No course found for ranking", "error");
      return;
    }

    try {
      // Calculate next rank (add to end of list)
      const currentRankedForCourse = rankedApplications.filter(
        (app) =>
          app.selectedForCourses?.includes(courseForRanking) ||
          app.courses.includes(courseForRanking)
      );
      const nextRank = currentRankedForCourse.length + 1;

      console.log("🎯 Adding to ranking:", {
        applicationId: selectedApplication.id,
        nextRank,
        courseForRanking,
        currentRankedCount: currentRankedForCourse.length,
      });

      const response = await ApplicationService.addApplicationToRanking(
        parseInt(selectedApplication.id),
        nextRank,
        courseForRanking
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

    const filteredRanked = rankedApplications.filter(
      (ranked) =>
        ranked.selectedForCourses?.includes(selectedRankingCourse) ||
        ranked.courses.includes(selectedRankingCourse)
    );

    const currentIndex = filteredRanked.findIndex(
      (ranked) => ranked.id === app.id
    );
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

    const filteredRanked = rankedApplications.filter(
      (ranked) =>
        ranked.selectedForCourses?.includes(selectedRankingCourse) ||
        ranked.courses.includes(selectedRankingCourse)
    );

    const currentIndex = filteredRanked.findIndex(
      (ranked) => ranked.id === app.id
    );
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
      console.log("🗑️ Removing from ranking:", {
        applicationId: id,
        beforeRemoval: {
          rankedCount: rankedApplications.length,
          rankedApps: rankedApplications.map((app) => ({
            id: app.id,
            rank: app.rank,
          })),
        },
      });

      const response = await ApplicationService.removeApplicationFromRanking(
        parseInt(id)
      );

      console.log("🗑️ Remove ranking response:", response);

      if (response.success) {
        showToast("Removed from ranking successfully", "success");
        console.log("🔄 Reloading applications after remove...");
        await loadApplications(); // Reload to get updated data
        console.log(
          "🔄 Applications reloaded, new ranked count:",
          rankedApplications.length
        );
      } else {
        console.error("❌ Remove ranking failed:", response.message);
        showToast(response.message || "Failed to remove from ranking", "error");
      }
    } catch (error) {
      console.error("❌ Remove ranking error:", error);
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
            onRefresh={handleManualRefresh}
          />

          {/* Debug button for testing toasts */}
          <div
            style={{
              margin: "1rem 0",
              padding: "1rem",
              backgroundColor: "#f0f0f0",
              borderRadius: "0.5rem",
            }}
          >
            <button
              onClick={testToast}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
                marginRight: "1rem",
              }}
            >
              🧪 Test Toast Notifications
            </button>
            <button
              onClick={testBackendConnectivity}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
                marginRight: "1rem",
              }}
            >
              🔗 Test Backend Connectivity
            </button>
            <button
              onClick={testSubscriptionConnection}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#059669",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
                marginRight: "1rem",
              }}
            >
              📡 Test Subscription Status
            </button>
            <button
              onClick={testSubscriptionEvent}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
                marginRight: "1rem",
              }}
            >
              🔥 Trigger Test Event
            </button>
            <span style={{ fontSize: "0.875rem", color: "#666" }}>
              Real-time Notifications:{" "}
              {subscriptionLoading
                ? "🎧 Listening for events..."
                : subscriptionConnected
                  ? "✅ Active"
                  : subscriptionError
                    ? "❌ Error"
                    : "❌ Inactive"}
              {subscriptionError && (
                <span style={{ color: "red", fontSize: "0.75rem" }}>
                  {" "}
                  ({subscriptionError.message})
                </span>
              )}
              <br />
              <small style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                Events Received:{" "}
                {dataReceived ? "✅ Yes" : "⏳ Waiting for admin events"} |
                WebSocket Status: Connected ✅
              </small>
            </span>
          </div>

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
                <ApplicantStatsVisualization applications={applications} />
              </div>
            )}
          </div>
        </div>

        {/* Toast Notifications */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            visible={!!toastMessage}
            onClose={() => setToastMessage(null)}
            variant="toast"
            position="bottom-left"
            autoClose={true}
            autoCloseDelay={3000}
          />
        )}
      </div>
    </LoadingWrapper>
  );
};

// Main wrapper component with Apollo provider
const LecturerDashboardPage: React.FC = () => {
  return (
    <AdminApolloProvider>
      <LecturerDashboardInner />
    </AdminApolloProvider>
  );
};

export default LecturerDashboardPage;
