import {
    availableSkills,
    getRandomSkills,
    resetAllApplicationsToUnselected,
    initializeApplications,
    getApplications,
    moveUnassignedTutorsToUnselected,
    saveApplication,
    getApplicationByUserId,
    getApplicationById,
    getSelectedApplications,
    getApplicationsByCourse,
    searchApplications,
    TutorApplication,
} from "./tutorUtils";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

describe("Tutor Utilities", () => {
    // Sample applications for testing
    const sampleApplications: TutorApplication[] = [
        {
            id: "app1",
            userId: "user1",
            email: "user1@example.com",
            fullName: "User One",
            courses: ["COMP1111", "COMP2222"],
            previousRoles: ["Lab Assistant"],
            availability: "Full Time",
            skills: ["JavaScript", "React"],
            academicCredentials: "Bachelor of CS",
            dateApplied: "2023-01-01",
            selected: false,
        },
        {
            id: "app2",
            userId: "user2",
            email: "user2@example.com",
            fullName: "User Two",
            courses: ["COMP2222", "COMP3333"],
            previousRoles: ["Tutor"],
            availability: "Part Time",
            skills: ["Java", "Python"],
            academicCredentials: "Master of IT",
            dateApplied: "2023-02-01",
            selected: true,
            selectedBy: "lecturer1",
            selectedDate: "2023-03-01",
            selectedForCourses: ["COMP2222"],
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    // Test 1: getRandomSkills returns correct number of skills
    test("getRandomSkills returns 2-3 random skills", () => {
        const skills = getRandomSkills();
        expect(skills.length).toBeGreaterThanOrEqual(2);
        expect(skills.length).toBeLessThanOrEqual(3);

        // Check that all returned skills are from availableSkills
        skills.forEach((skill) => {
            expect(availableSkills).toContain(skill);
        });
    });

    // Test 2: getApplications returns applications from localStorage
    test("getApplications returns applications from localStorage", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );

        const applications = getApplications();
        expect(applications).toEqual(sampleApplications);
        expect(localStorageMock.getItem).toHaveBeenCalledWith("applications");
    });

    // Test 3: getApplications returns empty array if localStorage is empty
    test("getApplications returns empty array if localStorage is empty", () => {
        localStorageMock.getItem.mockReturnValueOnce(null);

        const applications = getApplications();
        expect(applications).toEqual([]);
    });

    // Test 4: getApplicationByUserId returns applications for a specific user
    test("getApplicationByUserId returns applications for a specific user", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );

        const applications = getApplicationByUserId("user1");
        expect(applications.length).toBe(1);
        expect(applications[0].id).toBe("app1");
    });

    // Test 5: getApplicationById returns a specific application
    test("getApplicationById returns a specific application", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );

        const application = getApplicationById("app2");
        expect(application).toBeDefined();
        expect(application?.userId).toBe("user2");
    });

    // Test 6: getApplicationById returns undefined for non-existent ID
    test("getApplicationById returns undefined for non-existent ID", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );

        const application = getApplicationById("non-existent");
        expect(application).toBeUndefined();
    });

    // Test 7: getSelectedApplications returns only selected applications
    test("getSelectedApplications returns only selected applications", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );

        const applications = getSelectedApplications();
        expect(applications.length).toBe(1);
        expect(applications[0].id).toBe("app2");
    });

    // Test 8: getApplicationsByCourse returns applications for a specific course
    test("getApplicationsByCourse returns applications for a specific course", () => {
        localStorageMock.getItem.mockReturnValue( // Use mockReturnValue instead of mockReturnValueOnce
            JSON.stringify(sampleApplications)
        );

        const applications = getApplicationsByCourse("COMP2222");
        expect(applications.length).toBe(2);

        const comp1111Applications = getApplicationsByCourse("COMP1111");
        expect(comp1111Applications.length).toBe(1);
        expect(comp1111Applications[0].id).toBe("app1");
    });

    // Test 9: saveApplication adds a new application
    test("saveApplication adds a new application", () => {
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([]));

        const newApplication: TutorApplication = {
            id: "app3",
            userId: "user3",
            email: "user3@example.com",
            fullName: "User Three",
            courses: ["COMP4444"],
            previousRoles: [],
            availability: "Part Time",
            skills: ["TypeScript"],
            academicCredentials: "PhD in CS",
            dateApplied: "",
            selected: true, // Should be set to false in saveApplication
        };

        saveApplication(newApplication);

        // Check that it was saved to localStorage with defaults applied
        expect(localStorageMock.setItem).toHaveBeenCalled();

        // Extract the saved data to verify properties were set correctly
        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(savedData.length).toBe(1);
        expect(savedData[0].id).toBe("app3");
        expect(savedData[0].selected).toBe(false); // Should be reset to false
        expect(savedData[0].dateApplied).toBeTruthy(); // Should have a date
    });

    // Test 10: saveApplication updates an existing application
    test("saveApplication updates an existing application", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );

        const updatedApplication = {
            ...sampleApplications[0],
            skills: ["Updated Skill"],
        };

        saveApplication(updatedApplication);

        // Check that localStorage was updated
        expect(localStorageMock.setItem).toHaveBeenCalled();

        // Verify the updated data
        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(savedData.length).toBe(2);
        expect(savedData[0].skills).toEqual(["Updated Skill"]);
    });

    // Test 11: resetAllApplicationsToUnselected resets selection status
    test("resetAllApplicationsToUnselected resets selection status", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );

        resetAllApplicationsToUnselected();

        // Check that localStorage was updated
        expect(localStorageMock.setItem).toHaveBeenCalled();

        // Verify all applications are unselected
        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(
            savedData.every((app: TutorApplication) => app.selected === false)
        ).toBe(true);
        expect(
            savedData.every(
                (app: TutorApplication) => app.selectedBy === undefined
            )
        ).toBe(true);
    });

    // Test 12: moveUnassignedTutorsToUnselected unselects tutors without assigned courses
    test("moveUnassignedTutorsToUnselected unselects tutors without assigned courses", () => {
        const appsWithUnassigned = [
            ...sampleApplications,
            {
                id: "app3",
                userId: "user3",
                email: "user3@example.com",
                fullName: "User Three",
                courses: ["COMP4444"],
                previousRoles: [],
                availability: "Part Time",
                skills: ["TypeScript"],
                academicCredentials: "PhD in CS",
                dateApplied: "2023-04-01",
                selected: true,
                selectedBy: "lecturer1",
                selectedDate: "2023-05-01",
                selectedForCourses: [], // Empty courses array
            },
        ];

        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(appsWithUnassigned)
        );

        moveUnassignedTutorsToUnselected();

        // Check that localStorage was updated
        expect(localStorageMock.setItem).toHaveBeenCalled();

        // Verify app3 is now unselected
        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        const app3 = savedData.find(
            (app: TutorApplication) => app.id === "app3"
        );
        expect(app3.selected).toBe(false);
        expect(app3.selectedForCourses).toBeUndefined();

        // Verify app2 is still selected
        const app2 = savedData.find(
            (app: TutorApplication) => app.id === "app2"
        );
        expect(app2.selected).toBe(true);
    });

    // Test 12b: moveUnassignedTutorsToUnselected unselects tutors with undefined selectedForCourses
    test("moveUnassignedTutorsToUnselected unselects tutors with undefined selectedForCourses", () => {
        const appsWithUndefinedCourses = [
            ...sampleApplications,
            {
                id: "app4",
                userId: "user4",
                email: "user4@example.com",
                fullName: "User Four",
                courses: ["COMP5555"],
                previousRoles: [],
                availability: "Full Time",
                skills: ["AWS"],
                academicCredentials: "Bachelor of IT",
                dateApplied: "2023-06-01",
                selected: true, // Selected...
                selectedBy: "lecturer2",
                selectedDate: "2023-07-01",
                selectedForCourses: undefined, // ...but courses are undefined
            },
        ];

        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(appsWithUndefinedCourses)
        );

        moveUnassignedTutorsToUnselected();

        expect(localStorageMock.setItem).toHaveBeenCalled();
        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        const app4 = savedData.find((app: TutorApplication) => app.id === "app4");
        expect(app4.selected).toBe(false); // Should now be unselected
        expect(app4.selectedForCourses).toBeUndefined();
    });


    // Test 13: initializeApplications creates empty array if none exists
    test("initializeApplications creates empty array if none exists", () => {
        localStorageMock.getItem.mockReturnValueOnce(null);

        initializeApplications();

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "applications",
            "[]"
        );
    });

    // Test 14: initializeApplications resets applications if they exist
    test("initializeApplications resets applications if they exist", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );

        initializeApplications();

        expect(localStorageMock.setItem).toHaveBeenCalled();
        // It should have called resetAllApplicationsToUnselected
        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(
            savedData.every((app: TutorApplication) => app.selected === false)
        ).toBe(true);
    });

    // --- Tests for searchApplications ---

    // Test 15: searchApplications returns all applications for empty query
    test("searchApplications returns all applications for empty query", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );
        const results = searchApplications("");
        expect(results.length).toBe(2);
    });

    // Test 16: searchApplications finds application by full name (case-insensitive)
    test("searchApplications finds application by full name", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );
        const results = searchApplications("user one"); // Lowercase query
        expect(results.length).toBe(1);
        expect(results[0].id).toBe("app1");
    });

    // Test 17: searchApplications finds application by course code (case-insensitive)
    test("searchApplications finds application by course code", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );
        const results = searchApplications("comp2222"); // Lowercase query
        expect(results.length).toBe(2); // Both users have this course
    });

    // Test 18: searchApplications finds application by skill (case-insensitive)
    test("searchApplications finds application by skill", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );
        const results = searchApplications("java"); // Lowercase query
        expect(results.length).toBe(2); // Expect 2 because "JavaScript" includes "java"
        // Check that both app1 (JavaScript) and app2 (Java) are included
        expect(results.some(app => app.id === 'app1')).toBe(true);
        expect(results.some(app => app.id === 'app2')).toBe(true);
    });

     // Test 19: searchApplications finds application by academic credentials (case-insensitive)
     test("searchApplications finds application by academic credentials", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );
        const results = searchApplications("master of it"); // Lowercase query
        expect(results.length).toBe(1);
        expect(results[0].id).toBe("app2");
    });

    // Test 20: searchApplications returns empty array for no match
    test("searchApplications returns empty array for no match", () => {
        localStorageMock.getItem.mockReturnValueOnce(
            JSON.stringify(sampleApplications)
        );
        const results = searchApplications("nonexistentquery");
        expect(results.length).toBe(0);
    });

    // --- Tests for non-browser environment (window undefined) ---
    describe("Tutor Utilities in Non-Browser Environment", () => {
        let originalWindow: Window & typeof globalThis;

        beforeAll(() => {
            // Store original window and delete it
            originalWindow = window;
            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true,
            });
        });

        afterAll(() => {
            // Restore original window
             Object.defineProperty(global, 'window', {
                value: originalWindow,
                writable: true,
            });
        });

        test("getApplications returns empty array when window is undefined", () => {
            expect(getApplications()).toEqual([]);
        });

        test("getApplicationByUserId returns empty array when window is undefined", () => {
            expect(getApplicationByUserId("user1")).toEqual([]);
        });

        test("getApplicationById returns undefined when window is undefined", () => {
            expect(getApplicationById("app1")).toBeUndefined();
        });

        test("getSelectedApplications returns empty array when window is undefined", () => {
            expect(getSelectedApplications()).toEqual([]);
        });

        test("getApplicationsByCourse returns empty array when window is undefined", () => {
            expect(getApplicationsByCourse("COMP1111")).toEqual([]);
        });

         test("saveApplication does nothing when window is undefined", () => {
            const app = { ...sampleApplications[0] };
            // saveApplication returns undefined in this case, but we mainly check no error/localStorage call
            expect(() => saveApplication(app)).not.toThrow();
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });

         test("resetAllApplicationsToUnselected does nothing when window is undefined", () => {
            expect(() => resetAllApplicationsToUnselected()).not.toThrow();
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });

         test("moveUnassignedTutorsToUnselected does nothing when window is undefined", () => {
            expect(() => moveUnassignedTutorsToUnselected()).not.toThrow();
             expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });

         test("initializeApplications does nothing when window is undefined", () => {
            expect(() => initializeApplications()).not.toThrow();
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });

        // Note: initializeDetailedApplications also relies on window, could add test if needed
    });
});
