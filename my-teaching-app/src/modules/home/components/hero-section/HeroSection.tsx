import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = "" }) => {
  return (
    <section className={`${styles.heroSection} ${className}`} id="hero">
      <div className="container mx-auto relative z-10">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 animate-pulse">
          <div className={`${styles.decorationCircle} bg-orange-200`}></div>
        </div>
        <div className={`absolute bottom-10 right-20 ${styles.animateFloat}`}>
          <div className={styles.decorationCircleOutline}></div>
        </div>
        <div className="absolute top-40 right-40">
          <div
            className={`${styles.decorationGradientCircle} ${styles.animateSlowSpin}`}
          ></div>
        </div>

        <div className={styles.heroGrid}>
          <div>
            <h1 className={styles.heroTitle}>
              Apply & Join <br />
              The Best <br />
              Tutor Team
            </h1>
            <p className={styles.heroSubtitle}>
              Connect with the School of Computer Science and apply for tutor
              and lab-assistant positions
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
          <div className={`${styles.heroImageContainer} relative`}>
            <div className={styles.pulseBackground}></div>
            <div className={`${styles.imageWrapper} relative z-10`}>
              <Image
                src="/university-classroom.svg"
                alt="University classroom"
                fill={true}
                priority
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>

            {/* Floating elements */}
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

      {/* Stats Section */}
      <div className={styles.statsContainer}>
        <div className="container mx-auto">
          <div className={styles.statsCard}>
            <div className={styles.statsSection}>
              <div className="flex items-center">
                <div>
                  <div className={styles.statsNumber}>
                    300<sup>+</sup>
                  </div>
                  <p
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Active Users
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.statsContent}>
              <p className={styles.statsText}>
                We have over 300 satisfied and happy tutor applicants around the
                university
              </p>

              {/* Avatar row */}
              <div className={styles.avatarGroup}>
                {[...Array(6)].map((_, i) => (
                  <div className={styles.avatar} key={i}>
                    <Image
                      src={`/avatars/avatar-${i + 1}.jpg`}
                      alt="User avatar"
                      width={36}
                      height={36}
                    />
                  </div>
                ))}
                <div
                  className={`${styles.avatar} ${styles.plusAvatar} flex items-center justify-center bg-orange-100 text-orange-500`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <Link href="#tutors-info" className="ml-[24px]">
                  <div
                    className={`${styles.moreButton} flex items-center justify-center bg-orange-500 text-white px-6 py-1 rounded-full text-sm font-medium`}
                  >
                    <div className="flex items-center justify-center w-full">
                      <span className={`${styles.moreText} pb-[4px]`}>
                        Explore more
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
