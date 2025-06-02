import { getCourseByCode, searchCourses } from "@/shared/utils/courseUtils";
import { availableCourses } from "@/shared/data/courses";

describe("Shared Course Utilities", () => {
  // Test 1: getCourseByCode returns correct course for valid code
  test("getCourseByCode returns correct course for valid code", () => {
    const course = getCourseByCode("COSC1111");

    expect(course).toBeDefined();
    expect(course?.code).toBe("COSC1111");
    expect(course?.name).toBe("Computing Technology And Programming");
  });

  // Test 2: getCourseByCode returns undefined for invalid code
  test("getCourseByCode returns undefined for invalid code", () => {
    const course = getCourseByCode("NONEXISTENT");
    expect(course).toBeUndefined();
  });

  // Test 3: searchCourses finds courses by code or name
  test("searchCourses finds courses by code or name", () => {
    // Search by code
    const resultsByCode = searchCourses("COSC1111");
    expect(resultsByCode.length).toBeGreaterThan(0);
    expect(resultsByCode[0].code).toBe("COSC1111");

    // Search by partial code
    const resultsByPartialCode = searchCourses("COSC");
    expect(resultsByPartialCode.length).toBe(availableCourses.length);

    // Search by name (case insensitive)
    const resultsByName = searchCourses("programming");
    expect(resultsByName.length).toBeGreaterThan(0);
    expect(
      resultsByName.some((course) =>
        course.name.toLowerCase().includes("programming")
      )
    ).toBe(true);

    // Search with no matches
    const noResults = searchCourses("NONEXISTENT123");
    expect(noResults.length).toBe(0);
  });
});
