import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CourseCard from "./CourseCard";
import { CourseWithDetails } from "../../utils/coursesUtils";

// Mock framer-motion to avoid issues in tests
jest.mock("framer-motion", () => ({
    motion: {
        button: ({ children, onClick, className }) => (
            <button onClick={onClick} className={className}>
                {children}
            </button>
        ),
    },
}));

describe("CourseCard Component", () => {
    // Sample course data
    const mockCourse: CourseWithDetails = {
        id: "course1",
        code: "COMP1234",
        name: "Introduction to Programming",
        availability: "Full Time",
        role: "Tutor",
        skills: ["JavaScript", "React"],
        description: "A course about programming",
        semester: "Semester 1, 2023",
        schedule: "Monday, 10:00 - 12:00",
        applications: [],
    };

    const openApplyModalMock = jest.fn();

    // Test 1: Renders course information correctly
    test("renders course information correctly", () => {
        render(
            <CourseCard
                course={mockCourse}
                openApplyModal={openApplyModalMock}
            />
        );

        expect(screen.getByText("COMP1234")).toBeInTheDocument();
        expect(
            screen.getByText("Introduction to Programming")
        ).toBeInTheDocument();
        expect(screen.getByText("Full Time")).toBeInTheDocument();
        expect(screen.getByText("Tutor")).toBeInTheDocument();
        expect(screen.getByText("JavaScript")).toBeInTheDocument();
        expect(screen.getByText("React")).toBeInTheDocument();
    });

    // Test 2: Renders Apply Now button when not applied
    test("renders Apply Now button when not applied", () => {
        render(
            <CourseCard
                course={mockCourse}
                openApplyModal={openApplyModalMock}
            />
        );

        expect(screen.getByText("Apply Now")).toBeInTheDocument();
        expect(
            screen.queryByText("Application Submitted")
        ).not.toBeInTheDocument();
    });

    // Test 3: Renders Applied status when already applied
    test("renders Applied status when already applied", () => {
        render(
            <CourseCard
                course={mockCourse}
                openApplyModal={openApplyModalMock}
                hasApplied={true}
            />
        );

        expect(screen.getByText("Applied")).toBeInTheDocument();
        expect(screen.getByText("Application Submitted")).toBeInTheDocument();
        expect(screen.queryByText("Apply Now")).not.toBeInTheDocument();
    });

    // Test 4: Calls openApplyModal when Apply Now button is clicked
    test("calls openApplyModal when Apply Now button is clicked", () => {
        render(
            <CourseCard
                course={mockCourse}
                openApplyModal={openApplyModalMock}
            />
        );

        const applyButton = screen.getByText("Apply Now");
        fireEvent.click(applyButton);

        expect(openApplyModalMock).toHaveBeenCalledWith(mockCourse);
    });

    // Test 5: Renders part-time status correctly
    test("renders part-time status with correct styling", () => {
        const partTimeCourse = { ...mockCourse, availability: "Part Time" };
        render(
            <CourseCard
                course={partTimeCourse}
                openApplyModal={openApplyModalMock}
            />
        );

        const statusElement = screen.getByText("Part Time");
        expect(statusElement).toBeInTheDocument();
        // Check for purple styling classes
        const statusContainer = statusElement.closest("span");
        expect(statusContainer).toHaveClass("course-status");
    });

    // Test 6: Renders correct icon for assistant role
    test("renders correct icon for assistant role", () => {
        const assistantCourse = { ...mockCourse, role: "Assistant" };
        render(
            <CourseCard
                course={assistantCourse}
                openApplyModal={openApplyModalMock}
            />
        );

        expect(screen.getByText("Assistant")).toBeInTheDocument();

        // Since we can't directly check SVG content easily, we can check for the role-icon class
        const roleIcon = screen
            .getByText("Assistant")
            .closest(".role-tag")
            ?.querySelector(".role-icon");
        expect(roleIcon).toHaveClass("assistant-role");
        expect(roleIcon).not.toHaveClass("tutor-role");
    });
});
