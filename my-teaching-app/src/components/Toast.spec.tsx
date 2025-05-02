import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Toast from "./Toast";

// Mock framer-motion to prevent animation issues
jest.mock("framer-motion", () => {
    return {
        motion: {
            div: ({ children, className, ...props }: any) => (
                <div className={className} {...props}>
                    {children}
                </div>
            ),
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => (
            <>{children}</>
        ),
    };
});

describe("Toast Component", () => {
    // Test 1: Component renders with correct message
    test("renders with the provided message", () => {
        const mockOnClose = jest.fn();

        render(
            <Toast
                message="Test message"
                visible={true}
                type="success"
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    // Test 2: Different toast types display correctly
    test("renders with different types (success, error, info)", () => {
        const mockOnClose = jest.fn();

        const { rerender } = render(
            <Toast
                message="Success message"
                visible={true}
                type="success"
                onClose={mockOnClose}
            />
        );

        expect(document.querySelector(".toast-success")).toBeInTheDocument();

        rerender(
            <Toast
                message="Error message"
                visible={true}
                type="error"
                onClose={mockOnClose}
            />
        );

        expect(document.querySelector(".toast-error")).toBeInTheDocument();

        rerender(
            <Toast
                message="Info message"
                visible={true}
                type="info"
                onClose={mockOnClose}
            />
        );

        expect(document.querySelector(".toast-info")).toBeInTheDocument();
    });

    // Test 3: Toast not rendered when visible is false
    test("does not render when visible is false", () => {
        const mockOnClose = jest.fn();

        render(
            <Toast
                message="Test message"
                visible={false}
                onClose={mockOnClose}
            />
        );

        expect(screen.queryByText("Test message")).not.toBeInTheDocument();
    });

    // Test 4: Close button calls onClose function
    test("calls onClose when close button is clicked", () => {
        const mockOnClose = jest.fn();

        render(
            <Toast
                message="Test message"
                visible={true}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(screen.getByRole("button", { class: "toast-close" }));

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    // Test 5: Default type is 'success' when not specified
    test("has default type of success when not specified", () => {
        const mockOnClose = jest.fn();

        render(
            <Toast
                message="Test message"
                visible={true}
                onClose={mockOnClose}
            />
        );

        expect(document.querySelector(".toast-success")).toBeInTheDocument();
        expect(document.querySelector(".toast-error")).not.toBeInTheDocument();
        expect(document.querySelector(".toast-info")).not.toBeInTheDocument();
    });

    // Test 6: Auto closes after timeout
    test("automatically closes after timeout", () => {
        jest.useFakeTimers();
        const mockOnClose = jest.fn();

        render(
            <Toast
                message="Test message"
                visible={true}
                onClose={mockOnClose}
            />
        );

        expect(mockOnClose).not.toHaveBeenCalled();

        // Fast forward time
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(mockOnClose).toHaveBeenCalledTimes(1);

        jest.useRealTimers();
    });

    // Test 7: Cleans up timer on unmount
    test("cleans up timer when unmounted", () => {
        jest.useFakeTimers();
        const mockOnClose = jest.fn();

        const { unmount } = render(
            <Toast
                message="Test message"
                visible={true}
                onClose={mockOnClose}
            />
        );

        const clearTimeoutSpy = jest.spyOn(window, "clearTimeout");

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();

        clearTimeoutSpy.mockRestore();
        jest.useRealTimers();
    });
});
