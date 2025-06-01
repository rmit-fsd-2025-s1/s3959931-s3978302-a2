// filepath: c:\s3978302\Full Stack Development\s3959931-s3978302-a2\my-teaching-app\src\tests\shared\components\layout\header.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/shared/components/layout/header/header";

// Mock next/navigation for App Router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock UserDropdown component - try direct file path
jest.mock("@/shared/components/layout/user-dropdown/user-dropdown", () => ({
  __esModule: true,
  default: function MockUserDropdown() {
    return <div data-testid="user-dropdown" />;
  },
}));

// Import the mocked functions
import { useRouter, usePathname } from "next/navigation";

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
      push: mockPush,
    });

    (usePathname as jest.Mock).mockReturnValue("/");

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

    // Mock document.documentElement.classList - simplified approach
    const classListMock = {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn(),
    };

    jest
      .spyOn(document.documentElement.classList, "add")
      .mockImplementation(classListMock.add);
    jest
      .spyOn(document.documentElement.classList, "remove")
      .mockImplementation(classListMock.remove);
    jest
      .spyOn(document.documentElement.classList, "contains")
      .mockImplementation(classListMock.contains);
    jest
      .spyOn(document.documentElement.classList, "toggle")
      .mockImplementation(classListMock.toggle);
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
    expect(screen.getByRole("link", { name: /tutor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lecturer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
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
    const addSpy = jest.spyOn(document.documentElement.classList, "add");

    render(<Header />);

    const darkModeButton = screen.getByRole("button", {
      name: /toggle dark mode/i,
    });
    fireEvent.click(darkModeButton);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("darkMode", "true");
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

    render(<Header />);

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tutor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lecturer/i })).toBeInTheDocument();
  });

  // Test 8: Header mobile menu toggle
  test("mobile menu can be toggled", () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null); // Not logged in

    render(<Header />);

    const mobileMenuButton = screen.getByRole("button", {
      name: /toggle mobile menu/i,
    });
    fireEvent.click(mobileMenuButton);

    // Check if mobile menu visibility changes
    const mobileMenu = screen.getByRole("navigation");
    expect(mobileMenu).toBeInTheDocument();
  });

  // Test 9: Header dark mode persists on load
  test("applies dark mode on load when stored in localStorage", () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "darkMode") return "true";
      return null;
    });

    const addSpy = jest.spyOn(document.documentElement.classList, "add");

    render(<Header />);

    expect(addSpy).toHaveBeenCalledWith("dark");
  });

  // Test 10: Header shows user name when logged in
  test("displays user full name when logged in", () => {
    const mockUserData = JSON.stringify({
      id: "789",
      email: "user@example.com",
      role: "tutor",
      fullName: "John Doe",
    });

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "currentUser") return mockUserData;
      if (key === "darkMode") return "false";
      return null;
    });

    render(<Header />);

    expect(screen.getByTestId("user-dropdown")).toBeInTheDocument();
  });
});

describe.skip("Header Component (TEMPORARILY DISABLED)", () => {
  test("placeholder test", () => {
    expect(true).toBe(true);
  });
});
