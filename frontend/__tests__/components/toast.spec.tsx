import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Toast from "@/shared/components/common/toast/toast";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      className,
      children,
    }: {
      className?: string;
      children?: React.ReactNode;
    }) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock timer
jest.useFakeTimers();

describe("Toast Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Toast renders correctly when visible
  test("renders correctly when visible", () => {
    render(
      <Toast
        message="Test message"
        visible={true}
        type="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  // Test 2: Toast doesn't render when not visible
  test("doesn't render when not visible", () => {
    render(
      <Toast
        message="Test message"
        visible={false}
        type="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText("Test message")).not.toBeInTheDocument();
  });

  // Test 3: Toast calls onClose when close button is clicked
  test("calls onClose when close button is clicked", () => {
    render(
      <Toast
        message="Test message"
        visible={true}
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test 4: Toast automatically closes after 3 seconds
  test("automatically closes after 3 seconds", () => {
    render(
      <Toast
        message="Test message"
        visible={true}
        type="success"
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test 5: Toast renders with different types
  test("renders with appropriate styling for different types", () => {
    const { rerender } = render(
      <Toast
        message="Success message"
        visible={true}
        type="success"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText("Success message")).toBeInTheDocument();

    rerender(
      <Toast
        message="Error message"
        visible={true}
        type="error"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText("Error message")).toBeInTheDocument();

    rerender(
      <Toast
        message="Info message"
        visible={true}
        type="info"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText("Info message")).toBeInTheDocument();
  });

  // Test 6: Toast clears timeout when unmounted
  test("clears timeout when unmounted", () => {
    const { unmount } = render(
      <Toast
        message="Test message"
        visible={true}
        type="success"
        onClose={mockOnClose}
      />
    );

    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
