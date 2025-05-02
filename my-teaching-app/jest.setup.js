// Add Jest custom matchers from testing-library
import "@testing-library/jest-dom";

// Mock for next/router
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

// Mock for framer-motion
jest.mock("framer-motion", () => ({
    motion: {
        div: require("react").forwardRef(({ children, ...props }, ref) => (
            <div ref={ref} {...props}>
                {children}
            </div>
        )),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Setup to suppress console errors during tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
