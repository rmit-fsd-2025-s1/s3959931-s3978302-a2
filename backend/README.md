# Teaching Tutor (TT) Backend API

This is the backend API for the Teaching Tutor application, built with Node.js, Express, and TypeORM with MySQL database.

## Prerequisites

- Node.js (version 16 or higher)
- MySQL Database (Cloud MySQL provided: 209.38.26.237:3306)
- Access to phpMyAdmin: https://getmysql.com/

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration and connection
│   ├── entities/                # TypeORM entity models
│   │   ├── User.ts             # User entity (candidates, lecturers, admin)
│   │   ├── Course.ts           # Course entity
│   │   ├── Role.ts             # Role entity (tutor, lab_assistant)
│   │   ├── CourseAssignment.ts # Lecturer-Course assignment junction
│   │   ├── Application.ts      # Candidate applications
│   │   └── SelectedCandidate.ts # Selected candidates tracking
│   ├── controllers/            # Route controllers
│   │   └── AuthController.ts   # Authentication controller (signup, signin, logout, profile)
│   ├── routes/                 # API routes
│   │   └── auth.ts             # Authentication routes (/api/auth)
│   ├── middleware/             # Custom middleware
│   │   └── auth.ts             # JWT authentication and authorization middleware
│   ├── utils/                  # Utility functions
│   │   └── validation.ts       # Input validation functions
│   └── index.ts               # Server entry point
├── dist/                      # Compiled JavaScript files
├── ER_Diagram.md             # Database schema documentation
├── package.json              # Project dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## Database Schema Overview

The database consists of 6 main entities with the following relationships:

### Entities:

1. **Users** - Stores all users (candidates, lecturers, admin)
2. **Courses** - Course information and capacity
3. **Roles** - Types of positions (tutor, lab_assistant)
4. **CourseAssignments** - Many-to-many relationship between lecturers and courses
5. **Applications** - Candidate applications for specific roles in courses
6. **SelectedCandidates** - Tracks final selections made by lecturers

### Key Relationships:

- **Users (lecturers) ↔ Courses** (Many-to-Many via CourseAssignments)
- **Users (candidates) → Applications** (One-to-Many)
- **Courses → Applications** (One-to-Many)
- **Roles → Applications** (One-to-Many)
- **Applications → SelectedCandidates** (One-to-One)

## Setup Instructions

1. **Clone and Install Dependencies**

    ```bash
    cd backend
    npm install
    ```

2. **Environment Configuration**

    ```bash
    # Copy the example environment file
    cp env.example .env

    # Edit .env with your database credentials
    DB_HOST=209.38.26.237
    DB_PORT=3306
    DB_USERNAME=your_mysql_username
    DB_PASSWORD=your_mysql_password
    DB_NAME=your_database_name
    JWT_SECRET=your_secure_jwt_secret
    ```

3. **Build the Project**

    ```bash
    npm run build
    ```

4. **Start the Server**

    ```bash
    # Development mode (with auto-reload)
    npm run dev

    # Production mode
    npm start
    ```

## Database Features

### Auto-Synchronization

- In development mode, TypeORM automatically creates/updates database tables
- Tables are created based on the entity decorators and relationships

### Default Data Seeding

- Automatically creates default roles ("tutor" and "lab_assistant") on startup
- Can be extended to seed other default data

### Business Logic Constraints

