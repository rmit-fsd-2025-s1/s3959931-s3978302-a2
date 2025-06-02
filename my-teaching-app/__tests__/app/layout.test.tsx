import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

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

// Import the mocked functions
import { useRouter, usePathname } from "next/navigation";

describe("RootLayout", () => {
  beforeEach(() => {
    // Setup mocks for each test
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    (usePathname as jest.Mock).mockReturnValue("/");

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  it("renders children correctly", () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(container).toBeInTheDocument();
  });

  // TODO: Add more tests when RootLayout includes Header, Footer, or ContextProviders:
  // - Example: Verify Header component is rendered.
  // - Example: Verify Footer component is rendered.
  // - Example: Test behavior of any ContextProviders wrapping children.
});
