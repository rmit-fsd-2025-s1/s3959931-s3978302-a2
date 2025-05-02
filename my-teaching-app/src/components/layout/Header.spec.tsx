import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Header from "./Header";
import { useRouter } from "next/router";

// Mock next/router
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

// Mock next/image
jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: any) => {
        return <img {...props} />;
    },
}));

// Mock UserDropdown component
jest.mock("./UserDropdown", () => {
    return function MockUserDropdown() {
        return <div data-testid="user-dropdown" />;
    };
});

describe("Header Component", () => {
    // Setup common mocks
    const mockPush = jest.fn();
    const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mocks for each test
        (useRouter as jest.Mock).mockReturnValue({
            pathname: "/",
            push: mockPush,
        });

        // Mock localStorage
        Object.defineProperty(window, "localStorage", {
            value: mockLocalStorage,
            writable: true,
        });

        // Mock scrollY
        Object.defineProperty(window, "scrollY", {
            value: 0,
            writable: true,
        });

        // Mock document.documentElement.classList
        const originalClassList = document.documentElement.classList;
        document.documentElement.classList = {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn(),
            toggle: jest.fn(),
            item: jest.fn(),
            toString: jest.fn().mockReturnValue(""),
            value: "",
            length: 0,
            replace: jest.fn(),
            entries: jest.fn(),
            forEach: jest.fn(),
            keys: jest.fn(),
            values: jest.fn(),
            [Symbol.iterator]: jest.fn(),
        } as unknown as DOMTokenList;

        return () => {
            document.documentElement.classList = originalClassList;
        };
    });

    // Test 1: Header renders logo
    test("renders the logo with correct link", () => {
        mockLocalStorage.getItem.mockReturnValueOnce(null); // Not logged in

        render(<Header />);

        const logoLink = screen.getByRole("link", { name: /logo/i });
        expect(logoLink).toBeInTheDocument();
        expect(logoLink).toHaveAttribute("href", "/");
        expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    });

    // Test 2: Header renders nav links when not logged in
    test("renders all navigation links when not logged in", () => {
        mockLocalStorage.getItem.mockReturnValueOnce(null); // Not logged in

        render(<Header />);

        expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /tutor/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /lecturer/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /sign in/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /sign up/i })
        ).toBeInTheDocument();
    });

    // Test 3: Header shows Sign In / Sign Up buttons when not logged in
    test("shows auth buttons when not logged in", () => {
        mockLocalStorage.getItem.mockReturnValueOnce(null); // Not logged in

        render(<Header />);

        const signInButton = screen.getByRole("link", { name: /sign in/i });
        const signUpButton = screen.getByRole("link", { name: /sign up/i });

        expect(signInButton).toBeInTheDocument();
        expect(signInButton).toHaveAttribute("href", "/signin");
        expect(signUpButton).toBeInTheDocument();
        expect(signUpButton).toHaveAttribute("href", "/signup");
    });

    // Test 4: Header renders user dropdown when logged in
    test("renders user dropdown when logged in", () => {
        // Mock logged in user data
        const mockUserData = JSON.stringify({
            id: "123",
            email: "test@example.com",
            role: "tutor",
            fullName: "Test User",
        });

        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === "currentUser") return mockUserData;
            if (key === "darkMode") return "false";
            return null;
        });

        render(<Header />);

        expect(screen.getByTestId("user-dropdown")).toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /sign in/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /sign up/i })
        ).not.toBeInTheDocument();
    });

    // Test 5: Header toggles dark mode
    test("toggles dark mode when button is clicked", () => {
        mockLocalStorage.getItem.mockReturnValueOnce(null); // Not logged in
        mockLocalStorage.getItem.mockReturnValueOnce("false"); // Dark mode off

        // Create a spy specifically for classList.add
        const addSpy = jest.fn();
        document.documentElement.classList.add = addSpy;

        render(<Header />);

        const darkModeButton = screen.getByRole("button", {
            name: /toggle dark mode/i,
        });
        fireEvent.click(darkModeButton);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            "darkMode",
            "true"
        );
        expect(addSpy).toHaveBeenCalled();
    });

    // Test 6: Header changes style on scroll
    test("adds scrolled class when scrolled down", () => {
        mockLocalStorage.getItem.mockReturnValueOnce(null); // Not logged in

        render(<Header />);

        // Simulate scroll event
        window.scrollY = 20;
        fireEvent.scroll(window);

        const header = screen.getByRole("banner");
        expect(header).toHaveClass("scrolled");
    });

    // Test 7: Header shows correct links based on user role
    test("shows correct navigation links based on user role", () => {
        // Mock logged in user data as lecturer
        const mockLecturerData = JSON.stringify({
            id: "456",
            email: "lecturer@example.com",
            role: "lecturer",
            fullName: "Lecturer User",
        });

        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === "currentUser") return mockLecturerData;
            if (key === "darkMode") return "false";
            return null;
        });

        const { unmount } = render(<Header />);

        // Lecturer should see Home and Lecturer links but not Tutor
        expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /lecturer/i })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /tutor/i })
        ).not.toBeInTheDocument();

        // Unmount and reset mocks for the next render
        unmount();
        mockLocalStorage.getItem.mockReset();

        // Now test with tutor role
        const mockTutorData = JSON.stringify({
            id: "789",
            email: "tutor@example.com",
            role: "tutor",
            fullName: "Tutor User",
        });

        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === "currentUser") return mockTutorData;
            if (key === "darkMode") return "false";
            return null;
        });

        // Render again with tutor data
        render(<Header />);

        // Tutor should see Home and Tutor links but not Lecturer
        expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /tutor/i })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /lecturer/i })
        ).not.toBeInTheDocument();
    });
});
