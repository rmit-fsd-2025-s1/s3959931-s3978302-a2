"use client";

import React, { useState } from "react";
import Image from "next/image";
import { lecturers } from "@/modules/lecturer/utils/lecturerDisplay.utils";
import modalStyles from "@/shared/components/common/modal/Modal.module.css";
import TimelineSection from "@/modules/home/components/timeline-section/TimelineSection";
import LecturerShowcase from "@/modules/home/components/lecturer-showcase/LecturerShowcase";
import Modal from "@/shared/components/common/modal/Modal";
import type { Lecturer } from "@/shared/types/lecturer";
import HeroSection from "@/modules/home/components/hero-section/HeroSection";
import { useAuth } from "@/shared/hooks/useAuth";

export default function HomePage() {
  const [activeLecturer, setActiveLecturer] = useState<Lecturer | null>(null);

  // Use centralized auth
  const { userData, isLoggedIn } = useAuth();

  // Derive user role from centralized auth
  const userRole = userData?.role || null;

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

        {currentLecturerDetails && (
          <Modal
            isOpen={!!activeLecturer}
            onClose={handleCloseModal}
            maxWidth="800px"
          >
            <div className={modalStyles.modalImageSection}>
              <div className={modalStyles.modalImageContainer}>
                <Image
                  src={
                    currentLecturerDetails.avatarPath ||
                    `/lecturers/lecturer-${activeLecturerImageIndex + 1}.jpg`
                  }
                  alt={currentLecturerDetails.name}
                  width={300}
                  height={300}
                  className={modalStyles.lecturerImage}
                />
              </div>
            </div>
            <div className={modalStyles.modalContent}>
              <h3 className={modalStyles.modalTitle}>
                {currentLecturerDetails.name}
              </h3>
              <p className={modalStyles.modalSubtitle}>
                {currentLecturerDetails.title} in{" "}
                {currentLecturerDetails.specialization}
              </p>
              <p className={modalStyles.modalText}>
                {currentLecturerDetails.bio}
              </p>
              <ul className={modalStyles.modalInfoList}>
                <li className={modalStyles.modalInfoItem}>
                  <span className={modalStyles.modalInfoIcon}>📚</span>
                  <span>
                    <strong>Teaches:</strong> {currentLecturerDetails.courses}
                  </span>
                </li>
                {currentLecturerDetails.certifications && (
                  <li className={modalStyles.modalInfoItem}>
                    <span className={modalStyles.modalInfoIcon}>🎓</span>
                    <span>
                      <strong>Certifications:</strong>{" "}
                      {currentLecturerDetails.certifications}
                    </span>
                  </li>
                )}
                {currentLecturerDetails.awards && (
                  <li className={modalStyles.modalInfoItem}>
                    <span className={modalStyles.modalInfoIcon}>🏆</span>
                    <span>
                      <strong>Awards:</strong> {currentLecturerDetails.awards}
                    </span>
                  </li>
                )}
                <li className={modalStyles.modalInfoItem}>
                  <span className={modalStyles.modalInfoIcon}>📧</span>
                  <span>
                    <strong>Contact:</strong> {currentLecturerDetails.contact}
                  </span>
                </li>
              </ul>
            </div>
          </Modal>
        )}
      </main>
    </>
  );
}
