"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
    HomeIcon,
    UsersIcon,
    AcademicCapIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    SunIcon,
    MoonIcon,
    ChevronDownIcon,
    DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import DarkModeToggle from "../DarkModeToggle";
import styles from "./AdminHeader.module.css";

interface AdminUser {
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    fullName: string;
}

interface AdminHeaderProps {
    user: AdminUser;
    onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onLogout }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
        { name: "Users", href: "/dashboard/users", icon: UsersIcon },
        { name: "Courses", href: "/dashboard/courses", icon: AcademicCapIcon },
        {
            name: "Reports",
            href: "/dashboard/reports",
            icon: DocumentChartBarIcon,
        },
    ];

    const handleLogout = () => {
        onLogout();
        setIsUserDropdownOpen(false);
    };

    const getUserInitials = () => {
        return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;
    };

    return (
        <header
            className={`${styles.adminHeader} ${
                isScrolled ? styles.scrolled : ""
            }`}
        >
            <div className={styles.headerContainer}>
                <div className={styles.headerGrid}>
                    {/* Logo Section */}
                    <div className={styles.logoWrapper}>
                        <Link href="/dashboard" className={styles.logoLink}>
                            <div className={styles.logoContainer}>
                                <div className={styles.logoImageContainer}>
                                    <div className={styles.logoCircle}>
                                        <span className={styles.logoText}>
                                            TT
                                        </span>
                                    </div>
                                </div>
                                <span className={styles.logoTitle}>
                                    <span className={styles.logoPrefix}>
                                        Admin
                                    </span>
                                    <span className={styles.logoSuffix}>
                                        Panel
                                    </span>
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className={styles.mainNav}>
                        <div className={styles.navLinks}>
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`${styles.navLink} ${
                                            isActive ? styles.active : ""
                                        }`}
                                    >
                                        <item.icon className={styles.navIcon} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Header Actions */}
                    <div className={styles.headerActions}>
                        {/* Dark Mode Toggle */}
                        <div className={styles.darkModeWrapper}>
                            <DarkModeToggle />
                        </div>

                        {/* User Dropdown */}
                        <div className={styles.userDropdown} ref={dropdownRef}>
                            <button
                                onClick={() =>
                                    setIsUserDropdownOpen(!isUserDropdownOpen)
                                }
                                className={styles.userButton}
                            >
                                <div className={styles.userAvatar}>
                                    <span className={styles.userInitials}>
                                        {getUserInitials()}
                                    </span>
                                </div>
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>
                                        {user.fullName ||
                                            `${user.firstName} ${user.lastName}`}
                                    </span>
                                    <span className={styles.userRole}>
                                        Admin
                                    </span>
                                </div>
                                <ChevronDownIcon
                                    className={`${styles.chevronIcon} ${
                                        isUserDropdownOpen ? styles.rotated : ""
                                    }`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isUserDropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <div className={styles.dropdownHeader}>
                                        <div className={styles.dropdownAvatar}>
                                            <span
                                                className={
                                                    styles.dropdownInitials
                                                }
                                            >
                                                {getUserInitials()}
                                            </span>
                                        </div>
                                        <div
                                            className={styles.dropdownUserInfo}
                                        >
                                            <h3
                                                className={
                                                    styles.dropdownUserName
                                                }
                                            >
                                                {user.fullName ||
                                                    `${user.firstName} ${user.lastName}`}
                                            </h3>
                                            <p
                                                className={
                                                    styles.dropdownUserEmail
                                                }
                                            >
                                                {user.email}
                                            </p>
                                            <span
                                                className={
                                                    styles.dropdownUserRole
                                                }
                                            >
                                                Administrator
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.dropdownContent}>
                                        <button
                                            onClick={handleLogout}
                                            className={`${styles.dropdownItem} ${styles.logoutItem}`}
                                        >
                                            <ArrowRightOnRectangleIcon
                                                className={
                                                    styles.dropdownItemIcon
                                                }
                                            />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
