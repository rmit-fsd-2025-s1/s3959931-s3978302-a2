import React from "react";
import { render, screen } from "@testing-library/react";
import GlobalWelcomeBanner from "@/shared/components/GlobalWelcomeBanner";

describe("GlobalWelcomeBanner", () => {
  it("should return null (component is disabled)", () => {
    const { container } = render(<GlobalWelcomeBanner />);
    
    // Component should render nothing (return null)
    expect(container.firstChild).toBeNull();
    
    // Should not render any welcome banner elements
    expect(screen.queryByTestId("welcome-banner")).not.toBeInTheDocument();
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it("should not interact with localStorage since component is disabled", () => {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    render(<GlobalWelcomeBanner />);
    
    // Should not call any localStorage methods since component is disabled
    expect(localStorageMock.getItem).not.toHaveBeenCalled();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });
}); 