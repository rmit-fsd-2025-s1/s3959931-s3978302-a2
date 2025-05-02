import React from "react";
import { render, screen } from "@testing-library/react";
import Layout from "./Layout";

// Mock the Header and Footer components
jest.mock("./Header", () => {
    return function MockHeader() {
        return <div data-testid="mock-header">Header Component</div>;
    };
});

jest.mock("./Footer", () => {
    return function MockFooter() {
        return <div data-testid="mock-footer">Footer Component</div>;
    };
});

describe("Layout Component", () => {
    // Test 1: Renders header, main content, and footer
    test("renders header, main content area, and footer", () => {
        render(
            <Layout>
                <div>Test Content</div>
            </Layout>
        );

        expect(screen.getByTestId("mock-header")).toBeInTheDocument();
        expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
        expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    // Test 2: Main content is wrapped in a main tag
    test("wraps children in a main tag", () => {
        render(
            <Layout>
                <div data-testid="child-content">Child Content</div>
            </Layout>
        );

        const mainElement = screen.getByRole("main");
        expect(mainElement).toBeInTheDocument();
        expect(mainElement).toContainElement(
            screen.getByTestId("child-content")
        );
    });

    // Test 3: Main content has flex-grow class
    test("main content has flex-grow class", () => {
        render(
            <Layout>
                <div>Content</div>
            </Layout>
        );

        const mainElement = screen.getByRole("main");
        expect(mainElement).toHaveClass("flex-grow");
    });

    // Test 4: Outer container has min-h-screen class
    test("layout container has min-h-screen class for full height", () => {
        render(
            <Layout>
                <div>Content</div>
            </Layout>
        );

        // Find the outermost div which should have min-h-screen class
        const container = screen
            .getByText("Content")
            .closest("div.min-h-screen");
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass("min-h-screen");
    });

    // Test 5: Renders multiple children correctly
    test("renders multiple children correctly", () => {
        render(
            <Layout>
                <div data-testid="child1">Child 1</div>
                <div data-testid="child2">Child 2</div>
                <div data-testid="child3">Child 3</div>
            </Layout>
        );

        expect(screen.getByTestId("child1")).toBeInTheDocument();
        expect(screen.getByTestId("child2")).toBeInTheDocument();
        expect(screen.getByTestId("child3")).toBeInTheDocument();
    });

    // Test 6: Layout uses flex layout
    test("layout container uses flex layout", () => {
        render(
            <Layout>
                <div>Content</div>
            </Layout>
        );

        const container = screen.getByText("Content").closest("div.flex");
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass("flex");
        expect(container).toHaveClass("flex-col");
    });

    // Test 7: Main content has appropriate padding
    test("main content has top padding", () => {
        render(
            <Layout>
                <div>Content</div>
            </Layout>
        );

        const mainElement = screen.getByRole("main");
        expect(mainElement).toHaveClass("pt-24");
    });
});
