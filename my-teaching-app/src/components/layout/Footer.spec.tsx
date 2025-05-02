import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

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

        // Check for sr-only class for accessibility
        const facebookLink = screen.getByText("Facebook").closest("span");
        expect(facebookLink).toHaveClass("sr-only");
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

    // Test 4: Footer container has correct styling props
    test("footer has correct styling props", () => {
        render(<Footer />);

        const footerElement = screen.getByRole("contentinfo");
        expect(footerElement).toHaveStyle({
            backgroundColor: "var(--color-bg-secondary)",
            color: "var(--color-text-secondary)",
            borderTop: "1px solid var(--color-border)",
        });
    });

    // Test 5: Social media links have SVG icons
    test("social media links have SVG icons", () => {
        render(<Footer />);

        const facebookText = screen.getByText("Facebook");
        const facebookLink = facebookText.closest("a");
        const svgInFacebook = facebookLink?.querySelector("svg");

        expect(svgInFacebook).toBeInTheDocument();
        expect(svgInFacebook).toHaveAttribute("fill", "currentColor");
        expect(svgInFacebook).toHaveClass("h-6");
        expect(svgInFacebook).toHaveClass("w-6");
    });

    // Test 6: Footer has proper container classes
    test("footer has proper container and spacing classes", () => {
        render(<Footer />);

        const footerElement = screen.getByRole("contentinfo");
        expect(footerElement).toHaveClass("py-12");
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
            expect(link.closest("a")).toHaveClass("hover:text-gray-500");
        });
    });
});
