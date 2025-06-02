import React from "react";
import { render, screen } from "@testing-library/react";
import CourseGrid from "../../../src/modules/tutor/components/course-grid/CourseGrid";
import type { CourseDetails } from "../../../src/shared/types/courseTypes";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock the CourseCard component
jest.mock(
  "../../../src/modules/tutor/components/course-card/course-card",
  () => {
    return function MockCourseCard({ course }: { course: CourseDetails }) {
      return (
        <div data-testid={`course-card-${course.code}`}>{course.name}</div>
      );
    };
  }
);

describe("CourseGrid", () => {
  const mockProps = {
    isLoading: false,
    filteredCourses: [] as CourseDetails[],
    existingApplications: [],
    searchQuery: "",
    activeFilter: "all" as const,
    onApplyToCourse: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays no courses message without image when no courses found", () => {
    render(<CourseGrid {...mockProps} />);

    // Should display the heading
    expect(screen.getByText("No courses found")).toBeInTheDocument();

    // Should display the appropriate message
    expect(
      screen.getByText("No available courses at the moment")
    ).toBeInTheDocument();

    // Should NOT display an image
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByAltText("No courses found")).not.toBeInTheDocument();
  });

  test("displays appropriate message for search query", () => {
    const propsWithSearch = {
      ...mockProps,
      searchQuery: "JavaScript",
    };

    render(<CourseGrid {...propsWithSearch} />);

    expect(screen.getByText("No courses found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search or filters")
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("displays appropriate message for applied filter", () => {
    const propsWithFilter = {
      ...mockProps,
      activeFilter: "applied" as const,
    };

    render(<CourseGrid {...propsWithFilter} />);

    expect(screen.getByText("No courses found")).toBeInTheDocument();
    expect(
      screen.getByText("You haven't applied to any courses yet")
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("displays loading state", () => {
    const loadingProps = {
      ...mockProps,
      isLoading: true,
    };

    render(<CourseGrid {...loadingProps} />);

    expect(screen.getByText("Loading courses...")).toBeInTheDocument();
    expect(screen.queryByText("No courses found")).not.toBeInTheDocument();
  });

  test("renders courses when available", () => {
    const coursesProps = {
      ...mockProps,
      filteredCourses: [
        {
          code: "COSC1111",
          name: "Computing Technology And Programming",
          role: "Tutor" as const,
          availability: "Part Time" as const,
          skills: ["JavaScript", "Python"],
        },
      ] as CourseDetails[],
    };

    render(<CourseGrid {...coursesProps} />);

    expect(screen.queryByText("No courses found")).not.toBeInTheDocument();
    expect(screen.queryByText("Loading courses...")).not.toBeInTheDocument();

    // Should render the course card
    expect(screen.getByTestId("course-card-COSC1111")).toBeInTheDocument();
    expect(
      screen.getByText("Computing Technology And Programming")
    ).toBeInTheDocument();
  });
});