- **Email uniqueness** across all users
- **Course code uniqueness**
- **No duplicate lecturer-course assignments**
- **No duplicate applications** (same candidate can't apply twice for the same role in the same course)
- **User type validation** ensures only candidates can create applications
- **Password Hashing**: User passwords are securely hashed using bcrypt before storing.
- **JWT Authentication**: Secure token-based authentication for protected routes.

## Entity Details

### User Entity

- Supports three user types: candidate, lecturer, admin
- Includes blocking functionality for admin control
- Automatic timestamp tracking

### Course Entity

- Tracks maximum tutors and lab assistants needed
- Semester-based organization
- Supports course descriptions
- Status tracking (pending, selected, rejected)
- Prevents duplicate applications with unique composite index

### Application Entity

- JSON field for availability data
- Text fields for skills, experience, and motivation
- Status tracking (pending, selected, rejected)
- Prevents duplicate applications with unique composite index

### Role System

- Extensible role system (currently tutor and lab_assistant)
- Static constants for easy reference in code

## API Endpoints

The following endpoints have been implemented:

### Authentication (`/api/auth`)

- **POST /signup**: Register a new user.
- **POST /signin**: Log in an existing user and receive a JWT.
- **POST /logout**: Log out a user (currently invalidates token on client-side).
- **GET /profile**: Get the current logged-in user's profile (requires authentication).

The following endpoints will be implemented in subsequent tasks:

- User profile management (update profile)
- Course management
- Application submission and management
- Lecturer dashboard for reviewing applications
- Admin panel for user and course management

## Authentication Features

- **User Registration (`/api/auth/signup`):**
    - Validates input data (name, email, password, user type).
    - Checks for existing email.
    - Hashes password using `bcryptjs`.
    - Saves new user to the database.
    - Returns user information and a JWT.
- **User Sign-in (`/api/auth/signin`):**
    - Validates input data (email, password).
    - Finds user by email.
    - Compares submitted password with stored hash using `bcryptjs`.
    - Generates and returns a JWT upon successful authentication.
- **User Logout (`/api/auth/logout`):**
    - Intended for client-side token removal. Server-side session invalidation can be added if needed.
- **Get User Profile (`/api/auth/profile`):**
    - Protected route requiring a valid JWT.
    - Fetches and returns the authenticated user's details (excluding password).
- **Password Hashing:**
    - `bcryptjs` is used to hash passwords with a salt, providing strong protection against rainbow table attacks.
- **JSON Web Tokens (JWT):**
    - Used for stateless authentication.
    - A secret key (`JWT_SECRET` in `.env`) is used to sign tokens.
    - Tokens include user ID, email, and user type.
    - Tokens have an expiration time (configurable).
- **Middleware:**
    - `authenticateToken`: Verifies the JWT in the `Authorization` header for protected routes.
    - `requireUserType`: (Example created, can be used to restrict routes based on user type).
- **Input Validation:**
    - Separate validation functions (`validateSignupData`, `validateSigninData`) ensure data integrity before processing by controllers.

## Development Scripts

```bash
npm run build    # Compile TypeScript to JavaScript
npm run dev      # Start development server with hot reload
npm start        # Start production server
npm run typeorm  # Run TypeORM CLI commands
```

## Database Access

- **phpMyAdmin**: https://getmysql.com/
- **Server**: 209.38.26.237:3306
- Use your provided MySQL credentials

## Notes

- This project uses TypeORM decorators for entity definitions
- Strict TypeScript compilation with decorators enabled
- Auto-generated timestamps for auditing
- Foreign key constraints ensure data integrity
- Indexed fields for performance optimization

For the complete ER diagram and detailed schema information, see `ER_Diagram.md`.

## Testing Status and Process

**Current Status:** Ready for Manual End-to-End Testing

**Process:**

The primary method for testing the authentication features involves manual end-to-end testing of the user flows. This includes:

1.  **Sign-up:**
    - Navigate to the `/signup` page.
    - Attempt to create new accounts with valid data for different user types (Candidate, Lecturer).
    - Verify successful registration and redirection (e.g., to sign-in or profile page).
    - Check for appropriate error messages with invalid data (e.g., mismatched passwords, existing email, invalid email format).
2.  **Sign-in:**
    - Navigate to the `/signin` page.
    - Attempt to log in with the newly created accounts and existing test accounts (if any).
    - Verify successful login, token storage (e.g., in `localStorage`), and redirection.
    - Verify the appearance of a user-specific welcome message (e.g., "Welcome [username]").
    - Test login failure with incorrect credentials and ensure appropriate error messages are displayed.
3.  **Profile Page Access:**
    - After logging in, navigate to the `/profile` page.
    - Verify that user details (name, email, join date, user type) are displayed correctly.
    - Attempt to access the `/profile` page when not logged in and verify redirection to the sign-in page or an error message.
4.  **Logout:**
    - While logged in, use the logout functionality (e.g., a logout button in the header/dropdown).
    - Verify successful logout, token removal from `localStorage`, and redirection (e.g., to the homepage or sign-in page).
    - Verify that the welcome message disappears.
    - Attempt to access protected routes (like `/profile`) after logout and confirm access is denied.
5.  **Cross-browser & Responsiveness (Optional but Recommended):**
    - Briefly check the sign-up, sign-in, and profile pages on different browsers and screen sizes to ensure basic usability.

**Backend Verification (during manual frontend testing):**

- Monitor backend server logs for any errors during sign-up, sign-in, and profile data fetching.
- Check the `users` table in the database (e.g., via phpMyAdmin) to confirm:
    - New users are created correctly upon successful sign-up.
    - Password hashes are stored (not plain text).
    - User types are correctly assigned.

This manual testing phase aims to confirm that all core authentication functionalities are working as expected from the user's perspective and that the frontend and backend are integrating correctly.
