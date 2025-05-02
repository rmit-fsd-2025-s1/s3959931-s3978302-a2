import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UserDropdown from "./UserDropdown";

// Mock next/image
jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: any) => {
        return <img {...props} />;
    },
}));

// Mock framer-motion
jest.mock("framer-motion", () => {
    const mockReact = require("react");
    return {
        motion: {
            div: mockReact.forwardRef(
                ({ children, ...props }: any, ref: any) => (
                    <div ref={ref} {...props}>
                        {children}
                    </div>
                )
            ),
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => (
            <>{children}</>
        ),
    };
});

describe("UserDropdown Component", () => {
    const mockUser = {
        fullName: "John Doe",
        email: "john.doe@tutor.edu.au",
        role: "tutor",
    };

    const mockOnSignOut = jest.fn();
    const mockOnToggleDarkMode = jest.fn();

    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Component renders with user info
    test("renders with user information", () => {
        render(
            <UserDropdown
                user={mockUser}
                onSignOut={mockOnSignOut}
                onToggleDarkMode={mockOnToggleDarkMode}
                isDarkMode={false}
            />
        );

        // Avatar should be rendered
        expect(screen.getByAltText("John Doe")).toBeInTheDocument();

        // Dropdown is closed by default, so we shouldn't see user details yet
        expect(
            screen.queryByText("john.doe@tutor.edu.au")
        ).not.toBeInTheDocument();
    });

    // Test 2: Opens dropdown when avatar is clicked
    test("opens dropdown when avatar is clicked", () => {
        render(
            <UserDropdown
                user={mockUser}
                onSignOut={mockOnSignOut}
                onToggleDarkMode={mockOnToggleDarkMode}
                isDarkMode={false}
            />
        );

        // Click on avatar to open dropdown
        fireEvent.click(screen.getByAltText("John Doe"));

        // Now user details should be visible
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("Doe")).toBeInTheDocument();
        expect(screen.getByText("john.doe@tutor.edu.au")).toBeInTheDocument();
        expect(screen.getByText("tutor")).toBeInTheDocument();
    });

    // Test 3: Closes dropdown when close button is clicked
    test("closes dropdown when close button is clicked", () => {
        render(
            <UserDropdown
                user={mockUser}
                onSignOut={mockOnSignOut}
                onToggleDarkMode={mockOnToggleDarkMode}
                isDarkMode={false}
            />
        );

        // Open dropdown
        fireEvent.click(screen.getByAltText("John Doe"));
        expect(screen.getByText("john.doe@tutor.edu.au")).toBeInTheDocument();

        // Click close button
        fireEvent.click(screen.getByLabelText("Close dropdown"));

        // Dropdown should be closed, email shouldn't be visible
        expect(
            screen.queryByText("john.doe@tutor.edu.au")
        ).not.toBeInTheDocument();
    });

    // Test 4: Calls onSignOut when sign out button is clicked
    test("calls onSignOut when sign out button is clicked", () => {
        render(
            <UserDropdown
                user={mockUser}
                onSignOut={mockOnSignOut}
                onToggleDarkMode={mockOnToggleDarkMode}
                isDarkMode={false}
            />
        );

        // Open dropdown
        fireEvent.click(screen.getByAltText("John Doe"));

        // Click sign out button
        fireEvent.click(screen.getByText("Sign Out"));

        // Check if onSignOut was called
        expect(mockOnSignOut).toHaveBeenCalledTimes(1);
    });

    // Test 5: Calls onToggleDarkMode when theme toggle is clicked
    test("calls onToggleDarkMode when theme toggle is clicked", () => {
        render(
            <UserDropdown
                user={mockUser}
                onSignOut={mockOnSignOut}
                onToggleDarkMode={mockOnToggleDarkMode}
                isDarkMode={false}
            />
        );

        // Open dropdown
        fireEvent.click(screen.getByAltText("John Doe"));

        // Find and click the theme toggle
        const themeToggle = screen.getByLabelText("Toggle dark mode");
        fireEvent.click(themeToggle);

        // Check if onToggleDarkMode was called
        expect(mockOnToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    // Test 6: Shows active class on theme toggle when in dark mode
    test("shows active class on theme toggle when in dark mode", () => {
        render(
            <UserDropdown
                user={mockUser}
                onSignOut={mockOnSignOut}
                onToggleDarkMode={mockOnToggleDarkMode}
                isDarkMode={true}
            />
        );

        // Open dropdown
        fireEvent.click(screen.getByAltText("John Doe"));

        // Find theme toggle and check for active class
        const themeToggle = screen.getByLabelText("Toggle dark mode");
        expect(themeToggle).toHaveClass("active");
    });

    // Test 7: Correctly handles users with single names
    test("correctly renders users with single names", () => {
        const singleNameUser = {
            fullName: "Madonna",
            email: "madonna@tutor.edu.au",
            role: "tutor",
        };

        render(
            <UserDropdown
                user={singleNameUser}
                onSignOut={mockOnSignOut}
                onToggleDarkMode={mockOnToggleDarkMode}
                isDarkMode={false}
            />
        );

        // Open dropdown
        fireEvent.click(screen.getByAltText("Madonna"));

        // Check if name is rendered correctly
        expect(screen.getByText("Madonna")).toBeInTheDocument();
        expect(screen.queryByText(/\sMadonna/)).not.toBeInTheDocument(); // No space before name
    });
});
