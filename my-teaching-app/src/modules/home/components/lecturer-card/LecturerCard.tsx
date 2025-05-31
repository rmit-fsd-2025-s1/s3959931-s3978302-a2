import React from "react";
import Image from "next/image";
import styles from "./LecturerCard.module.css";
import type { Lecturer } from "@/shared/types/lecturer"; // Assuming a Lecturer type will be defined

interface LecturerCardProps {
  lecturer: Lecturer;
  onOpenModal: (lecturerId: string) => void;
  // index is passed to get a unique image, ideally image path would be part of lecturer data
  imageIndex: number;
}

const LecturerCard: React.FC<LecturerCardProps> = ({
  lecturer,
  onOpenModal,
  imageIndex,
}) => {
  return (
    <div
      className={`${styles.lecturerCard} lecturer${imageIndex + 1}`}
      onClick={() => onOpenModal(lecturer.id)}
    >
      <div>
        <div className={styles.lecturerImageContainer}>
          <Image
            src={`/lecturers/lecturer-${imageIndex + 1}.jpg`}
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
      <button
        className={styles.moreInfoBtn}
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal(lecturer.id);
        }}
      >
        More Information
      </button>
    </div>
  );
};

export default LecturerCard;
