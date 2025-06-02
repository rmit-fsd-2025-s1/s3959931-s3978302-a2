# Project Title: My Teaching App (Refactored)

This project has been refactored to use Next.js App Router and a modular project structure.

## Project Structure Overview

- `my-teaching-app/src/app/`: Contains all routes, layouts, and pages using the Next.js App Router.
  - `(auth)/`: Route group for authentication (signin, signup).
  - `lecturer/`: Lecturer dashboard section.
  - `tutor/`: Tutor dashboard section.
  - `layout.tsx`: Main root layout.
  - `page.tsx`: Application home page.
- `my-teaching-app/src/modules/`: Contains domain-specific modules (auth, course, home, lecturer, tutor).
  - Each module typically has `components/`, `pages/` (for page components used by `app/`), `utils/`, and `styles/` (for CSS modules or module-specific global styles).
- `my-teaching-app/src/shared/`: Contains shared resources across the application.
  - `components/`: Shared React components (layout elements, common UI like Toast, Modal).
  - `contexts/`: Shared React contexts (if any, e.g. potentially for future ThemeContext).
  - `hooks/`: Shared React hooks (e.g., `useTheme`).
  - `styles/`: Global styles, CSS variables, themes, Tailwind base.
  - `types/`: Global TypeScript type definitions.
- `my-teaching-app/src/tests/`: Contains global test setup. Module/component specific tests are co-located (e.g., `src/shared/components/common/toast/__tests__/toast.spec.tsx`).
- `my-teaching-app/public/`: Static assets.
- Configuration files (`next.config.ts`, `tailwind.config.js`, `tsconfig.json`, etc.) remain at the root of `my-teaching-app/`.

## Key Changes

- Migrated from Next.js Pages Router (implied by old `_app.tsx`, `_document.tsx` references) to App Router.
- Styling refactored to use CSS Modules for component-specific styles, with global styles in `src/shared/styles/`.
- TypeScript types centralized in `src/shared/types/`.
- Utility functions are being organized into module-specific `utils/` or shared utils.
- Data fetching and state management (currently using `localStorage` extensively) are marked for future refactoring to use proper services/API calls and state management solutions.
- The `my-teaching-app/src/modules/core/` directory has been phased out. Its contents (hooks, utils, components, contexts, tests) have been moved to `shared/` or relevant feature modules (e.g., `course`), or deleted if redundant.
- `my-teaching-app/src/modules/home/styles/animations.css` has been merged into `my-teaching-app/src/modules/home/pages/HomePage.module.css`.
- Navigation in dashboard pages (`TutorDashboardPage.tsx`, `LecturerDashboardPage.tsx`) and `SignInForm.tsx` updated to use Next.js 13+ App Router `redirect`.
- Validation logic from `SignInForm.tsx` moved to a shared utility in `my-teaching-app/src/modules/auth/utils/authValidation.utils.ts`.

## Getting Started

1.  **Install Dependencies:**

    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

2.  **Run Development Server:**

    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

3.  **Build for Production:**
    ```bash
    npm run build
    # or
    # yarn build
    # or
    # pnpm build
    ```

## Further Refactoring Notes

- The `my-teaching-app/src/modules/core/` directory has been **REMOVED**.
  - **DONE:** `my-teaching-app/src/modules/core/components/Timeline/` was empty and its parent structure deleted.
- The `HomePage.tsx` component sections (Lecturer cards, Stats) are largely componentized (`LecturerShowcase`, `HomeStats`).
  - **DONE:** Redundant stats-related styles removed from `HomePage.module.css`.
- **DONE:** Review of component/utility imports. Core module imports removed/updated. Further review might be needed for other inter-module dependencies.
- **DONE:** `my-teaching-app/src/modules/home/styles/animations.css` merged into `HomePage.module.css`.
- Old utility files status:
  - `tutorUtils.ts`: **REMOVED**. Non-localStorage parts (`availableSkills`, `getRandomSkills`) were already present in `applicationDisplay.utils.ts`. Remainder was localStorage-dependent.
  - `lecturerUtils.ts`: **REMOVED**. Non-localStorage parts moved to `lecturerDisplay.utils.ts`. `Lecturer` type is in `shared/types/`. Remainder was localStorage-dependent.
  - `userAccounts.ts`: Refactored. `UserAccount` type imported from `shared/types/`. Non-localStorage `validateRoleSpecificEmail` moved to `authValidation.utils.ts`. File now contains mock data and localStorage-dependent functions, marked for backend replacement.
