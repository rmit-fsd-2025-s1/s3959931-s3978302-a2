import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import GlobalWelcomeBanner from "@/shared/components/GlobalWelcomeBanner";
import { User } from "@/shared/types/user";

// Mock the useAuth hook
jest.mock("@/modules/auth/hooks/useAuth");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the WelcomeBanner component
jest.mock("@/shared/components/WelcomeBanner", () => ({
  WelcomeBanner: ({ user, onHide }: { user: User; onHide: () => void }) => (
    <div data-testid="welcome-banner">
      Welcome, {user.firstName}!
      <button onClick={onHide} data-testid="close-banner">
        Close
      </button>
    </div>
  ),
}));

const mockUser: User = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  userType: "candidate",
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("GlobalWelcomeBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Clear localStorage mocks
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should show banner when user first signs in", async () => {
    // Initially not authenticated
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    const { rerender } = render(<GlobalWelcomeBanner />);

    // Should not show banner initially
    expect(screen.queryByTestId("welcome-banner")).not.toBeInTheDocument();

    // User signs in
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    rerender(<GlobalWelcomeBanner />);

    // Wait for the delayed banner show (300ms delay)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("welcome-banner")).toBeInTheDocument();
    expect(screen.getByText("Welcome, John!")).toBeInTheDocument();
  });

  it("should show banner again after user signs out and signs up again", async () => {
    // User is initially signed in
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    const { rerender } = render(<GlobalWelcomeBanner />);

    // Wait for initial banner to show
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("welcome-banner")).toBeInTheDocument();

    // User signs out
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    rerender(<GlobalWelcomeBanner />);

    // Banner should disappear immediately
    expect(screen.queryByTestId("welcome-banner")).not.toBeInTheDocument();
    // Should set logout flag in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "welcomeBanner_hasLoggedOut",
      "true"
    );

    // User signs up/signs in again (same user ID)
    // Mock localStorage to return the logout flag
    localStorageMock.getItem.mockReturnValue("true");

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    rerender(<GlobalWelcomeBanner />);

    // Wait for banner to show again
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Banner should show again even though it's the same user
    expect(screen.getByTestId("welcome-banner")).toBeInTheDocument();
    expect(screen.getByText("Welcome, John!")).toBeInTheDocument();
    // Should clear logout flag from localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "welcomeBanner_hasLoggedOut"
    );
  });

  it("should show banner when switching between different users", async () => {
    const user1: User = { ...mockUser, id: 1, firstName: "John" };
    const user2: User = { ...mockUser, id: 2, firstName: "Jane" };

    // User 1 signs in
    mockUseAuth.mockReturnValue({
      user: user1,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    const { rerender } = render(<GlobalWelcomeBanner />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText("Welcome, John!")).toBeInTheDocument();

    // User 2 signs in (without signing out - direct switch)
    mockUseAuth.mockReturnValue({
      user: user2,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    rerender(<GlobalWelcomeBanner />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText("Welcome, Jane!")).toBeInTheDocument();
  });

  it("should show banner when component mounts fresh and user was logged out previously", async () => {
    // Mock localStorage to return logout flag (simulating previous logout)
    localStorageMock.getItem.mockReturnValue("true");

    // Component mounts with user already authenticated (like after page refresh)
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    render(<GlobalWelcomeBanner />);

    // Wait for banner to show
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Banner should show because logout flag was set
    expect(screen.getByTestId("welcome-banner")).toBeInTheDocument();
    expect(screen.getByText("Welcome, John!")).toBeInTheDocument();
    // Should clear logout flag from localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "welcomeBanner_hasLoggedOut"
    );
  });

  it("should not show banner when loading", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    render(<GlobalWelcomeBanner />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryByTestId("welcome-banner")).not.toBeInTheDocument();
  });

  it("should not show banner when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    });

    render(<GlobalWelcomeBanner />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryByTestId("welcome-banner")).not.toBeInTheDocument();
  });
});
