"use client";
// filepath: c:\s3978302\Full Stack Development\s3959931-s3978302-a2\my-teaching-app\src\modules\home\pages\HomePage.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { lecturers } from "@/modules/lecturer/utils/lecturerDisplay.utils";
import styles from "./HomePage.module.css";
import TimelineSection from "../components/timeline-section/TimelineSection";
import LecturerShowcase from "../components/lecturer-showcase/LecturerShowcase";
import Modal from "@/shared/components/common/modal/Modal";
import type { Lecturer } from "@/shared/types/lecturer";
import HomeStats from "../components/home-stats/HomeStats";

export default function HomePage() {
  const [activeLecturer, setActiveLecturer] = useState<Lecturer | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("currentUser");
        if (user) {
          const userData = JSON.parse(user);
          setIsLoggedIn(true);
          setUserRole(userData.role);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      }
    };
    checkLoginStatus();
  }, []);

  const handleOpenLecturerModal = (lecturerId: string): void => {
    const lecturer = lecturers.find((l) => l.id === lecturerId);
    if (lecturer) setActiveLecturer(lecturer);
  };

  const handleCloseModal = (): void => {
    setActiveLecturer(null);
  };

  const currentLecturerDetails = activeLecturer
    ? lecturers.find((l) => l.id === activeLecturer.id)
    : null;
  const activeLecturerImageIndex = activeLecturer
    ? lecturers.findIndex((l) => l.id === activeLecturer.id)
    : -1;

  return (
    <>
      <main className="flex-grow pt-24">
        <section className={styles.heroSection} id="hero">
          <div className="container mx-auto relative z-10">
            <div
              className={`absolute top-20 left-10 ${styles.animatePulse || "animate-pulse"}`}
            >
              <div className={`${styles.decorationCircle} bg-orange-200`}></div>
            </div>
            <div
              className={`absolute bottom-10 right-20 ${styles.animateFloat}`}
            >
              <div className={styles.decorationCircleOutline}></div>
            </div>
            <div className={`absolute top-40 right-40`}>
              <div
                className={`${styles.decorationGradientCircle} ${styles.animateSlowSpin}`}
              ></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[400px]">
              <div>
                <h1 className={styles.heroTitle}>
                  Apply & Join <br />
                  The Best <br />
                  Tutor Team
                </h1>
                <p className={styles.heroSubtitle}>
                  Connect with the School of Computer Science and apply for
                  tutor and lab-assistant positions
                </p>
                <Link
                  href="#tutors-info"
                  className={`${styles.heroBtn} scroll-link`}
                >
                  Get Started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className={styles.heroImageContainer}>
                <div className={styles.pulseBackground}></div>
                <div className={styles.imageWrapper}>
                  <Image
                    src="/university-classroom.svg"
                    alt="University classroom"
                    fill={true}
                    priority
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
                <div
                  className={`absolute top-10 -right-5 z-20 ${styles.animateFloat}`}
                >
                  <div className={styles.floatingCard}>
                    <div className={styles.floatingIconGreen}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Top Tutors
                    </span>
                  </div>
                </div>
                <div
                  className={`absolute -bottom-2 -left-20 z-20 ${styles.animateFloatDelayed}`}
                >
                  <div className={styles.floatingCard}>
                    <div className={styles.floatingIconBlue}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Academic Excellence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <HomeStats />
        </section>

        <TimelineSection isLoggedIn={isLoggedIn} userRole={userRole} />

        <LecturerShowcase
          lecturers={lecturers}
          onOpenLecturerModal={handleOpenLecturerModal}
        />

        {/* Tutor Section - Apply CSS module styles */}
        <section
          className={`${styles.section} py-16`}
          id="tutors-info"
          style={{ backgroundColor: "var(--color-bg-secondary)" }}
        >
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <h2
                className={`text-4xl font-bold mb-4 text-center`}
                style={{ color: "var(--color-primary)" }}
              >
                For Tutor Applicants
              </h2>
              <p
                className={`text-center text-lg mb-12 max-w-3xl mx-auto`}
                style={{ color: "var(--color-text-primary)" }}
              >
                Join our team of exceptional tutors and help shape the next
                generation of computer science professionals. Follow these
                simple steps to get started.
              </p>
              <div className={styles.timelineContainer}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineTitle}>
                    Create Your Profile
                  </div>
                  <div className={styles.timelineDescription}>
                    Showcase your skills, academic credentials, and previous
                    teaching experience to stand out from other applicants.
                  </div>
                  <ul className={styles.timelineFeatures}>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Academic qualifications visibility</span>
                    </li>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Skills showcase with verification</span>
                    </li>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Teaching experience highlights</span>
                    </li>
                  </ul>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineTitle}>
                    Apply for Positions
                  </div>
                  <div className={styles.timelineDescription}>
                    Browse available courses and apply for tutor and
                    lab-assistant roles that match your expertise and
                    availability.
                  </div>
                  <ul className={styles.timelineFeatures}>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Course-specific applications</span>
                    </li>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Flexible scheduling options</span>
                    </li>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Tailored cover letters</span>
                    </li>
                  </ul>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineTitle}>Get Selected</div>
                  <div className={styles.timelineDescription}>
                    Lecturers review your profile and select candidates that
                    best fit their course requirements.
                  </div>
                  <ul className={styles.timelineFeatures}>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Real-time application status</span>
                    </li>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Direct communication with lecturers</span>
                    </li>
                    <li>
                      <span className={styles.featureIcon}>✓</span>
                      <span>Personalized feedback on applications</span>
                    </li>
                  </ul>
                </div>
              </div>
              {/* ... (Apply button with Tailwind for now) ... */}
            </div>
          </div>
        </section>

        {/* Lecturer Section - Apply CSS module styles */}
        <section
          className={`${styles.section} py-16`}
          style={{ backgroundColor: "var(--color-bg-primary)" }}
        >
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className={styles.sectionTitleContainer}>
                <div className={styles.sectionTitleBar}></div>
                <div className={styles.sectionTitleContent}>
                  <h2>Meet Our Lecturers</h2>
                  <p>
                    Meet our exceptional team of computer science lecturers who
                    bring real-world experience and academic excellence to our
                    programs.
                  </p>
                </div>
              </div>
              <div className={styles.lecturerGrid}>
                {lecturers.map((lecturer, index) => (
                  <div
                    key={lecturer.id}
                    className={styles.lecturerCard}
                    onClick={() => handleOpenLecturerModal(lecturer.id)}
                  >
                    <div>
                      <div className={styles.lecturerImageContainer}>
                        <Image
                          src={`/lecturers/lecturer-${index + 1}.jpg`}
                          alt={lecturer.name}
                          width={150}
                          height={150}
                          className={
                            styles.lecturerImage /* If defined in module */
                          }
                        />
                        {/* <div className={styles.lecturerDecoration}></div> Applied if exists */}
                      </div>
                      <h3 className={styles.lecturerName}>{lecturer.name}</h3>
                      <p className={styles.lecturerTitle}>{lecturer.title}</p>
                      <p className={styles.lecturerSpecialization}>
                        {lecturer.specialization}
                      </p>
                    </div>
                    <button className={styles.moreInfoBtn}>
                      More Information
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {currentLecturerDetails && (
          <Modal
            isOpen={!!activeLecturer}
            onClose={handleCloseModal}
            maxWidth="800px"
          >
            <div className="flex flex-col md:flex-row">
              <div className={styles.modalImageSection}>
                <div className={styles.modalImageContainer}>
                  <Image
                    src={
                      currentLecturerDetails.avatarPath ||
                      `/lecturers/lecturer-${activeLecturerImageIndex + 1}.jpg`
                    }
                    alt={currentLecturerDetails.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className={styles.modalContentSpecific}>
                <h3 className={styles.modalTitle}>
                  {currentLecturerDetails.name}
                </h3>
                <p className={styles.modalSubtitle}>
                  {currentLecturerDetails.title} in{" "}
                  {currentLecturerDetails.specialization}
                </p>
                <p className={styles.modalText}>{currentLecturerDetails.bio}</p>
                <ul className={styles.modalInfoList}>
                  <li className={styles.modalInfoItem}>
                    <span className={styles.modalInfoIcon}>📚</span>
                    <span>Teaches: {currentLecturerDetails.courses}</span>
                  </li>
                  {currentLecturerDetails.awards && (
                    <li className={styles.modalInfoItem}>
                      <span className={styles.modalInfoIcon}>🏆</span>
                      <span>Awards: {currentLecturerDetails.awards}</span>
                    </li>
                  )}
                  {currentLecturerDetails.experience && (
                    <li className={styles.modalInfoItem}>
                      <span className={styles.modalInfoIcon}>🏢</span>
                      <span>
                        Industry Experience: {currentLecturerDetails.experience}
                      </span>
                    </li>
                  )}
                  {currentLecturerDetails.certifications && (
                    <li className={styles.modalInfoItem}>
                      <span className={styles.modalInfoIcon}>🔰</span>
                      <span>
                        Certifications: {currentLecturerDetails.certifications}
                      </span>
                    </li>
                  )}
                  {currentLecturerDetails.publications && (
                    <li className={styles.modalInfoItem}>
                      <span className={styles.modalInfoIcon}>📖</span>
                      <span>
                        Publications: {currentLecturerDetails.publications}
                      </span>
                    </li>
                  )}
                  <li className={styles.modalInfoItem}>
                    <span className={styles.modalInfoIcon}>📧</span>
                    <span>Contact: {currentLecturerDetails.contact}</span>
                  </li>
                </ul>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </>
  );
}
