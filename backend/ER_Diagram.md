# Teaching Tutor (TT) Database Schema - ER Diagram

## Entities and Relationships

### 1. Users

**Purpose**: Store all users in the system (candidates, lecturers, admin)

- **id** (Primary Key, INT, AUTO_INCREMENT)
- **email** (UNIQUE, VARCHAR(255), NOT NULL)
- **password** (VARCHAR(255), NOT NULL) - hashed
- **firstName** (VARCHAR(100), NOT NULL)
- **lastName** (VARCHAR(100), NOT NULL)
- **userType** (ENUM: 'candidate', 'lecturer', 'admin', NOT NULL)
- **phone** (VARCHAR(20), NULLABLE)
- **isBlocked** (BOOLEAN, DEFAULT FALSE) - for admin to block/unblock users
- **createdAt** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- **updatedAt** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 2. Courses

**Purpose**: Store course information

- **id** (Primary Key, INT, AUTO_INCREMENT)
- **courseCode** (UNIQUE, VARCHAR(20), NOT NULL) - e.g., "COSC2758"
- **courseName** (VARCHAR(255), NOT NULL)
- **semester** (VARCHAR(50), NOT NULL) - e.g., "Semester 1 2025"
- **description** (TEXT, NULLABLE)
- **maxTutors** (INT, DEFAULT 5) - maximum tutors needed
- **maxLabAssistants** (INT, DEFAULT 3) - maximum lab assistants needed
- **createdAt** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- **updatedAt** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 3. Roles

**Purpose**: Define the types of roles candidates can apply for

- **id** (Primary Key, INT, AUTO_INCREMENT)
- **roleName** (UNIQUE, VARCHAR(50), NOT NULL) - 'tutor' or 'lab_assistant'
- **description** (TEXT, NULLABLE)

### 4. Course_Assignments

**Purpose**: Assign lecturers to courses (Many-to-Many relationship)

- **id** (Primary Key, INT, AUTO_INCREMENT)
- **lecturerId** (Foreign Key to Users.id, NOT NULL)
- **courseId** (Foreign Key to Courses.id, NOT NULL)
- **assignedAt** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- **UNIQUE(lecturerId, courseId)** - Prevent duplicate assignments

### 5. Applications

**Purpose**: Store candidate applications for tutor/lab assistant roles

- **id** (Primary Key, INT, AUTO_INCREMENT)
- **candidateId** (Foreign Key to Users.id, NOT NULL)
- **courseId** (Foreign Key to Courses.id, NOT NULL)
- **roleId** (Foreign Key to Roles.id, NOT NULL)
- **status** (ENUM: 'pending', 'selected', 'rejected', DEFAULT 'pending')
- **availability** (JSON or TEXT) - when candidate is available
- **skills** (TEXT) - candidate's relevant skills
- **experience** (TEXT) - candidate's experience
- **motivation** (TEXT) - why they want the role
- **appliedAt** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- **updatedAt** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- **UNIQUE(candidateId, courseId, roleId)** - Prevent duplicate applications

### 6. Selected_Candidates

**Purpose**: Track which candidates have been selected for which courses and roles

- **id** (Primary Key, INT, AUTO_INCREMENT)
- **applicationId** (Foreign Key to Applications.id, NOT NULL)
- **selectedBy** (Foreign Key to Users.id, NOT NULL) - lecturer who selected
- **selectedAt** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## Relationships

### One-to-Many Relationships:

1. **Users → Course_Assignments** (One lecturer can be assigned to many courses)
2. **Courses → Course_Assignments** (One course can have many lecturers)
3. **Users → Applications** (One candidate can have many applications)
4. **Courses → Applications** (One course can have many applications)
5. **Roles → Applications** (One role can have many applications)
6. **Applications → Selected_Candidates** (One application can result in one selection)
7. **Users → Selected_Candidates** (One lecturer can select many candidates)

### Many-to-Many Relationships (through junction tables):

1. **Users (lecturers) ↔ Courses** (through Course_Assignments)
2. **Users (candidates) ↔ Courses ↔ Roles** (through Applications)

## Key Constraints and Business Rules:

1. **Email uniqueness**: Each user must have a unique email address
2. **Course code uniqueness**: Each course must have a unique course code
3. **Role uniqueness**: Role names must be unique
4. **No duplicate assignments**: A lecturer cannot be assigned to the same course twice
5. **No duplicate applications**: A candidate cannot apply for the same role in the same course twice
6. **User type validation**: Only candidates can create applications
7. **Lecturer course access**: Lecturers can only see courses they are assigned to
8. **Admin privileges**: Only admin users can assign lecturers to courses and block/unblock users

## Database Normalization:

- **1NF**: All attributes contain atomic values
- **2NF**: No partial dependencies (all non-key attributes depend on the entire primary key)
- **3NF**: No transitive dependencies (non-key attributes don't depend on other non-key attributes)

The schema is normalized to 3NF, avoiding data duplication while maintaining referential integrity.

## Indexes for Performance:

- Primary keys (automatic)
- Foreign keys (automatic in most cases)
- Unique constraints on email, courseCode, roleName
- Composite indexes on frequently queried combinations:
    - (candidateId, courseId) in Applications
    - (lecturerId, courseId) in Course_Assignments
