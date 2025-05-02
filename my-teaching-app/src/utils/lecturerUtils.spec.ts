import {
    getLecturerById,
    getLecturersBySpecialization,
    getLecturerSelections,
    saveLecturerSelection,
    formatLecturerExpertise,
    getLecturerCourses,
    lecturers,
} from "./lecturerUtils";

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

describe("Lecturer Utilities", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    // Test 1: getLecturerById returns the correct lecturer
    test("getLecturerById returns the correct lecturer", () => {
        const lecturer = getLecturerById("lecturer1");
        expect(lecturer).toBeDefined();
        expect(lecturer?.name).toBe("Dr. Sophie Chen");
        expect(lecturer?.specialization).toBe(
            "Artificial Intelligence & Machine Learning"
        );
    });

    // Test 2: getLecturerById returns undefined for non-existent ID
    test("getLecturerById returns undefined for non-existent ID", () => {
        const lecturer = getLecturerById("nonexistent");
        expect(lecturer).toBeUndefined();
    });

    // Test 3: getLecturersBySpecialization returns correct lecturers
    test("getLecturersBySpecialization returns correct lecturers", () => {
        const aiLecturers = getLecturersBySpecialization(
            "artificial intelligence"
        );
        expect(aiLecturers.length).toBe(1);
        expect(aiLecturers[0].name).toBe("Dr. Sophie Chen");

        const securityLecturers = getLecturersBySpecialization("security");
        expect(securityLecturers.length).toBe(1);
        expect(securityLecturers[0].name).toBe("Dr. Aisha Patel");
    });

    // Test 4: getLecturersBySpecialization is case insensitive
    test("getLecturersBySpecialization is case insensitive", () => {
        const dataLecturers = getLecturersBySpecialization("DATA");
        expect(dataLecturers.length).toBe(1);
        expect(dataLecturers[0].name).toBe("Dr. James Wilson");
    });

    // Test 5: getLecturerSelections returns empty array if no selections
    test("getLecturerSelections returns empty array if no selections", () => {
        const selections = getLecturerSelections("lecturer1");
        expect(selections).toEqual([]);
        expect(localStorageMock.getItem).toHaveBeenCalledWith(
            "lecturer_selections_lecturer1"
        );
    });

    // Test 6: saveLecturerSelection saves a new selection
    test("saveLecturerSelection saves a new selection", () => {
        const selection = saveLecturerSelection(
            "lecturer1",
            "tutor1",
            "COMP1234"
        );

        expect(localStorageMock.setItem).toHaveBeenCalled();
        expect(selection).toHaveProperty("tutorId", "tutor1");
        expect(selection).toHaveProperty("courseCode", "COMP1234");
        expect(selection).toHaveProperty("dateSelected");
    });

    // Test 7: saveLecturerSelection updates an existing selection
    test("saveLecturerSelection updates an existing selection", () => {
        // First selection
        saveLecturerSelection(
            "lecturer1",
            "tutor1",
            "COMP1234",
            "Initial comment"
        );

        // Update the selection
        const updatedSelection = saveLecturerSelection(
            "lecturer1",
            "tutor1",
            "COMP1234",
            "Updated comment",
            2
        );

        expect(updatedSelection).toHaveProperty("comment", "Updated comment");
        expect(updatedSelection).toHaveProperty("rank", 2);

        // Verify localStorage was updated
        const savedSelections = JSON.parse(
            localStorageMock.setItem.mock.calls[1][1]
        );
        expect(savedSelections.length).toBe(1); // Still only one selection
        expect(savedSelections[0].comment).toBe("Updated comment");
    });

    // Test 8: formatLecturerExpertise returns correctly formatted string
    test("formatLecturerExpertise returns correctly formatted string", () => {
        const lecturer = getLecturerById("lecturer1");
        if (lecturer) {
            const expertise = formatLecturerExpertise(lecturer);
            expect(expertise).toBe(
                "Associate Professor in Artificial Intelligence & Machine Learning"
            );
        }
    });

    // Test 9: getLecturerCourses returns the correct courses array
    test("getLecturerCourses returns the correct courses array", () => {
        const courses = getLecturerCourses("lecturer1");
        expect(courses).toEqual([
            "Advanced Machine Learning",
            "Neural Networks",
            "AI Ethics",
        ]);
    });

    // Test 10: getLecturerCourses returns empty array for non-existent lecturer
    test("getLecturerCourses returns empty array for non-existent lecturer", () => {
        const courses = getLecturerCourses("nonexistent");
        expect(courses).toEqual([]);
    });
});
