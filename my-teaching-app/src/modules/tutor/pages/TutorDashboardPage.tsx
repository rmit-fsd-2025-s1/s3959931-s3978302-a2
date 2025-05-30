"use client";
import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation"; // Import redirect
// import { useRouter } from "next/router"; // To be refactored
// import Head from "next/head"; // Handled by layout
import Image from "next/image";
import type { CourseDetails } from "@/shared/types/course";
import { getCoursesWithDetails } from "@/modules/course/utils/courseDisplay.utils";
import type { Application as TutorApplication } from "@/shared/types/application";
import { saveApplicationToStorage } from "@/modules/tutor/utils/applicationDisplay.utils";
import CourseCard from "@/modules/course/components/course-card/course-card";
import ApplyModal from "@/modules/tutor/components/apply-modal/apply-modal";
import { motion } from "framer-motion";
import stylesTutor from "@/modules/tutor/styles/tutor-dashboard-layout.module.css"; // Assuming styles will be used

// TODO: Refactor localStorage logic to use services/API calls
// TODO: Refactor navigation
// TODO: Update styles to use tutor-dashboard-layout.module.css

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
  // const router = useRouter(); // To be refactored

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.3, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

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
          const applications = localStorage.getItem("applications");
          if (applications) {
            const parsed = JSON.parse(applications);
            const userApplications = parsed
              .filter((app: TutorApplication) => app.userId === user.id)
              .map((app: TutorApplication) => app.courses)
              .flat();
            setExistingApplications(userApplications);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          // If parsing fails, treat as not logged in
          redirect("/signin");
        }
      } else {
        // router.push("/signin"); // TODO: Refactor navigation
        // alert("User not found, redirecting to signin."); // Placeholder
        // window.location.href = "/signin"; // Temporary redirect
        redirect("/signin"); // Use Next.js redirect
      }
      setIsLoading(false);
    }
    // }, [router]); // router dependency removed
  }, []);

  useEffect(() => {
    const fetchedCourses = getCoursesWithDetails();
    setCourses(fetchedCourses);
  }, []);

  const filteredCourses = React.useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.availability.toLowerCase().includes(searchQuery.toLowerCase());
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
    if (!userData) {
      setErrorMessage("You must be logged in to apply for courses.");
      return;
    }
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
    applicationData.email = userData.email;
    applicationData.fullName = userData.fullName;
    try {
      saveApplicationToStorage(applicationData);
      setExistingApplications([
        ...existingApplications,
        applicationData.courses[0],
      ]);
      setIsModalOpen(false);
      setSuccessMessage("Your application has been submitted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      setErrorMessage("Failed to submit your application. Please try again.");
      console.error(error);
    }
  };

  const getRowStartDelay = (index: number) => {
    if (typeof window === "undefined") return 0; // Guard for SSR or early render
    const itemsPerRow =
      window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    return Math.floor(index / itemsPerRow) * 0.1;
  };

  return (
    <>
      {/* <Head> // Removed Head
        <title>TeachTeam - Tutor Portal</title>
      </Head> */}
      <main
        className={`flex-grow pt-24 ${stylesTutor.tutorDashboardContainer}`}
      >
        <motion.div
          className={stylesTutor.tutorHeroSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className={stylesTutor.tutorHeroContent}>
            <motion.h1
              className={stylesTutor.tutorHeroTitle}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Find Your Perfect{" "}
              <span className={stylesTutor.heroHighlight}>Teaching</span>{" "}
              Opportunity
            </motion.h1>
            <motion.p
              className={stylesTutor.tutorHeroSubtitle}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Browse available courses and apply for tutor or lab-assistant
              positions with the School of Computer Science
            </motion.p>
            <motion.div
              className={stylesTutor.tutorStats}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className={stylesTutor.statItem}>
                <div className={stylesTutor.statValue}>{courses.length}</div>
                <div className={stylesTutor.statLabel}>Available Courses</div>
              </div>
              <div className={stylesTutor.statDivider}></div>
              <div className={stylesTutor.statItem}>
                <div className={stylesTutor.statValue}>
                  {existingApplications.length}
                </div>
                <div className={stylesTutor.statLabel}>Your Applications</div>
              </div>
              <div className={stylesTutor.statDivider}></div>
              <div className={stylesTutor.statItem}>
                <div className={stylesTutor.statValue}>
                  {courses.length - existingApplications.length}
                </div>
                <div className={stylesTutor.statLabel}>Opportunities</div>
              </div>
            </motion.div>
          </div>
          <div className={stylesTutor.heroDecoration}>
            <div
              className={`${stylesTutor.circleDecoration} ${stylesTutor.circle1}`}
            ></div>
            <div
              className={`${stylesTutor.circleDecoration} ${stylesTutor.circle2}`}
            ></div>
            <div
              className={`${stylesTutor.circleDecoration} ${stylesTutor.circle3}`}
            ></div>
          </div>
        </motion.div>

        <div className={stylesTutor.dashboardContentWrapper}>
          {successMessage && (
            <motion.div
              className={`${stylesTutor.message} ${stylesTutor.successMessage}`}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`${stylesTutor.messageIcon} ${stylesTutor.messageIconSuccess}`}
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
              <div className={stylesTutor.messageContent}>
                <p>{successMessage}</p>
              </div>
              <button
                className={stylesTutor.messageClose}
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
              className={`${stylesTutor.message} ${stylesTutor.errorMessage}`}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`${stylesTutor.messageIcon} ${stylesTutor.messageIconError}`}
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
              <div className={stylesTutor.messageContent}>
                <p>{errorMessage}</p>
              </div>
              <button
                className={stylesTutor.messageClose}
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

          <motion.div
            className={stylesTutor.searchFiltersContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className={stylesTutor.searchBar}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={stylesTutor.searchIcon}
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
                className={stylesTutor.searchInput}
              />
              {searchQuery && (
                <button
                  className={stylesTutor.searchClear}
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
            <div className={stylesTutor.filterPills}>
              <button
                className={`${stylesTutor.filterPill} ${activeFilter === "all" ? stylesTutor.filterPillActive : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Courses
              </button>
              <button
                className={`${stylesTutor.filterPill} ${activeFilter === "available" ? stylesTutor.filterPillActive : ""}`}
                onClick={() => setActiveFilter("available")}
              >
                Available
              </button>
              <button
                className={`${stylesTutor.filterPill} ${activeFilter === "applied" ? stylesTutor.filterPillActive : ""}`}
                onClick={() => setActiveFilter("applied")}
              >
                Applied
              </button>
            </div>
          </motion.div>

          {isLoading ? (
            <div className={stylesTutor.loadingContainer}>
              <div className={stylesTutor.loadingSpinner}></div>
              <p>Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <motion.div
              className={stylesTutor.coursesGrid}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.code}
                  className={stylesTutor.courseCardWrapper}
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
            <div className={stylesTutor.noCourses}>
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
      </main>

      <ApplyModal
        isOpen={isModalOpen}
        course={selectedCourse}
        onClose={closeApplyModal}
        onSubmit={handleSubmitApplication}
        currentUserId={userData?.id || ""}
      />
    </>
  );
};

export default TutorDashboardPage; // Renamed from TutorPage
