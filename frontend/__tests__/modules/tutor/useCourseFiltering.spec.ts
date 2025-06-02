import { renderHook, act } from "@testing-library/react";
import { useCourseFiltering } from "../../../src/modules/tutor/hooks/useCourseFiltering";
import type { CourseDetails } from "../../../src/shared/types/courseTypes";

// Mock the courseHelpers module
jest.mock("../../../src/modules/tutor/utils/courseHelpers", () => ({
  getCoursesWithDetails: jest.fn(() => [
    {
      code: "COSC1111",
      name: "Computing Technology And Programming",
      role: "Tutor" as const,
      availability: "Part Time" as const,
      skills: ["JavaScript", "Python", "React"],
    },
    {
      code: "COSC2758",
      name: "Full Stack Development",
      role: "Lab-Assistant" as const,
      availability: "Full Time" as const,
      skills: ["TypeScript", "Node.js", "MongoDB"],
    },
    {
      code: "COSC2413",
      name: "Web Programming",
      role: "Tutor" as const,
      availability: "Part Time" as const,
      skills: ["HTML/CSS", "JavaScript", "React"],
    },
  ]),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

describe("useCourseFiltering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  test("should filter courses by skills", () => {
    const { result } = renderHook(() => useCourseFiltering([]));

    // Test searching for JavaScript skill
    act(() => {
      result.current.setSearchQuery("JavaScript");
    });

    expect(result.current.filteredCourses).toHaveLength(2);
    expect(result.current.filteredCourses[0].code).toBe("COSC1111");
    expect(result.current.filteredCourses[1].code).toBe("COSC2413");
  });

  test("should filter courses by partial skill match", () => {
    const { result } = renderHook(() => useCourseFiltering([]));

    // Test searching for partial skill name
    act(() => {
      result.current.setSearchQuery("Type");
    });

    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].code).toBe("COSC2758");
    expect(result.current.filteredCourses[0].skills).toContain("TypeScript");
  });

  test("should filter courses by course code", () => {
    const { result } = renderHook(() => useCourseFiltering([]));

    act(() => {
      result.current.setSearchQuery("COSC1111");
    });

    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].code).toBe("COSC1111");
  });

  test("should filter courses by course name", () => {
    const { result } = renderHook(() => useCourseFiltering([]));

    act(() => {
      result.current.setSearchQuery("Full Stack");
    });

    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].code).toBe("COSC2758");
  });

  test("should filter courses by role", () => {
    const { result } = renderHook(() => useCourseFiltering([]));

    act(() => {
      result.current.setSearchQuery("Lab-Assistant");
    });

    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].role).toBe("Lab-Assistant");
  });

  test("should filter courses by availability", () => {
    const { result } = renderHook(() => useCourseFiltering([]));

    act(() => {
      result.current.setSearchQuery("Full Time");
    });

    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].availability).toBe("Full Time");
  });

  test("should return empty array for non-matching search", () => {
    const { result } = renderHook(() => useCourseFiltering([]));

    act(() => {
      result.current.setSearchQuery("NonExistentSkill");
    });

    expect(result.current.filteredCourses).toHaveLength(0);
  });

  test("should filter by application status", () => {
    const existingApplications = ["COSC1111"];
    const { result } = renderHook(() =>
      useCourseFiltering(existingApplications)
    );

    // Test "applied" filter
    act(() => {
      result.current.setActiveFilter("applied");
    });

    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].code).toBe("COSC1111");

    // Test "available" filter
    act(() => {
      result.current.setActiveFilter("available");
    });

    expect(result.current.filteredCourses).toHaveLength(2);
    expect(
      result.current.filteredCourses.every(
        (course) => course.code !== "COSC1111"
      )
    ).toBe(true);
  });

  test("should combine search and filter", () => {
    const existingApplications = ["COSC1111"];
    const { result } = renderHook(() =>
      useCourseFiltering(existingApplications)
    );

    // Search for React skill and filter for available courses
    act(() => {
      result.current.setSearchQuery("React");
      result.current.setActiveFilter("available");
    });

    // Should only return COSC2413 (has React skill and not applied)
    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].code).toBe("COSC2413");
  });

  test("should be case insensitive for skills search", () => {
    const { result } = renderHook(() => useCourseFiltering([]));

    act(() => {
      result.current.setSearchQuery("javascript");
    });

    expect(result.current.filteredCourses).toHaveLength(2);
    expect(
      result.current.filteredCourses.some((course) =>
        course.skills?.some((skill) =>
          skill.toLowerCase().includes("javascript")
        )
      )
    ).toBe(true);
  });
});
