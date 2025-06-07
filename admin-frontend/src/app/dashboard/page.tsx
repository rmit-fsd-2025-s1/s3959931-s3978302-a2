"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { GET_USER_STATS, GET_ALL_COURSES } from "@/lib/graphql/queries";
import {
    UsersIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    CpuChipIcon,
    CloudIcon,
} from "@heroicons/react/24/outline";
import styles from "./admin-dashboard.module.css";

export default function Dashboard() {
    const { data: userStats, loading: userStatsLoading } =
        useQuery(GET_USER_STATS);
    const { data: coursesData, loading: coursesLoading } =
        useQuery(GET_ALL_COURSES);

    const stats = [
        {
            name: "Total Users",
            value: userStats?.getUserStats?.totalUsers || 0,
            icon: UsersIcon,
            color: "blue",
            trend: "+12%",
        },
        {
            name: "Candidates",
            value: userStats?.getUserStats?.totalCandidates || 0,
            icon: UserGroupIcon,
            color: "green",
            trend: "+8%",
        },
        {
            name: "Lecturers",
            value: userStats?.getUserStats?.totalLecturers || 0,
            icon: AcademicCapIcon,
            color: "purple",
            trend: "+5%",
        },
        {
            name: "Blocked Users",
            value: userStats?.getUserStats?.blockedUsers || 0,
            icon: ExclamationTriangleIcon,
            color: "red",
            trend: "-2%",
        },
    ];

    const courses = coursesData?.getAllCourses || [];

    const systemStatus = [
        {
            name: "Database",
            status: "Connected",
            icon: CloudIcon,
            color: "green",
        },
        {
            name: "GraphQL API",
            status: "Online",
            icon: CpuChipIcon,
            color: "green",
        },
        {
            name: "Admin Panel",
            status: "Active",
            icon: CheckCircleIcon,
            color: "green",
        },
    ];

    return (
        <div className={styles.adminDashboard}>
            <div className={styles.dashboardContainer}>
                {/* Header Section */}
                <div className={styles.headerSection}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Admin Dashboard</h1>
                        <p className={styles.subtitle}>
                            Welcome to the Teaching Tutor administration panel
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    {stats.map((stat) => (
                        <div
                            key={stat.name}
                            className={`${styles.statCard} ${
                                styles[stat.color]
                            }`}
                        >
                            <div className={styles.statContent}>
                                <div className={styles.statIconWrapper}>
                                    <stat.icon className={styles.statIcon} />
                                </div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statHeader}>
                                        <h3 className={styles.statValue}>
                                            {userStatsLoading ? (
                                                <div
                                                    className={
                                                        styles.loadingSkeleton
                                                    }
                                                ></div>
                                            ) : (
                                                stat.value
                                            )}
                                        </h3>
                                        <span className={styles.statTrend}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <p className={styles.statLabel}>
                                        {stat.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className={styles.contentGrid}>
                    {/* Courses Overview */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>
                                Courses Overview
                            </h3>
                            <div className={styles.cardBadge}>
                                {courses.length} Total
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            {coursesLoading ? (
                                <div className={styles.loadingContainer}>
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={styles.loadingItem}
                                        >
                                            <div
                                                className={
                                                    styles.loadingSkeleton
                                                }
                                            ></div>
                                            <div
                                                className={
                                                    styles.loadingSkeletonSmall
                                                }
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.coursesList}>
                                    {courses.slice(0, 5).map((course: any) => (
                                        <div
                                            key={course.id}
                                            className={styles.courseItem}
                                        >
                                            <div className={styles.courseInfo}>
                                                <h4
                                                    className={
                                                        styles.courseTitle
                                                    }
                                                >
                                                    {course.courseCode} -{" "}
                                                    {course.courseName}
                                                </h4>
                                                <p
                                                    className={
                                                        styles.courseSemester
                                                    }
                                                >
                                                    {course.semester}
                                                </p>
                                            </div>
                                            <div className={styles.courseStats}>
                                                <div
                                                    className={
                                                        styles.courseStat
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.courseStatValue
                                                        }
                                                    >
                                                        {course
                                                            .courseAssignments
                                                            ?.length || 0}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.courseStatLabel
                                                        }
                                                    >
                                                        lecturers
                                                    </span>
                                                </div>
                                                <div
                                                    className={
                                                        styles.courseStat
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.courseStatValue
                                                        }
                                                    >
                                                        {course.applications
                                                            ?.length || 0}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.courseStatLabel
                                                        }
                                                    >
                                                        applications
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {courses.length === 0 && (
                                        <div className={styles.emptyState}>
                                            <AcademicCapIcon
                                                className={styles.emptyIcon}
                                            />
                                            <p className={styles.emptyText}>
                                                No courses available
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Quick Actions</h3>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.actionsList}>
                                <Link
                                    href="/dashboard/users"
                                    className={styles.actionItem}
                                >
                                    <div className={styles.actionIcon}>
                                        <UsersIcon
                                            className={styles.actionIconSvg}
                                        />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <h4 className={styles.actionTitle}>
                                            Manage Users
                                        </h4>
                                        <p className={styles.actionDescription}>
                                            Block/unblock and delete users
                                        </p>
                                    </div>
                                    <div className={styles.actionArrow}>→</div>
                                </Link>
                                <Link
                                    href="/dashboard/courses"
                                    className={styles.actionItem}
                                >
                                    <div className={styles.actionIcon}>
                                        <AcademicCapIcon
                                            className={styles.actionIconSvg}
                                        />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <h4 className={styles.actionTitle}>
                                            Manage Courses
                                        </h4>
                                        <p className={styles.actionDescription}>
                                            CRUD courses and assign lecturers
                                        </p>
                                    </div>
                                    <div className={styles.actionArrow}>→</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className={styles.systemStatusSection}>
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>System Status</h3>
                            <div className={styles.statusBadge}>
                                <span className={styles.statusDot}></span>
                                All Systems Operational
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.systemGrid}>
                                {systemStatus.map((system) => (
                                    <div
                                        key={system.name}
                                        className={styles.systemItem}
                                    >
                                        <div className={styles.systemIcon}>
                                            <system.icon
                                                className={styles.systemIconSvg}
                                            />
                                        </div>
                                        <div className={styles.systemInfo}>
                                            <h4 className={styles.systemName}>
                                                {system.name}
                                            </h4>
                                            <p className={styles.systemStatus}>
                                                {system.status}
                                            </p>
                                        </div>
                                        <div className={styles.systemIndicator}>
                                            <div
                                                className={`${
                                                    styles.statusIndicator
                                                } ${styles[system.color]}`}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
