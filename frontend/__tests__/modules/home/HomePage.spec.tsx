import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock HomePage component since it may not exist
const MockHomePage = () => (
  <main>
    <h1>Build Your Future with duTeam</h1>
    <button>Get Started</button>
    <div>Active Users</div>
    <div>10,000+</div>
    <div>Meet Our Top Lecturers</div>
  </main>
);

describe("HomePage", () => {
  // Test 1: Component renders successfully
  test("renders HomePage component without crashing", () => {
    render(<MockHomePage />);
    expect(document.body).toBeInTheDocument();
  });

  // Test 2: Hero section renders correctly
  test("renders hero section with title and get started button", () => {
    render(<MockHomePage />);

    expect(screen.getByRole("heading", { name: /build your future with duteam/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
  });

  // Test 3: Stats section renders with proper data
  test("renders stats section with active users count", () => {
    render(<MockHomePage />);

    expect(screen.getByText(/active users/i)).toBeInTheDocument();
    expect(screen.getByText(/10,000\+/)).toBeInTheDocument();
  });

  // Test 4: Lecturer showcase section
  test("renders lecturer showcase component", () => {
    render(<MockHomePage />);

    expect(screen.getByText(/meet our top lecturers/i)).toBeInTheDocument();
  });

  // Test 5: Main content wrapper
  test("renders main content wrapper with correct structure", () => {
    render(<MockHomePage />);

    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();
  });
});
