# Teaching Tutor Management System

**GitHub Repository:** https://github.com/rmit-fsd-2025-s1/s3959931-s3978302-a2

A comprehensive full-stack web application for managing teaching assistant positions, applications, and candidate selection in academic institutions. This system provides role-based interfaces for candidates, lecturers, and administrators with real-time notifications and position management capabilities.

## Architecture Overview

The application follows a modern microservices architecture with four main components:

-   **Frontend** (Next.js 15 + React 19) - Main application interface for candidates and lecturers
-   **Backend** (Node.js + Express + TypeORM) - REST API for core functionality
-   **Admin Frontend** (Next.js 15 + React 19) - Administrative dashboard
-   **Admin Backend** (Node.js + Express + GraphQL + Apollo Server) - Admin API with real-time capabilities

## Key Features

### Application Management

-   **Multi-role Applications**: Candidates can apply for Tutor and Lab Assistant positions
-   **Course-based Applications**: Apply to specific courses with position limits
-   **Real-time Position Tracking**: Dynamic calculation of available vs. filled positions
-   **Application Status Management**: Pending, Selected, and Rejected states

### User Management

-   **Role-based Access Control**: Three user types (Candidate, Lecturer, Admin)
-   **Email-based Role Assignment**: Domain-specific registration (`@candidate.edu.au`, `@lecturer.edu.au`)
-   **Account Blocking System**: Admins can block/unblock user accounts
-   **Profile Management**: User profile creation and updates

### Lecturer Dashboard

-   **Course Assignment**: Each course can have one assigned lecturer
-   **Candidate Selection**: Select candidates for available positions
-   **Ranking System**: Rank selected candidates in order of preference
-   **Application Review**: View candidate details, skills, and credentials
-   **Real-time Updates**: Instant notifications when candidates are blocked/unblocked

### Admin Interface

-   **User Management**: Create, block, unblock, and delete user accounts
-   **Course Management**: Create and manage courses with position limits
-   **Lecturer Assignment**: Assign lecturers to courses
-   **Analytics Dashboard**: View system statistics and reports
-   **Real-time Monitoring**: Live updates on system activity

### Real-time Notifications

-   **GraphQL Subscriptions**: WebSocket-based real-time updates
-   **Targeted Notifications**: Lecturer-specific notifications for relevant candidate changes
-   **Account Status Alerts**: Immediate modal notifications for blocked/deleted accounts
-   **Automatic Unselection**: Blocked candidates are automatically removed from selections

### Position Management

-   **Capacity Enforcement**: Prevents over-selection of candidates
-   **Dynamic Availability**: Real-time calculation of available positions
-   **Validation Logic**: Backend validation prevents exceeding position limits
-   **Consistent State**: Atomic operations ensure data consistency

## Technology Stack

### Frontend Technologies

-   **Framework**: Next.js 15 with App Router
-   **UI Library**: React 19
-   **Styling**: Tailwind CSS 4
-   **Animations**: Framer Motion
-   **HTTP Client**: Axios
-   **GraphQL Client**: Apollo Client
-   **Charts**: Recharts
-   **Icons**: Heroicons
-   **Type Safety**: TypeScript

### Backend Technologies

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MySQL with TypeORM
-   **Authentication**: JWT + bcrypt
-   **GraphQL**: Apollo Server + Type-GraphQL
-   **Real-time**: GraphQL Subscriptions with WebSocket
-   **Validation**: Express Validator
-   **Type Safety**: TypeScript

### Database Schema

-   **Users**: Multi-role user management with blocking capability
-   **Courses**: Course information with position limits (maxTutors, maxLabAssistants)
-   **Applications**: Candidate applications with status tracking
-   **Course Assignments**: Lecturer-to-course assignments
-   **Roles**: Tutor and Lab Assistant role definitions
-   **Selected Candidates**: Application selection and ranking system

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   MySQL database
-   Git

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/rmit-fsd-2025-s1/s3959931-s3978302-a2.git
    cd s3959931-s3978302-a2
    ```

2. **Install dependencies**

    ```bash
    npm run install
    ```

3. **Environment Setup**

    The project includes a `.env` file with database and port configuration.

### Development

**Start all services:**

```bash
# Windows
npm run dev:windows && npm run dev:admin:windows

