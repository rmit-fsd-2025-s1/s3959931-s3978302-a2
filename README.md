# TeachTeam - Tutor Application Platform

This project is a Next.js application designed to connect potential tutors and lab assistants with the School of Computer Science at RMIT University. It includes features for user authentication, a dedicated dashboard for lecturers to manage applicants and view statistics, and tutor functionality like browsing courses and applying for positions for tutors.

Repository Link: https://github.com/rmit-fsd-2025-s1/s3959931-s3978302-a1

## Features

-   User authentication (login/registration)
-   Course browsing for tutor applicants
-   Display of lecturer information
-   Application submission system for tutor/lab assistant roles
-   Uses animations (`framer-motion`) and data visualization (`recharts`).
-   Lecturer dashboard (applicant lists, details, select and rank applicants, stats visualization)

## Getting Started

### Prerequisites

-   Node.js (Check `.nvmrc` or `package.json` engines field if available, otherwise recommend latest LTS)
-   npm, yarn, pnpm, or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/rmit-fsd-2025-s1/s3959931-s3978302-a1.git
    cd s3959931-s3978302-a1/my-teaching-app
    ```
2.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The main page can be found at `my-teaching-app/src/pages/index.tsx`.

## Available Scripts

In the `my-teaching-app` directory, you can run several commands:

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production usage.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Runs the linter.

## Deployment

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for details on how to deploy this application. The Vercel platform is a common choice for Next.js apps.
