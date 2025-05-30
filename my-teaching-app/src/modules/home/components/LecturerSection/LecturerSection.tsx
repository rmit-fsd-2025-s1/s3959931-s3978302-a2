import React from "react";
import styles from "./LecturerSection.module.css";
import SectionTitle from "../common/SectionTitle/SectionTitle"; // Assuming SectionTitle is in a common folder within home module
import Card from "@/shared/components/common/Card/Card"; // Shared Card component
// import LecturerModal from './LecturerModal'; // Assuming a modal for lecturer details might exist or be created

// Dummy data for lecturers - replace with actual data source
const lecturersData = [
  {
    id: 1,
    name: "Dr. Evelyn Reed",
    title: "Senior Lecturer, Computer Science",
    imageUrl: "/lecturers/lecturer-1.jpg",
    bio: "Expert in AI and Machine Learning with over 10 years of teaching experience. Passionate about innovative teaching methods.",
    department: "AI & Robotics",
    email: "evelyn.reed@example.com",
    office: "B402, Tech Park",
  },
  {
    id: 2,
    name: "Prof. Samuel Green",
    title: "Professor, Software Engineering",
    imageUrl: "/lecturers/lecturer-2.jpg",
    bio: "Specializes in software architecture and agile development. Published numerous papers on scalable systems.",
    department: "Software Systems",
    email: "samuel.green@example.com",
    office: "A105, Main Building",
  },
  {
    id: 3,
    name: "Dr. Aisha Khan",
    title: "Associate Professor, Data Science",
    imageUrl: "/lecturers/lecturer-3.jpg",
    bio: "Focuses on big data analytics and visualization. Enjoys mentoring students on research projects.",
    department: "Data Analytics",
    email: "aisha.khan@example.com",
    office: "C210, Innovation Hub",
  },
  {
    id: 4,
    name: "Dr. Marcus Bae",
    title: "Lecturer, Cybersecurity",
    imageUrl: "/lecturers/lecturer-4.jpg",
    bio: "Cybersecurity expert with a background in ethical hacking and network security. Committed to practical learning.",
    department: "Network & Security",
    email: "marcus.bae@example.com",
    office: "D303, Security Center",
  },
  // Add more lecturers as needed
];

interface Lecturer {
  id: number;
  name: string;
  title: string;
  imageUrl: string;
  bio: string;
  department: string;
  email: string;
  office: string;
}

const LecturerCard: React.FC<{ lecturer: Lecturer; onClick: () => void }> = ({
  lecturer,
  onClick,
}) => {
  return (
    <Card className={styles.lecturerCard} onClick={onClick}>
      <div className={styles.lecturerImageContainer}>
        <img
          src={lecturer.imageUrl}
          alt={lecturer.name}
          className={styles.lecturerImage}
        />
        <div className={styles.lecturerHoverOverlay}>
          <span className={styles.lecturerViewProfile}>View Profile</span>
        </div>
      </div>
      <h3 className={styles.lecturerName}>{lecturer.name}</h3>
      <p className={styles.lecturerTitle}>{lecturer.title}</p>
      <p className={styles.lecturerDepartment}>{lecturer.department}</p>
    </Card>
  );
};

const LecturerSection: React.FC = () => {
  // const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(
  //   null
  // );

  // const openModal = (lecturer: Lecturer) => setSelectedLecturer(lecturer);
  // const closeModal = () => setSelectedLecturer(null);

  return (
    <section className={`section ${styles.lecturerSectionContainer}`}>
      {" "}
      {/* Using global section class */}
      <div className="container">
        {" "}
        {/* Using global container class */}
        <SectionTitle
          title="Meet Our Lecturers"
          subtitle="Dedicated professionals shaping the future of tech. Learn from experts in various fields of computer science."
        />
        <div className={styles.lecturerGrid}>
          {lecturersData.map((lecturer) => (
            <LecturerCard
              key={lecturer.id}
              lecturer={lecturer}
              onClick={() => alert(`Clicked on ${lecturer.name}`)} // Replace with modal opening logic
              // onClick={() => openModal(lecturer)}
            />
          ))}
        </div>
      </div>
      {/* {selectedLecturer && <LecturerModal lecturer={selectedLecturer} onClose={closeModal} />} */}
    </section>
  );
};

export default LecturerSection;
