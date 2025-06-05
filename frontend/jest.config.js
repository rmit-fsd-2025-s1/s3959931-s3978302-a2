// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require("next/jest").default;

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleNameMapper: {
    // Handle module aliases - map @/ to src/
    "^@/(.*)$": "<rootDir>/src/$1",
    // Handle shared hooks specifically
    "^@/shared/hooks/(.*)$": "<rootDir>/src/shared/hooks/$1",
    // Handle shared utils
    "^@/shared/utils/(.*)$": "<rootDir>/src/shared/utils/$1",
    // Handle shared components
    "^@/shared/components/(.*)$": "<rootDir>/src/shared/components/$1",
    // Handle shared services
    "^@/shared/services/(.*)$": "<rootDir>/src/shared/services/$1",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  testMatch: ["**/__tests__/**/*.(test|spec).[jt]s?(x)"],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ["node_modules", "<rootDir>/"],
  // Mock modules that might cause issues in tests
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "/node_modules/(?!(framer-motion)/)"
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
