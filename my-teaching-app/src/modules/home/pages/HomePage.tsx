"use client";
// filepath: c:\s3978302\Full Stack Development\s3959931-s3978302-a2\my-teaching-app\src\modules\home\pages\HomePage.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { lecturers } from "@/modules/lecturer/utils/lecturerDisplay.utils";
import styles from "./HomePage.module.css";
import TimelineSection from "../components/timeline-section/TimelineSection";
import LecturerShowcase from "../components/lecturer-showcase/LecturerShowcase";
import Modal from "@/shared/components/common/modal/Modal";
import type { Lecturer } from "@/shared/types/lecturer";
import HeroSection from "../components/hero-section/HeroSection";

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
        <HeroSection />

        <TimelineSection isLoggedIn={isLoggedIn} userRole={userRole} />

        <LecturerShowcase
          lecturers={lecturers}
          onOpenLecturerModal={handleOpenLecturerModal}
        />

        {/* Tutor Section */}
        <section
          className={`${styles.section} py-16`}
          id="tutors-info"
          style={{ backgroundColor: "var(--color-bg-secondary)" }}
        >
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <h2
                className="text-4xl font-bold mb-4 text-center"
                style={{ color: "var(--color-primary)" }}
              >
                For Tutor Applicants
              </h2>
              <p
                className="text-center text-lg mb-12 max-w-3xl mx-auto"
                style={{ color: "var(--color-text-primary)" }}
              >
                Join our team of exceptional tutors and help shape the next
                generation of computer science professionals. Follow these
                simple steps to get started.
              </p>

              {/* Timeline Design */}
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

              <div className="text-center mt-12">
                {
                  !isLoggedIn ? (
                    <Link
                      href="/signin"
                      className="btn-primary px-8 py-3 rounded-lg text-lg font-medium inline-block transition-all hover:shadow-lg"
                    >
                      Apply as a Tutor
                    </Link>
                  ) : userRole === "tutor" ? (
                    <Link
                      href="/tutor"
                      className="btn-primary px-8 py-3 rounded-lg text-lg font-medium inline-block transition-all hover:shadow-lg"
                    >
                      Go to Tutor Dashboard
                    </Link>
                  ) : null /* Lecturer sees nothing */
                }
              </div>
            </div>
          </div>
        </section>

        {/* Lecturer Section */}
        <section
          className={`${styles.section} py-16`}
          style={{ backgroundColor: "var(--color-bg-primary)" }}
        >
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              {/* Section title with decorative bar */}
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

              {/* Lecturer Grid */}
              <div className={styles.lecturerGrid}>
                {lecturers.map((lecturer, index) => (
                  <div
                    key={lecturer.id}
                    className={`${styles.lecturerCard} lecturer${index + 1}`}
                    onClick={() => handleOpenLecturerModal(lecturer.id)}
                  >
                    <div>
                      <div className={styles.lecturerImageContainer}>
                        <Image
                          src={`/lecturers/lecturer-${index + 1}.jpg`}
                          alt={lecturer.name}
                          width={200}
                          height={200}
                          className={styles.lecturerImage}
                        />
                        <div className={styles.lecturerDecoration}></div>
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
