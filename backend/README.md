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
│   ├── controllers/            # Route controllers (to be implemented)
│   ├── routes/                 # API routes (to be implemented)
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

## Entity Details

### User Entity

- Supports three user types: candidate, lecturer, admin
- Includes blocking functionality for admin control
- Automatic timestamp tracking

### Course Entity

- Tracks maximum tutors and lab assistants needed
- Semester-based organization
- Supports course descriptions

### Application Entity

- JSON field for availability data
- Text fields for skills, experience, and motivation
- Status tracking (pending, selected, rejected)
- Prevents duplicate applications with unique composite index

### Role System

- Extensible role system (currently tutor and lab_assistant)
- Static constants for easy reference in code

## API Endpoints (To Be Implemented)

The following endpoints will be implemented in subsequent tasks:

- User authentication (sign-up, sign-in, logout)
- User profile management
- Course management
- Application submission and management
- Lecturer dashboard for reviewing applications
- Admin panel for user and course management

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
