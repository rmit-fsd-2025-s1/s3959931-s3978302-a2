import React from "react";
import styles from "./LecturerShowcase.module.css";
import LecturerCard from "../lecturer-card/LecturerCard";
import type { Lecturer } from "@/shared/types/lecturer";

interface LecturerShowcaseProps {
  lecturers: Lecturer[];
  onOpenLecturerModal: (lecturerId: string) => void;
}

const LecturerShowcase: React.FC<LecturerShowcaseProps> = ({
  lecturers,
  onOpenLecturerModal,
}) => {
  return (
    <section
      className={`py-16`}
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
              <LecturerCard
                key={lecturer.id}
                lecturer={lecturer}
                onOpenModal={onOpenLecturerModal}
                imageIndex={index} // Pass index for image path generation for now
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LecturerShowcase;
