import React from "react";
import styles from "./LecturerShowcase.module.css";
import LecturerCard from "../lecturer-card/LecturerCard";
import SectionTitle from "../SectionTitle/SectionTitle";
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
      className={`py-24`}
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            title="Meet Our Lecturers"
            subtitle="Meet our exceptional team of computer science lecturers who bring real-world experience and academic excellence to our programs."
          />
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

export default React.memo(LecturerShowcase);
