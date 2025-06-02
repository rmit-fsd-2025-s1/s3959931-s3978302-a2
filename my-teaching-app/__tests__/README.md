# Global Test Structure

This directory contains all test files for the project, organized by type and module.

## Directory Structure

```
__tests__/
├── modules/          # Module-specific tests
│   ├── auth/         # Authentication module tests
│   ├── course/       # Course module tests
│   ├── home/         # Home module tests
│   ├── lecturer/     # Lecturer module tests
│   └── tutor/        # Tutor module tests
├── components/       # Shared component tests
├── utils/           # Utility function tests
├── integration/     # Integration tests
└── e2e/            # End-to-end tests
```

## Test File Naming Convention

- Unit tests: `*.spec.ts` or `*.test.ts`
- Integration tests: `*.integration.spec.ts`
- E2E tests: `*.e2e.spec.ts`

## Organization Guidelines

- **Module tests**: Place tests for module-specific components, utils, and hooks in `modules/[module-name]/`
- **Shared component tests**: Place in `components/`
- **Utility tests**: Place in `utils/`
- **Integration tests**: Place in `integration/`
- **E2E tests**: Place in `e2e/`

## Benefits of Global Test Structure

1. **Centralized**: All tests in one location for easy discovery
2. **Organized**: Clear separation by test type and module
3. **Scalable**: Easy to add new test categories
4. **Tooling-friendly**: Most test runners can easily find all tests
5. **CI/CD-friendly**: Simple to run all tests or specific categories
