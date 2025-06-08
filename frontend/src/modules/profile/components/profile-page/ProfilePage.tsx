"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AuthService } from "../../../../shared/services/authService";
import { ApplicationService } from "../../../../shared/services/applicationService";
import { User, UserType } from "../../../../shared/types/user";
import { AssignedCourse } from "../../../../shared/types/courseTypes";
import { useAuth } from "../../../auth/hooks/useAuth";
import styles from "./ProfilePage.module.css";

export const ProfilePage: React.FC = () => {
  const { user: contextUser, updateUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [availablePositions, setAvailablePositions] = useState<number>(0);
  const [appliedApplications, setAppliedApplications] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      // First, try to get user from context or local storage
      const savedUser = contextUser || AuthService.getUser();

      if (savedUser) {
        setUser(savedUser);

        // For lecturers, always try to fetch assigned courses from the API
        if (savedUser.userType === UserType.LECTURER) {
          try {
            const response = await AuthService.getProfile();
            if (
              response.success &&
              response.data?.assignedCourses &&
              Array.isArray(response.data.assignedCourses)
            ) {
              setAssignedCourses(response.data.assignedCourses);
            } else {
              // No courses assigned yet
              setAssignedCourses([]);
            }
          } catch (apiError) {
            console.error(
              "Failed to fetch assigned courses for lecturer:",
              apiError
            );
            setAssignedCourses([]);
          }
        }

        // For candidates, fetch courses and applications data (same as tutor page)
        if (savedUser.userType === UserType.CANDIDATE) {
          try {
            // Use same service as tutor page for consistency
            const [coursesResponse, applicationsResponse] = await Promise.all([
              ApplicationService.getCoursesAndRoles(),
              ApplicationService.getMyCandidateApplications(),
            ]);

            if (coursesResponse.success && coursesResponse.data) {
              const courses = coursesResponse.data.courses || [];
              const roles = coursesResponse.data.roles || [];
              
              // Calculate available opportunities (same logic as tutor page)
              let availableOpportunities = 0;
              courses.forEach((course: { id: number; courseCode: string; courseName: string }) => {
                roles.forEach((role: { id: number; roleName: string }) => {
                  const hasApplied = (applicationsResponse.data || []).some(
                    (app: { courseId: number; roleId: number }) => app.courseId === course.id && app.roleId === role.id
                  );
                  if (!hasApplied) {
                    availableOpportunities += 1;
                  }
                });
              });

              setAvailablePositions(availableOpportunities);
            }

            if (applicationsResponse.success && applicationsResponse.data) {
              setAppliedApplications(applicationsResponse.data.length || 0);
            }
          } catch (apiError) {
            console.error("Failed to fetch candidate data:", apiError);
            setAvailablePositions(0);
            setAppliedApplications(0);
          }
        }

        setIsLoading(false);

        // Update user data from API (but don't change courses state again)
        try {
          const response = await AuthService.getProfile();
          if (response.success && response.data) {
            const userData = response.data.user;
            setUser(userData);
            updateUser(userData);
          }
        } catch (apiError) {
          console.error("Failed to fetch fresh profile data:", apiError);
        }
      } else {
        setError("Please log in to view your profile.");
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [authLoading, contextUser, updateUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAssignedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUserTypeLabel = (userType: UserType) => {
    switch (userType) {
      case UserType.CANDIDATE:
        return "Candidate";
      case UserType.LECTURER:
        return "Lecturer";
      case UserType.ADMIN:
        return "Admin";
      default:
        return "User";
    }
  };



  // Function to get avatar path - same logic as user dropdown
  const getAvatarPath = (userData: User) => {
    // Generate a consistent avatar number based on email
    const emailHash = userData.email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Use lecturer images if user is a lecturer
    if (userData.userType === UserType.LECTURER) {
      return `/lecturers/lecturer-${(emailHash % 4) + 1}.jpg`;
    }

    return `/avatars/avatar-${(emailHash % 12) + 1}.jpg`;
  };

  if (isLoading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.errorWrapper}>
          <div className={styles.errorIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className={styles.errorTitle}>Error Loading Profile</h2>
          <p className={styles.errorMessage}>
            {error || "Profile information could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileGrid}>
        {/* Left Panel - User Information */}
        <div className={styles.userPanel}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <Image
                src={getAvatarPath(user)}
                alt={`${user.firstName} ${user.lastName} avatar`}
                width={120}
                height={120}
                className={styles.avatarImage}
              />
            </div>
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.userName}>
              {user.firstName} {user.lastName}
            </h1>
            <div className={styles.userRole}>
              <span className={`${styles.roleBadge} ${styles[user.userType]}`}>
                {getUserTypeLabel(user.userType)}
              </span>
            </div>
            <p className={styles.userEmail}>{user.email}</p>
          </div>

          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <div className={styles.statIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>MEMBER SINCE</span>
                <span className={styles.statValue}>
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <div className={`${styles.statIcon} ${user.isBlocked ? styles.statusBlocked : styles.statusActive}`}>
                  {user.isBlocked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                  )}
                </div>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>STATUS</span>
                <span
                  className={`${styles.statusBadge} ${user.isBlocked ? styles.blocked : styles.active}`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Information Cards */}
        <div className={styles.infoPanel}>
          {/* Account Information */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Account Information</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Account Type</span>
                  <span className={styles.infoValue}>
                    {getUserTypeLabel(user.userType)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Username</span>
                  <span className={styles.infoValue}>
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Join Date</span>
                  <span className={styles.infoValue}>
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role-Specific Information */}
          <div className={styles.infoCardExpandable}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                {user.userType === UserType.LECTURER
                  ? "Assigned Courses"
                  : "Role Details"}
              </h3>
              {user.userType === UserType.LECTURER && assignedCourses.length > 0 && (
                <p className={styles.courseCount}>
                  You are currently assigned to {assignedCourses.length}{" "}
                  course{assignedCourses.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className={styles.cardContentExpandable}>
              {user.userType === UserType.LECTURER ? (
                <>
                  {assignedCourses.length > 0 ? (
                    <>
                      <div className={styles.courseList}>
                        {assignedCourses.map((course) => (
                          <div key={course.id} className={styles.courseItem}>
                            <div className={styles.courseInfo}>
                              <div className={styles.courseCode}>
                                {course.courseCode}
                              </div>
                              <div className={styles.courseName}>
                                {course.courseName}
                              </div>
                              <div className={styles.courseSemester}>
                                {course.semester}
                              </div>
                            </div>
                            <div className={styles.courseDate}>
                              <span className={styles.courseAssignedLabel}>
                                Assigned
                              </span>
                              <span className={styles.courseAssignedDate}>
                                {formatAssignedDate(
                                  course.assignedAt.toString()
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyCourses}>
                      <div className={styles.emptyCoursesIcon}>📚</div>
                      <div className={styles.emptyCoursesTitle}>
                        No Courses Assigned
                      </div>
                      <div className={styles.emptyCoursesText}>
                        You haven&apos;t been assigned to any courses yet.
                        <br />
                        Please contact the administrator to request course
                        assignments.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className={styles.candidateOverview}>
                    <div className={styles.candidateStatsGrid}>
                      <div className={styles.candidateStat}>
                        <div className={styles.candidateStatIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 1v6m0 6v6"/>
                            <path d="m15.5 7.5 3 3-3 3"/>
                            <path d="m8.5 16.5-3-3 3-3"/>
                          </svg>
                        </div>
                        <div className={styles.candidateStatContent}>
                          <span className={styles.candidateStatLabel}>Available Postions</span>
                          <span className={styles.candidateStatValue}>
                            {availablePositions} Position{availablePositions !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.candidateStat}>
                        <div className={styles.candidateStatIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                          </svg>
                        </div>
                        <div className={styles.candidateStatContent}>
                          <span className={styles.candidateStatLabel}>Applied</span>
                          <span className={styles.candidateStatValue}>
                            {appliedApplications} Application{appliedApplications !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.candidateActions}>
                    <p className={styles.roleDescription}>
                      Explore and apply for tutor and lab assistant positions across various courses. Browse available opportunities and submit your applications.
                    </p>
                    <div className={styles.actionButton}>
                      <a href="/tutor" className={styles.primaryButton}>
                        View Opportunities
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
