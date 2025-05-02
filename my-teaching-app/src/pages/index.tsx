import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Layout from "../components/layout/Layout";
import Head from "next/head";
import { lecturers } from "../utils/lecturerUtils";

export default function Home() {
    const [activeModal, setActiveModal] = useState<string | null>(null);
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

    const openModal = (lecturerId: string): void => {
        setActiveModal(lecturerId);
        document.body.style.overflow = "hidden";
    };

    const closeModal = (): void => {
        setActiveModal(null);
        document.body.style.overflow = "";
    };

    // Close modal when clicking outside
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
            closeModal();
        }
    };

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent): void => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);


    return (
        <>
            <Head>
                <title>TeachTeam - Home | Find Tutor Positions</title>
            </Head>
            <Layout>
                {/* Hero Section */}
                <section className="hero-section" id="hero">
                    <div className="container mx-auto relative z-10">
                        {/* Decorative elements */}
                        <div className="absolute top-20 left-10 animate-pulse">
                            <div className="decoration-circle bg-orange-200"></div>
                        </div>
                        <div className="absolute bottom-10 right-20 animate-float">
                            <div className="decoration-circle-outline"></div>
                        </div>
                        <div className="absolute top-40 right-40">
                            <div className="decoration-gradient-circle animate-slow-spin"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[400px]">
                            <div>
                                <h1 className="hero-title">
                                    Apply & Join <br />
                                    The Best <br />
                                    Tutor Team
                                </h1>
                                <p className="hero-subtitle">
                                    Connect with the School of Computer Science and apply for tutor and lab-assistant positions
                                </p>
                                <Link href="#tutors-info" className="hero-btn scroll-link">
                                    Get Started
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                            </div>
                            <div className="hero-image-container relative">
                                <div className="pulse-background"></div>
                                <div className="image-wrapper relative z-10">
                                    <Image
                                        src="/university-classroom.svg"
                                        alt="University classroom"
                                        fill={true}
                                        priority
                                        sizes="(max-width: 768px) 100vw, 600px"
                                    />
                                </div>

                                {/* Floating elements */}
                                <div className="absolute top-10 -right-5 z-20 animate-float">
                                    <div className="floating-card">
                                        <div className="floating-icon-green">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-white"
                                                viewBox="0 0 20 20"
                                                fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">Top Tutors</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -left-20 z-20 animate-float-delayed">
                                    <div className="floating-card">
                                        <div className="floating-icon-blue">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-white"
                                                viewBox="0 0 20 20"
                                                fill="currentColor">
                                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">Academic Excellence</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="stats-container">
                        <div className="container mx-auto">
                            <div className="stats-card">
                                <div className="stats-section">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="stats-number">
                                                300<sup>+</sup>
                                            </div>
                                            <p
                                                className="text-gray-800 dark:text-gray-300 font-medium"
                                                style={{ color: "var(--color-text-primary)" }}>
                                                Active Users
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="stats-content">
                                    <p className="stats-text">We have over 300 satisfied and happy tutor applicants around the university</p>

                                    {/* Avatar row */}
                                    <div className="avatar-group">
                                        {[...Array(6)].map((_, i) => (
                                            <div className="avatar" key={i}>
                                                <Image src={`/avatars/avatar-${i + 1}.jpg`} alt="User avatar" width={36} height={36} />
                                            </div>
                                        ))}
                                        <div className="avatar plus-avatar flex items-center justify-center bg-orange-100 text-orange-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>

                                        <Link href="#tutors-info" className="ml-[24px]">
                                            <div className="more-button flex items-center justify-center bg-orange-500 text-white px-6 py-1 rounded-full text-sm font-medium">
                                                <div className="flex items-center justify-center w-full">
                                                    <span className="more-text pb-[4px]">Explore more</span>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 ml-1"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor">
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

                {/* Tutor Section */}
                <section className="section py-16" id="tutors-info" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                    <div className="container mx-auto">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-4xl font-bold mb-4 text-center" style={{ color: "var(--color-primary)" }}>
                                For Tutor Applicants
                            </h2>
                            <p className="text-center text-lg mb-12 max-w-3xl mx-auto" style={{ color: "var(--color-text-primary)" }}>
                                Join our team of exceptional tutors and help shape the next generation of computer science professionals. Follow these
                                simple steps to get started.
                            </p>

                            {/* Timeline Design */}
                            <div className="timeline-container">
                                <div className="timeline-item">
                                    <div className="timeline-title">Create Your Profile</div>
                                    <div className="timeline-description">
                                        Showcase your skills, academic credentials, and previous teaching experience to stand out from other
                                        applicants.
                                    </div>
                                    <ul className="timeline-features">
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Academic qualifications visibility</span>
                                        </li>
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Skills showcase with verification</span>
                                        </li>
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Teaching experience highlights</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="timeline-item">
                                    <div className="timeline-title">Apply for Positions</div>
                                    <div className="timeline-description">
                                        Browse available courses and apply for tutor and lab-assistant roles that match your expertise and
                                        availability.
                                    </div>
                                    <ul className="timeline-features">
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Course-specific applications</span>
                                        </li>
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Flexible scheduling options</span>
                                        </li>
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Tailored cover letters</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="timeline-item">
                                    <div className="timeline-title">Get Selected</div>
                                    <div className="timeline-description">
                                        Lecturers review your profile and select candidates that best fit their course requirements.
                                    </div>
                                    <ul className="timeline-features">
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Real-time application status</span>
                                        </li>
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Direct communication with lecturers</span>
                                        </li>
                                        <li>
                                            <span className="feature-icon">✓</span>
                                            <span>Personalized feedback on applications</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="text-center mt-12">
                                {!isLoggedIn ? (
                                    <Link
                                        href="/signin"
                                        className="btn-primary px-8 py-3 rounded-lg text-lg font-medium inline-block transition-all hover:shadow-lg">
                                        Apply as a Tutor
                                    </Link>
                                ) : userRole === "tutor" ? (
                                    <Link
                                        href="/tutor"
                                        className="btn-primary px-8 py-3 rounded-lg text-lg font-medium inline-block transition-all hover:shadow-lg">
                                        Go to Tutor Dashboard
                                    </Link>
                                ) : null /* Lecturer sees nothing */}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Lecturer Section */}
                <section className="section py-16" style={{ backgroundColor: "var(--color-bg-primary)" }}>
                    <div className="container mx-auto">
                        <div className="max-w-6xl mx-auto">
                            {/* Section title with decorative bar */}
                            <div className="section-title-container">
                                <div className="section-title-bar"></div>
                                <div className="section-title-content">
                                    <h2>Meet Our Lecturers</h2>
                                    <p>
                                        Meet our exceptional team of computer science lecturers who bring real-world experience and academic
                                        excellence to our programs.
                                    </p>
                                </div>
                            </div>

                            {/* Lecturer Grid */}
                            <div className="lecturer-grid">
                                {lecturers.map((lecturer, index) => (
                                    <div key={lecturer.id} className={`lecturer-card lecturer${index + 1}`} onClick={() => openModal(lecturer.id)}>
                                        <div className="lecturer-image-container">
                                            <Image
                                                src={`/lecturers/lecturer-${index + 1}.jpg`}
                                                alt={lecturer.name}
                                                width={400}
                                                height={400}
                                                className="lecturer-image"
                                            />
                                            <div className="lecturer-decoration"></div>
                                        </div>
                                        <h3 className="lecturer-name">{lecturer.name}</h3>
                                        <p className="lecturer-title">{lecturer.title}</p>
                                        <p className="lecturer-specialization">{lecturer.specialization}</p>
                                        <button className="more-info-btn">More Information</button>
                                    </div>
                                ))}
                            </div>

                            {/* Modal for each lecturer */}
                            {lecturers.map((lecturer, index) => (
                                <div
                                    key={`${lecturer.id}-modal`}
                                    className={`modal-overlay ${activeModal === lecturer.id ? "active" : ""}`}
                                    onClick={handleOverlayClick}>
                                    <div className="modal-container">
                                        <div className="modal-image-section">
                                            <div className="modal-image-container">
                                                <Image
                                                    src={`/lecturers/lecturer-${index + 1}.jpg`}
                                                    alt={lecturer.name}
                                                    width={400}
                                                    height={400}
                                                    className="lecturer-image"
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-content">
                                            <div className="modal-close" onClick={closeModal}>
                                                ✕
                                            </div>
                                            <h3 className="modal-title">{lecturer.name}</h3>
                                            <p className="modal-subtitle">
                                                {lecturer.title} in {lecturer.specialization}
                                            </p>
                                            <p className="modal-text">{lecturer.bio}</p>
                                            <ul className="modal-info-list">
                                                <li className="modal-info-item">
                                                    <span className="modal-info-icon">📚</span>
                                                    <span>Teaches: {lecturer.courses}</span>
                                                </li>
                                                {lecturer.awards && (
                                                    <li className="modal-info-item">
                                                        <span className="modal-info-icon">🏆</span>
                                                        <span>Awards: {lecturer.awards}</span>
                                                    </li>
                                                )}
                                                {lecturer.experience && (
                                                    <li className="modal-info-item">
                                                        <span className="modal-info-icon">🏢</span>
                                                        <span>Industry Experience: {lecturer.experience}</span>
                                                    </li>
                                                )}
                                                {lecturer.certifications && (
                                                    <li className="modal-info-item">
                                                        <span className="modal-info-icon">🔰</span>
                                                        <span>Certifications: {lecturer.certifications}</span>
                                                    </li>
                                                )}
                                                {lecturer.publications && (
                                                    <li className="modal-info-item">
                                                        <span className="modal-info-icon">📖</span>
                                                        <span>Publications: {lecturer.publications}</span>
                                                    </li>
                                                )}
                                                <li className="modal-info-item">
                                                    <span className="modal-info-icon">📧</span>
                                                    <span>Contact: {lecturer.contact}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
}
