import "@testing-library/jest-dom";
// import React from 'react'; // Commented out as unused for now

// Mock for next/router (consider next/navigation for App Router)
// For App Router, you might need to mock next/navigation instead or use a more comprehensive solution
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    query: {},
    pathname: "",
    asPath: "",
  }),
}));

// Mock for next/navigation (basic example, might need expansion for specific hooks)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: jest.fn(() => ""),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// Mock for framer-motion
jest.mock("framer-motion", () => ({
  /*
  motion: {
    div: ({ children }: any) => <>{children}</>,
  },
  */
  AnimatePresence: {},
}));

// Setup to suppress console errors during tests (use with caution)
/*
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
*/
console.log("Jest setup file loaded: src/tests/setup.ts");
