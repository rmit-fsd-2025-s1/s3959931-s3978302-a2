import React from "react";
import styles from "./HeroSection.module.css"; // Import CSS module
// Assuming a shared Button component exists as per previous steps
import Button from "@/shared/components/common/Button/Button";

const HeroSection: React.FC = () => {
  return (
    <section className={styles.heroSection}>
      {/* Decorative elements (optional, based on CSS) */}
      <div
        className={`${styles.decorationCircle} ${styles.animateFloat}`}
        style={{
          top: "10%",
          left: "5%",
          backgroundColor: "var(--color-orange-400)",
        }}
      ></div>
      <div
        className={`${styles.decorationCircleOutline} ${styles.animateSlowSpin}`}
        style={{ top: "20%", right: "10%" }}
      ></div>
      <div
        className={`${styles.decorationGradientCircle} ${styles.animateFloatDelayed}`}
        style={{ bottom: "10%", left: "15%" }}
      ></div>

      <div className={`${styles.container} container`}>
        {" "}
        {/* Using both module and global container class for layout */}
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.highlightText}>EduTeach</span>{" "}
            Platform
          </h1>
          <p className={styles.heroSubtitle}>
            Your gateway to advanced learning and collaborative teaching
            experiences. Discover courses, engage with lecturers, and enhance
            your skills.
          </p>
          <div className={styles.heroActions}>
            <Button variant="primary" className={styles.heroButton}>
              Explore Courses
            </Button>
            <Button variant="outline" className={styles.heroButton}>
              Learn More
            </Button>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          {/* Placeholder for an image or illustration */}
          {/* You might use an <Image> component from Next.js here */}
          <img
            src="/university-classroom.svg" // Assuming image is in public folder
            alt="Learning environment illustration"
            className={styles.heroImage}
          />
          <div
            className={`${styles.decorationCircle} ${styles.animateFloat}`}
            style={{
              bottom: "5%",
              right: "5%",
              width: "1rem",
              height: "1rem",
              backgroundColor: "var(--color-teal-400)",
              opacity: 0.8,
            }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