- All `localStorage` usage for data persistence should be replaced with a proper backend API and client-side data fetching strategy (e.g., React Query, SWR, or Next.js Server Components/Actions). **(This is the major task being deferred for now).**
- Review all remaining `// TODO:` comments in the codebase for other pending tasks.
- Perform a full build (`npm run build`) and thorough testing after these refactoring steps.

## Outstanding // TODO: Comments

This section lists `// TODO:` comments found in the codebase that require attention. Items related to `localStorage` replacement are part of a larger deferred task.

- **`src/tests/app/layout.test.tsx`**

  - **UPDATED:** `// TODO: Add more tests when RootLayout includes Header, Footer, or ContextProviders...` (Original was `// TODO: Add more tests:`, basic smoke test added, further tests depend on layout evolution)

- **`src/modules/tutor/utils/applicationDisplay.utils.ts`**

  - `// TODO: availableSkills should come from a central data store or API.`
  - `// TODO: Add other client-side application display/formatting helpers here.`
  - `// TODO: Implement auth logic`

- **`src/modules/tutor/pages/TutorDashboardPage.tsx`**

  - `// TODO: Refactor localStorage logic to use services/API calls`
  - **DONE (Navigation):** `// TODO: Refactor navigation` (replaced with `redirect`)
  - **DONE (Styles):** `// TODO: Update styles to use tutor-dashboard-layout.module.css`

- **`src/modules/lecturer/utils/lecturerDisplay.utils.ts`**

  - `// TODO: lecturers data to be moved to a mock data service later.`
  - `// TODO: Add other client-side lecturer display helpers here.`

- **`src/modules/lecturer/pages/LecturerDashboardPage.tsx`**

  - `// TODO: Refactor localStorage logic to use services/API calls`
  - **DONE (Navigation):** `// TODO: Refactor navigation (router.push) to use Next.js 13+ App Router navigation (e.g. redirect, Link, or navigation hooks)`
  - `// TODO: Further break down this page into smaller components if needed` (Skipped for now - subjective)
  - **DONE (Styles):** `// TODO: Update styles to use lecturer-dashboard-layout.module.css`

- **`src/modules/home/components/home-stats/HomeStats.tsx`**

  - `// TODO: Fetch actual number of active users or make it configurable`

- **`src/modules/course/utils/courseDisplay.utils.ts`**

  - `// TODO: availableCourses should eventually be fetched from an API or a central data store.`
  - `// TODO: getCoursesWithDetails, getCourseByCode, searchCourses might belong to a data service/layer later.`

- **`src/modules/auth/hooks/useAuth.ts`**

  - `// TODO: Implement auth logic`

- **`src/shared/hooks/useTheme.ts`** (Moved from `core/hooks`)

  - `// TODO: Implement theme logic`

- **`src/modules/auth/components/signup-form/signup-form.tsx`**

  - **IN PROGRESS:** `// TODO: Implement actual sign-up logic, state, and handlers.` (Basic form interactivity and state handling added; submission logic is placeholder)

- **`src/modules/auth/components/signin-form/signin-form.tsx`**
  - **DONE:** `// TODO: Move validation logic to a shared utility or hook`
  - `// TODO: Replace localStorage logic with API calls/services`
  - **DONE (Navigation):** `// TODO: Refactor navigation to use props or a navigation service` (Replaced with `redirect`)
  - **DONE (Routing):** `// TODO: Refactor routing` (Replaced with `redirect`)

(This list was generated by a codebase search. Please verify and update as tasks are completed.)

(Add any other specific instructions or notes relevant to this project.)
