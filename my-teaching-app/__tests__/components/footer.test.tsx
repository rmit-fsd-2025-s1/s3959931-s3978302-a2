import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "@/shared/components/layout/footer/footer"; // Fixed import path to lowercase
import styles from "@/shared/components/layout/footer/footer.module.css"; // Import CSS module

describe("Footer Component", () => {
  // Test 1: Footer renders with main navigation links
  test("renders main navigation links", () => {
    render(<Footer />);

    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Terms")).toBeInTheDocument();
  });

  // Test 2: Footer renders social media links with proper accessibility
  test("renders social media links with correct accessibility attributes", () => {
    render(<Footer />);

    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("Twitter")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();

    // Check for sr-only class for accessibility (now using CSS module class)
    const facebookLink = screen.getByText("Facebook").closest("span");
    expect(facebookLink).toHaveClass(styles.srOnly);
  });

  // Test 3: Footer renders copyright text
  test("renders copyright text", () => {
    render(<Footer />);

    expect(
      screen.getByText(
        /© 2025 EduTeach, School of Computer Science. All rights reserved./i
      )
    ).toBeInTheDocument();
  });

  // Test 4: Footer container has correct base class from CSS module
  test("footer has correct base class", () => {
    render(<Footer />);
    const footerElement = screen.getByRole("contentinfo");
    // Check if the specific class from footer.module.css is applied.
    // This assumes Jest is configured to handle CSS module imports (e.g., mapping them to class names).
    expect(footerElement).toHaveClass(styles.footer);
    // We can also keep checks for Tailwind classes if they are part of the base structure
    expect(footerElement).toHaveClass("py-16"); // Example: if py-16 is always expected
    expect(footerElement).toHaveClass("mt-auto"); // Example: if mt-auto is always expected
  });

  // Test 5: Social media links have SVG icons
  test("social media links have SVG icons", () => {
    render(<Footer />);

    const facebookText = screen.getByText("Facebook");
    const facebookLink = facebookText.closest("a");
    const svgInFacebook = facebookLink?.querySelector("svg");

    expect(svgInFacebook).toBeInTheDocument();
    expect(svgInFacebook).toHaveAttribute("fill", "currentColor");
    expect(svgInFacebook).toHaveClass(styles.socialIconSvg);
  });

  // Test 6: Footer has proper container classes
  test("footer has proper container and spacing classes", () => {
    render(<Footer />);

    const footerElement = screen.getByRole("contentinfo");
    expect(footerElement).toHaveClass("py-16");
    expect(footerElement).toHaveClass("mt-auto");

    const containerDiv = footerElement.querySelector(".container");
    expect(containerDiv).toHaveClass("mx-auto");
    expect(containerDiv).toHaveClass("px-6");
  });

  // Test 7: Navigation links have hover styles
  test("navigation links have hover styles", () => {
    render(<Footer />);

    const navLinks = screen.getAllByText(/About|Blog|Team|Contact|Terms/);

    navLinks.forEach((link) => {
      expect(link.closest("a")).toHaveClass(styles.footerLinkItem);
    });
  });
});
