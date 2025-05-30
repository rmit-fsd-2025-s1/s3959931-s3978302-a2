import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./HomeStats.module.css";

// TODO: Fetch actual number of active users or make it configurable
const ACTIVE_USERS = 300;

const HomeStats: React.FC = () => {
  return (
    <div className={styles.statsContainer}>
      <div className="container mx-auto">
        {" "}
        {/* Tailwind for centering */}
        <div className={styles.statsCard}>
          <div className={styles.statsSection}>
            <div className="flex items-center">
              {" "}
              {/* Tailwind for alignment */}
              <div>
                <div className={styles.statsNumber}>
                  {ACTIVE_USERS}
                  <sup>+</sup>
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
              We have over {ACTIVE_USERS} satisfied and happy tutor applicants
              around the university
            </p>
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
                {" "}
                {/* Tailwind class */}
                <div className="more-button flex items-center justify-center bg-orange-500 text-white px-6 py-1 rounded-full text-sm font-medium">
                  {" "}
                  {/* Tailwind class */}
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
  );
};

export default HomeStats;
