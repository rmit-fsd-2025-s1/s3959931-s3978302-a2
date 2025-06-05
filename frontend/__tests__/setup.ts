import "@testing-library/jest-dom";
import React from 'react';

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
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    section: ({ children, ...props }: any) => React.createElement('section', props, children),
    header: ({ children, ...props }: any) => React.createElement('header', props, children),
    main: ({ children, ...props }: any) => React.createElement('main', props, children),
    article: ({ children, ...props }: any) => React.createElement('article', props, children),
    h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
    h2: ({ children, ...props }: any) => React.createElement('h2', props, children),
    h3: ({ children, ...props }: any) => React.createElement('h3', props, children),
    p: ({ children, ...props }: any) => React.createElement('p', props, children),
    ul: ({ children, ...props }: any) => React.createElement('ul', props, children),
    li: ({ children, ...props }: any) => React.createElement('li', props, children),
    form: ({ children, ...props }: any) => React.createElement('form', props, children),
    input: ({ children, ...props }: any) => React.createElement('input', { ...props, children }),
    textarea: ({ children, ...props }: any) => React.createElement('textarea', props, children),
    img: ({ children, ...props }: any) => React.createElement('img', { ...props, alt: props.alt || "" }),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Create mock auth context value
const createMockAuthValue = () => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  checkLoginStatus: jest.fn(),
});

// Mock AuthContext
const mockAuthContext = React.createContext(createMockAuthValue());

// Mock useAuth hook with default implementation
const mockUseAuth = jest.fn(() => createMockAuthValue());

jest.mock("@/shared/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: any) =>
    React.createElement(mockAuthContext.Provider, { value: createMockAuthValue() }, children),
}));

// Mock AuthContext directly to prevent AuthProvider errors
jest.mock("@/modules/auth/contexts/AuthContext", () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: any) =>
    React.createElement(mockAuthContext.Provider, { value: createMockAuthValue() }, children),
  AuthContext: mockAuthContext,
}));

// Make mockUseAuth available globally for tests to override
(global as any).mockUseAuth = mockUseAuth;

// Test Wrapper component
(global as any).TestWrapper = ({ children }: any) =>
  React.createElement(mockAuthContext.Provider, { value: createMockAuthValue() }, children);

// Setup to suppress console errors/warnings/logs during tests
global.console = {
  ...console,
  log: jest.fn(), // Suppress console.log
  error: jest.fn(), // Suppress console.error
  warn: jest.fn(), // Suppress console.warn
};
