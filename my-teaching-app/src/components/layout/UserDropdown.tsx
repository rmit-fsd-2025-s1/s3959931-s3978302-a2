// src/components/layout/UserDropdown.tsx
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface UserDropdownProps {
    user: {
        fullName: string;
        email: string;
        role: string;
        avatarNumber?: number;
    };
    onSignOut: () => void;
    onToggleDarkMode: () => void;
    isDarkMode: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onSignOut, onToggleDarkMode, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Determine avatar number based on name if not provided
    const getAvatarNumber = () => {
        if (user.avatarNumber) return user.avatarNumber;

        // Generate a consistent avatar number based on email
        const emailHash = user.email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

        return (emailHash % 6) + 1;
    };

    // Toggle dropdown
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const dropdownVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: {
                duration: 0.2,
            },
        },
    };

    // Split name into parts for styling
    const nameParts = user.fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    return (
        <div className="user-dropdown-container" ref={dropdownRef}>
            {/* Avatar Button */}
            <div className="avatar-button" onClick={toggleDropdown}>
                <div className="avatar-wrapper">
                    <Image src={`/avatars/avatar-${getAvatarNumber()}.jpg`} alt={user.fullName} width={40} height={40} className="avatar-image" />
                    {isOpen && (
                        <>
                            <div className="avatar-connector"></div>
                            <div className="avatar-connector-2"></div>
                        </>
                    )}
                </div>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div className="user-dropdown-menu" variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                        <div className="dropdown-header">
                            <Image
                                src={`/avatars/avatar-${getAvatarNumber()}.jpg`}
                                alt={user.fullName}
                                width={60}
                                height={60}
                                className="dropdown-avatar"
                            />
                            <div className="user-info">
                                <h3 className="user-name">
                                    <span className="first-name">{firstName}</span>
                                    {lastName && <span className="last-name"> {lastName}</span>}
                                </h3>
                                <p className="user-email">{user.email}</p>
                                <div className="user-role">{user.role}</div>
                            </div>
                            <button className="close-button" onClick={() => setIsOpen(false)} aria-label="Close dropdown">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="dropdown-content">
                            {/* Actions Row - Dark Mode Toggle and Sign Out on same row */}
                            <div className="actions-row">
                                {/* Theme Toggle */}
                                <div className="theme-toggle-container">
                                    <div className="theme-toggle-label">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="theme-icon light"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                            />
                                        </svg>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="theme-icon dark"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                            />
                                        </svg>
                                    </div>

                                    <div
                                        className={`theme-toggle ${isDarkMode ? "active" : ""}`}
                                        onClick={onToggleDarkMode}
                                        aria-label="Toggle dark mode">
                                        <div className="toggle-handle"></div>
                                    </div>
                                </div>

                                {/* Sign Out Button */}
                                <button className="sign-out-button" onClick={onSignOut}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="action-icon"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDropdown;
