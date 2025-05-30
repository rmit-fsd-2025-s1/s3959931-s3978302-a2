import {
  availableCourses,
  getRandomRole,
  getRandomAvailability,
  getCoursesWithDetails,
  getCourseByCode,
  searchCourses,
} from "@/modules/course/utils/courseDisplay.utils";

describe("Course Utilities", () => {
  // Test 1: Confirm availableCourses contains the expected data
  test("availableCourses contains expected course data", () => {
    // Check array length
    expect(availableCourses.length).toBeGreaterThan(0);

    // Check structure of first item
    expect(availableCourses[0]).toHaveProperty("code");
    expect(availableCourses[0]).toHaveProperty("name");

    // Check specific courses exist
    const courseExists = availableCourses.some(
      (course) => course.code === "COSC1111"
    );
    expect(courseExists).toBe(true);
  });

  // Test 2: getRandomRole returns either Tutor or Lab-Assistant
  test("getRandomRole returns either Tutor or Lab-Assistant", () => {
    // Mock Math.random to test both branches
    const originalRandom = Math.random;

    // Test Tutor case
    Math.random = jest.fn().mockReturnValue(0.7);
    expect(getRandomRole()).toBe("Tutor");

    // Test Lab-Assistant case
    Math.random = jest.fn().mockReturnValue(0.3);
    expect(getRandomRole()).toBe("Lab-Assistant");

    // Restore original Math.random
    Math.random = originalRandom;
  });

  // Test 3: getRandomAvailability returns either Part Time or Full Time
  test("getRandomAvailability returns either Part Time or Full Time", () => {
    // Mock Math.random to test both branches
    const originalRandom = Math.random;

    // Test Part Time case
    Math.random = jest.fn().mockReturnValue(0.7);
    expect(getRandomAvailability()).toBe("Part Time");

    // Test Full Time case
    Math.random = jest.fn().mockReturnValue(0.3);
    expect(getRandomAvailability()).toBe("Full Time");

    // Restore original Math.random
    Math.random = originalRandom;
  });

  // Test 4: getCoursesWithDetails returns courses with role and availability
  test("getCoursesWithDetails returns courses with role and availability", () => {
    const coursesWithDetails = getCoursesWithDetails();

    // Should have same length as availableCourses
    expect(coursesWithDetails.length).toBe(availableCourses.length);

    // Each course should have role and availability properties
    coursesWithDetails.forEach((course) => {
      expect(course).toHaveProperty("code");
      expect(course).toHaveProperty("name");
      expect(course).toHaveProperty("role");
      expect(course).toHaveProperty("availability");

      // Check that role is either Tutor or Lab-Assistant
      expect(["Tutor", "Lab-Assistant"]).toContain(course.role);

      // Check that availability is either Part Time or Full Time
      expect(["Part Time", "Full Time"]).toContain(course.availability);
    });
  });

  // Test 5: getCourseByCode returns correct course for valid code
  test("getCourseByCode returns correct course for valid code", () => {
    const course = getCourseByCode("COSC1111");

    expect(course).toBeDefined();
    expect(course?.code).toBe("COSC1111");
    expect(course?.name).toBe("Computing Technology And Programming");
  });

  // Test 6: getCourseByCode returns undefined for invalid code
  test("getCourseByCode returns undefined for invalid code", () => {
    const course = getCourseByCode("NONEXISTENT");
    expect(course).toBeUndefined();
  });

  // Test 7: searchCourses finds courses by code or name
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
