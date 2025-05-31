"use client";
import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import type { CourseDetails } from "@/shared/types/course";
import { getCoursesWithDetails } from "@/modules/course/utils/courseDisplay.utils";
import type { Application as TutorApplication } from "@/shared/types/application";
import { saveApplicationToStorage } from "@/modules/tutor/utils/applicationDisplay.utils";
import CourseCard from "@/modules/course/components/course-card/course-card";
import ApplyModal from "@/modules/tutor/components/apply-modal/apply-modal";
import { motion } from "framer-motion";
import styles from "@/modules/tutor/styles/tutor-dashboard-layout.module.css";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

const TutorDashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(
    null
  );
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
    console.log("Checking user authentication...");
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("currentUser");
      console.log("Raw user data from localStorage:", userJson);

      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          console.log("Parsed user data:", user);
          setUserData({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          });

          // Get user's existing applications
          const applications = localStorage.getItem("applications");
          console.log("Raw applications from localStorage:", applications);

          if (applications) {
            const parsed = JSON.parse(applications);
            const userApplications = parsed
              .filter((app: TutorApplication) => app.userId === user.id)
              .map((app: TutorApplication) => app.courses)
              .flat();

            console.log("User applications:", userApplications);
            setExistingApplications(userApplications);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          redirect("/signin");
        }
      } else {
        console.log(
          "No user data found in localStorage, redirecting to signin"
        );
        redirect("/signin");
      }
      setIsLoading(false);
    }
  }, []);

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
        course.availability.toLowerCase().includes(searchQuery.toLowerCase());

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

  const openApplyModal = (course: CourseDetails) => {
    console.log("Apply button clicked for course:", course.code);
    console.log("User data:", userData);
    console.log("Existing applications:", existingApplications);

    // Check if user is logged in
    if (!userData) {
      console.log("Error: User not logged in");
      setErrorMessage("You must be logged in to apply for courses.");
      return;
    }

    // Check if user has already applied for this course
    if (existingApplications.includes(course.code)) {
      console.log("Error: Already applied to this course");
      setErrorMessage(`You have already applied for ${course.code}.`);
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
      setErrorMessage("You must be logged in to apply for courses.");
      return;
    }

    // Add user information
    applicationData.email = userData.email;
    applicationData.fullName = userData.fullName;

    // Save application
    try {
      saveApplicationToStorage(applicationData);

      // Update existing applications list
      setExistingApplications([
        ...existingApplications,
        applicationData.courses[0],
      ]);

      // Show success message
      setIsModalOpen(false);
      setSuccessMessage("Your application has been submitted successfully!");

      // Clear the success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      setErrorMessage("Failed to submit your application. Please try again.");
      console.error(error);
    }
  };

  // Card count by row for animation
  const getRowStartDelay = (index: number) => {
    if (typeof window === "undefined") return 0;
    const itemsPerRow =
      window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    return Math.floor(index / itemsPerRow) * 0.1;
  };

  return (
    <>
      <main className={`flex-grow pt-24 ${styles.tutorContainer}`}>
        {/* Hero Section */}
        <motion.div
          className={styles.tutorHeroSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.tutorHeroContent}>
            <motion.h1
              className={styles.tutorHeroTitle}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Find Your Perfect{" "}
              <span className={styles.heroHighlight}>Teaching</span> Opportunity
            </motion.h1>
            <motion.p
              className={styles.tutorHeroSubtitle}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Browse available courses and apply for tutor or lab-assistant
              positions with the School of Computer Science
            </motion.p>

            {/* Stats */}
            <motion.div
              className={styles.tutorStats}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className={styles.statItem}>
                <div className={styles.statValue}>{courses.length}</div>
                <div className={styles.statLabel}>Available Courses</div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {existingApplications.length}
                </div>
                <div className={styles.statLabel}>Your Applications</div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {courses.length - existingApplications.length}
                </div>
                <div className={styles.statLabel}>Opportunities</div>
              </div>
            </motion.div>
          </div>

          <div className={styles.heroDecoration}>
            <div
              className={`${styles.circleDecoration} ${styles.circle1}`}
            ></div>
            <div
              className={`${styles.circleDecoration} ${styles.circle2}`}
            ></div>
            <div
              className={`${styles.circleDecoration} ${styles.circle3}`}
            ></div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className={styles.tutorContainer}>
          {/* Success/Error Messages */}
          {successMessage && (
            <motion.div
              className={`${styles.message} ${styles.successMessage}`}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`${styles.messageIcon} ${styles.messageIconSuccess}`}
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
              <div className={styles.messageContent}>
                <p>{successMessage}</p>
              </div>
              <button
                className={styles.messageClose}
                onClick={() => setSuccessMessage("")}
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
              className={`${styles.message} ${styles.errorMessage}`}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`${styles.messageIcon} ${styles.messageIconError}`}
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
              <div className={styles.messageContent}>
                <p>{errorMessage}</p>
              </div>
              <button
                className={styles.messageClose}
                onClick={() => setErrorMessage("")}
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
            className={styles.searchFiltersContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Search Bar */}
            <div className={styles.searchBar}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.searchIcon}
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
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  className={styles.searchClear}
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
            <div className={styles.filterPills}>
              <button
                className={`${styles.filterPill} ${
                  activeFilter === "all" ? styles.filterPillActive : ""
                }`}
                onClick={() => setActiveFilter("all")}
              >
                All Courses
              </button>
              <button
                className={`${styles.filterPill} ${
                  activeFilter === "available" ? styles.filterPillActive : ""
                }`}
                onClick={() => setActiveFilter("available")}
              >
                Available
              </button>
              <button
                className={`${styles.filterPill} ${
                  activeFilter === "applied" ? styles.filterPillActive : ""
                }`}
                onClick={() => setActiveFilter("applied")}
              >
                Applied
              </button>
            </div>
          </motion.div>

          {/* Course Cards */}
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <motion.div
              className={styles.coursesGrid}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.code}
                  className={styles.courseCardWrapper}
                  variants={itemVariants}
                  transition={{ delay: getRowStartDelay(index) }}
                >
                  <CourseCard
                    course={course}
                    openApplyModal={openApplyModal}
                    hasApplied={existingApplications.includes(course.code)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className={styles.noCourses}>
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
      </main>
    </>
  );
};

export default TutorDashboardPage;