# Mac/Linux
npm run dev:unix && npm run dev:admin:unix
```

### Service URLs

-   **Main Application**: http://localhost:3000
-   **Admin Dashboard**: http://localhost:3001
-   **Backend API**: http://localhost:5000/api
-   **Admin GraphQL**: http://localhost:4002/graphql

## User Roles & Access

### Candidates (`@candidate.edu.au`)

-   Browse available courses and positions
-   Submit applications for Tutor/Lab Assistant roles
-   View application status and feedback
-   Update profile information

### Lecturers (`@lecturer.edu.au`)

-   View assigned courses and applications
-   Select candidates for available positions
-   Rank selected candidates in order of preference
-   Add comments and feedback to applications

### Administrators (`admin@admin.com`)

-   Manage all user accounts (create, block, delete)
-   Create and configure courses with position limits
-   Assign lecturers to courses
-   View system analytics and reports

## Testing

```bash
npm run test              # Run all tests
npm run test:frontend     # Frontend tests only
npm run test:backend      # Backend tests only
```

**Testing Technologies:**

-   Jest (Test runner and framework)
-   React Testing Library (Component testing)
-   jsdom (DOM simulation)
-   Coverage reporting

## Project Structure

```
s3959931-s3978302-a2/
├── frontend/                    # Main application frontend
│   ├── src/app/                # Next.js App Router pages
│   ├── src/modules/            # Feature-based modules
│   └── __tests__/              # Test suites
├── backend/                     # Main REST API backend
│   └── src/
│       ├── entities/           # TypeORM database entities
│       ├── controllers/        # API controllers
│       └── routes/             # Express routes
├── admin-frontend/              # Admin dashboard frontend
├── admin-backend/               # GraphQL admin backend
└── package.json                # Root package management
```

## Real-time Features

### GraphQL Subscriptions

WebSocket-based real-time communication for:

-   Instant candidate blocking notifications for relevant lecturers
-   Automatic removal of blocked candidates from selections
-   Account status monitoring with immediate notifications

### Position Management

-   Real-time calculation of available positions
-   Atomic validation prevents over-selection
-   Immediate UI updates when positions change

## Security Features

### Authentication & Authorization

-   JWT-based authentication with secure token management
-   Role-based access control
-   bcrypt password hashing
-   Secure session handling

### Validation & Security

-   Comprehensive input validation (client and server)
-   TypeORM parameterized queries prevent SQL injection
-   CORS configuration
-   Secure environment variable management

## Database Design

### Key Entities

-   **Users**: Multi-role accounts with blocking capability
-   **Courses**: Course information with position limits
-   **Applications**: Candidate applications with status tracking
-   **Course Assignments**: Lecturer-to-course relationships
-   **Selected Candidates**: Application selection and ranking

### Relationships

-   Users → Applications (One-to-Many)
-   Courses → Applications (One-to-Many)
-   Users → Course Assignments (Lecturer assignments)
-   Applications → Selected Candidates (Selection tracking)

## API Documentation

### REST API Endpoints

-   `POST /api/auth/signin` - User authentication
-   `POST /api/auth/signup` - User registration
-   `GET /api/applications/courses-and-roles` - Available courses and positions
-   `POST /api/applications` - Submit application
-   `PUT /api/applications/:id/status` - Update application status
-   `GET /api/applications/lecturer-assigned-courses` - Lecturer's assigned courses

### GraphQL API (Admin Backend)

-   **Queries**: User management, course management, analytics
-   **Mutations**: CRUD operations for admin functions
-   **Subscriptions**: Real-time notifications and updates

## Deployment

### Build Commands

```bash
npm run build                    # Build all applications
npm run build:frontend           # Build frontend only
npm run build:backend            # Build backend only
```

### Production Commands

```bash
npm run start:windows            # Start all (Windows)
npm run start:unix               # Start all (Mac/Linux)
```

## Contributing

1. Clone the repository
2. Install dependencies with `npm run install`
3. Start development servers
4. Write tests for new features
5. Submit a pull request

### Code Standards

-   TypeScript with strict type checking
-   ESLint code linting
-   Prettier code formatting
-   Comprehensive test coverage

## Troubleshooting

**WebSocket Connection Errors:**

-   Ensure admin-backend is running on port 4002
-   Check firewall settings for WebSocket connections
-   Verify `NEXT_PUBLIC_ADMIN_WS_ENDPOINT` environment variable

**Database Connection Issues:**

-   Verify MySQL server is running
-   Check database credentials in `.env` file
-   Ensure database exists and is accessible

**Port Conflicts:**

-   Default ports: Frontend (3000), Backend (5000), Admin Frontend (3001), Admin Backend (4002)
-   Modify ports in `.env` file if conflicts occur

## License

This project is licensed under the ISC License.

## Team

-   **Student IDs**: s3959931, s3978302
-   **Course**: Full Stack Development - RMIT 2025 S1

---

For additional support or questions, please refer to the GitHub repository: https://github.com/rmit-fsd-2025-s1/s3959931-s3978302-a2
