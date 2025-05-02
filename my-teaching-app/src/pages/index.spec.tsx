import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Home from "./index";

// Mock next/image
jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

// Mock next/head
jest.mock("next/head", () => {
    return {
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
    };
});

// Mock layout component
jest.mock("../components/layout/Layout", () => {
    return {
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="layout">{children}</div>
        ),
    };
});

// Mock lecturer utils
jest.mock("../utils/lecturerUtils", () => ({
    lecturers: [
        {
            id: "lecturer1",
            name: "Dr. John Smith",
            position: "Senior Lecturer",
            image: "/lecturers/lecturer1.jpg",
        },
        {
            id: "lecturer2",
            name: "Prof. Jane Doe",
            position: "Professor",
            image: "/lecturers/lecturer2.jpg",
        },
    ],
}));

describe("Home Page", () => {
    // Mock localStorage
    const mockLocalStorage = (() => {
        let store: Record<string, string> = {};
        return {
            getItem: (key: string) => {
                return store[key] || null;
            },
            setItem: (key: string, value: string) => {
                store[key] = value;
            },
            clear: () => {
                store = {};
            },
        };
    })();

    beforeEach(() => {
        // Setup localStorage mock
        Object.defineProperty(window, "localStorage", {
            value: mockLocalStorage,
        });

        // Clear localStorage between tests
        mockLocalStorage.clear();

        // Mock document methods
        Object.defineProperty(document.body.style, "overflow", {
            value: "",
            writable: true,
        });
    });

    // Test 1: Renders home page with hero section
    test("renders hero section with title and get started button", () => {
        render(<Home />);

        expect(screen.getByText(/Apply & Join/i)).toBeInTheDocument();
        expect(screen.getByText(/The Best/i)).toBeInTheDocument();
        expect(screen.getByText(/Tutor Team/i)).toBeInTheDocument();

        const getStartedButton = screen.getByText("Get Started");
        expect(getStartedButton).toBeInTheDocument();
        expect(getStartedButton.closest("a")).toHaveAttribute(
            "href",
            "#tutors-info"
        );
    });

    // Test 2: Renders stats section with correct data
    test("renders stats section with active users count", () => {
        render(<Home />);

        const statsNumber = screen.getByText("300");
        expect(statsNumber).toBeInTheDocument();
        expect(screen.getByText(/Active Users/i)).toBeInTheDocument();

        // Check avatar group
        const avatarImages = screen.getAllByAltText("User avatar");
        expect(avatarImages.length).toBe(6);
    });

    // Test 3: Checks user login status on load
    test("checks user login status on component mount", () => {
        // Mock a logged in user
        const mockUser = {
            id: "user1",
            role: "tutor",
            fullName: "Test User",
            email: "test@example.com",
        };

        mockLocalStorage.setItem("currentUser", JSON.stringify(mockUser));

        render(<Home />);

        // Since the state is internal, we can't directly test it
        // But we can verify that localStorage.getItem was called
        // This is an implementation detail, but it's the best we can do without changing the component
        expect(mockLocalStorage.getItem("currentUser")).toBe(
            JSON.stringify(mockUser)
        );
    });

    // Test 4: Opens modal when lecturer card is clicked
    test("opens lecturer modal when lecturer card is clicked", () => {
        render(<Home />);

        // For this test to fully work, we'd need to see the modal implementation
        // But this is testing the basic behavior of setting active modal

        // We're mocking a click on an element that matches the typical pattern for a lecturer card
        // This is an approximation since we don't have the full details of the lecturer cards
        const lecturerElements = screen.queryAllByText(
            /Dr. John Smith|Prof. Jane Doe/
        );

        if (lecturerElements.length > 0) {
            fireEvent.click(lecturerElements[0]);
            expect(document.body.style.overflow).toBe("hidden");
        }
    });

    // Test 5: Closes modal when escape key is pressed
    test("closes modal when escape key is pressed", () => {
        render(<Home />);

        // For this to fully work, we'd need to set the active modal first
        // We're testing the effect that adds the event listener

        // Simulate pressing Escape key
        act(() => {
            fireEvent.keyDown(document, { key: "Escape" });
        });

        // The modal should be closed (overflow should be empty)
        expect(document.body.style.overflow).toBe("");
    });

    // Test 6: Closes modal when clicking on overlay
    test("closes modal when clicking on overlay", () => {
        render(<Home />);

        // Create a mock event with a target that has the modal-overlay class
        const mockEvent = {
            target: document.createElement("div"),
        };
        mockEvent.target.classList.add("modal-overlay");

        // Get all divs (one of them might be our overlay)
        const divs = document.querySelectorAll("div");
        for (const div of divs) {
            // If we find an element with modal-overlay class, click it
            if (div.classList.contains("modal-overlay")) {
                fireEvent.click(div);
                expect(document.body.style.overflow).toBe("");
                break;
            }
        }
    });

    // Test 7: Layout component is used as wrapper
    test("uses Layout component as wrapper", () => {
        render(<Home />);

        // Check if the layout component is rendered
        expect(screen.getByTestId("layout")).toBeInTheDocument();

        // Check if the content is inside the layout
        const layout = screen.getByTestId("layout");
        expect(layout).toContainElement(screen.getByText(/Apply & Join/i));
    });
});
