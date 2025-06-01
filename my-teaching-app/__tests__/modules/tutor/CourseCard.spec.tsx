import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CourseCard from "@/modules/tutor/components/course-card/course-card";
import { CourseDetails } from "@/shared/types/course";

// Mock framer-motion to avoid issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    button: ({
      children,
      onClick,
      className,
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      children: React.ReactNode;
    }) => (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    ),
  },
}));

describe("CourseCard Component", () => {
  // Sample course data
  const mockCourse: CourseDetails = {
    code: "COMP1234",
    name: "Introduction to Programming",
    availability: "Full Time",
    role: "Tutor",
    skills: ["JavaScript", "React"],
  };

  const openApplyModalMock = jest.fn();

  // Test 1: Renders course information correctly
  test("renders course information correctly", () => {
    render(
      <CourseCard course={mockCourse} openApplyModal={openApplyModalMock} />
    );

    expect(screen.getByText("COMP1234")).toBeInTheDocument();
    expect(screen.getByText("Introduction to Programming")).toBeInTheDocument();
    expect(screen.getByText("Full Time")).toBeInTheDocument();
    expect(screen.getByText("Tutor")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  // Test 2: Renders Apply Now button when not applied
  test("renders Apply Now button when not applied", () => {
    render(
      <CourseCard course={mockCourse} openApplyModal={openApplyModalMock} />
    );

    expect(screen.getByText("Apply Now")).toBeInTheDocument();
    expect(screen.queryByText("Application Submitted")).not.toBeInTheDocument();
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
      <CourseCard course={mockCourse} openApplyModal={openApplyModalMock} />
    );

    const applyButton = screen.getByText("Apply Now");
    fireEvent.click(applyButton);

    expect(openApplyModalMock).toHaveBeenCalledWith(mockCourse);
  });
});
