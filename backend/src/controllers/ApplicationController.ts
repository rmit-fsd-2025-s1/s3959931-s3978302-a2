import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Application, ApplicationStatus } from "../entities/Application";
import { Course } from "../entities/Course";
import { Role } from "../entities/Role";
import { User, UserType } from "../entities/User";
import { CourseAssignment } from "../entities/CourseAssignment";
import { SelectedCandidate } from "../entities/SelectedCandidate";
import { AuthenticatedRequest } from "../middleware/auth";
import { validateApplicationData } from "../utils/validation";

export class ApplicationController {
    private applicationRepository = AppDataSource.getRepository(Application);
    private courseRepository = AppDataSource.getRepository(Course);
    private roleRepository = AppDataSource.getRepository(Role);
    private userRepository = AppDataSource.getRepository(User);
    private courseAssignmentRepository = AppDataSource.getRepository(CourseAssignment);
    private selectedCandidateRepository = AppDataSource.getRepository(SelectedCandidate);

    // PA Part C: Create new application
    async createApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { courseId, roleId, availability, skills, experience, motivation } = req.body;
            const candidateId = req.user?.userId;

            console.log("🔄 Creating application for candidate:", candidateId);

            // Validate input
            const validation = validateApplicationData(req.body);
            if (!validation.isValid) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors,
                });
                return;
            }

            // Verify user is a candidate
            const candidate = await this.userRepository.findOne({
                where: { id: candidateId, userType: UserType.CANDIDATE },
            });

            if (!candidate) {
                res.status(403).json({
                    success: false,
                    message: "Only candidates can submit applications",
                });
                return;
            }

            // Verify course and role exist
            const course = await this.courseRepository.findOne({ where: { id: courseId } });
            const role = await this.roleRepository.findOne({ where: { id: roleId } });

            if (!course || !role) {
                res.status(404).json({
                    success: false,
                    message: "Course or role not found",
                });
                return;
            }

            // Check for duplicate application
            const existingApplication = await this.applicationRepository.findOne({
                where: {
                    candidateId,
                    courseId,
                    roleId,
                },
            });

            if (existingApplication) {
                res.status(409).json({
                    success: false,
                    message: `You have already applied for ${role.roleName} role in ${course.courseCode}`,
                });
                return;
            }

            // Create new application
            const newApplication = this.applicationRepository.create({
                candidateId,
                courseId,
                roleId,
                availability: { type: availability }, // Store as JSON
                skills,
                experience,
                motivation,
                status: ApplicationStatus.PENDING,
            });

            const savedApplication = await this.applicationRepository.save(newApplication);

            console.log("✅ Application created successfully:", savedApplication.id);

            res.status(201).json({
                success: true,
                message: "Application submitted successfully",
                data: savedApplication,
            });
        } catch (error) {
            console.error("💥 Error creating application:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // PA Part C: Get candidate's applications
    async getMyCandidateApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const candidateId = req.user?.userId;

            const applications = await this.applicationRepository.find({
                where: { candidateId },
                relations: ["course", "role"],
                order: { appliedAt: "DESC" },
            });

            res.status(200).json({
                success: true,
                data: applications,
            });
        } catch (error) {
            console.error("💥 Error fetching candidate applications:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // PA Part C: Get available courses and roles for candidates
    async getCoursesAndRoles(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const courses = await this.courseRepository.find({
                order: { courseCode: "ASC" },
            });

            const roles = await this.roleRepository.find({
                order: { roleName: "ASC" },
            });

            res.status(200).json({
                success: true,
                data: { courses, roles },
            });
        } catch (error) {
            console.error("💥 Error fetching courses and roles:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // CR Part: Get applications with advanced filtering for lecturers
    async getApplicationsForLecturer(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const lecturerId = req.user?.userId;
            const {
                candidateName,
                roleType,
                availability,
                skills,
                courseCode,
                status = "all",
            } = req.query;

            console.log("🔄 Fetching applications for lecturer:", lecturerId);

            // Verify user is a lecturer
            const lecturer = await this.userRepository.findOne({
                where: { id: lecturerId, userType: UserType.LECTURER },
            });

            if (!lecturer) {
                res.status(403).json({
                    success: false,
                    message: "Only lecturers can access applications",
                });
                return;
            }

            // Get lecturer's assigned courses
            const courseAssignments = await this.courseAssignmentRepository.find({
                where: { lecturerId },
                relations: ["course"],
            });

            const assignedCourseIds = courseAssignments.map((ca) => ca.courseId);

            if (assignedCourseIds.length === 0) {
                res.status(200).json({
                    success: true,
                    data: [],
                    message: "No courses assigned to this lecturer",
                });
                return;
            }

            // Build query with filters
            const queryBuilder = this.applicationRepository
                .createQueryBuilder("application")
                .leftJoinAndSelect("application.candidate", "candidate")
                .leftJoinAndSelect("application.course", "course")
                .leftJoinAndSelect("application.role", "role")
                .where("application.courseId IN (:...courseIds)", {
                    courseIds: assignedCourseIds,
                });

            // Apply filters
            if (candidateName) {
                queryBuilder.andWhere(
                    "(LOWER(candidate.firstName) LIKE LOWER(:name) OR LOWER(candidate.lastName) LIKE LOWER(:name) OR LOWER(CONCAT(candidate.firstName, ' ', candidate.lastName)) LIKE LOWER(:name))",
                    { name: `%${candidateName}%` }
                );
            }

            if (roleType && roleType !== "all") {
                queryBuilder.andWhere("role.roleName = :roleType", { roleType });
            }

            if (availability && availability !== "all") {
                queryBuilder.andWhere("JSON_UNQUOTE(JSON_EXTRACT(application.availability, '$.type')) = :availability", { availability });
            }

            if (skills) {
                queryBuilder.andWhere("LOWER(application.skills) LIKE LOWER(:skills)", {
                    skills: `%${skills}%`,
                });
            }

            if (courseCode && courseCode !== "all") {
                queryBuilder.andWhere("course.courseCode = :courseCode", { courseCode });
            }

            if (status && status !== "all") {
                queryBuilder.andWhere("application.status = :status", { status });
            }

            // Order by application date (newest first)
            queryBuilder.orderBy("application.appliedAt", "DESC");

            const applications = await queryBuilder.getMany();

            console.log(`✅ Found ${applications.length} applications for lecturer`);

            res.status(200).json({
                success: true,
                data: applications,
            });
        } catch (error) {
            console.error("💥 Error fetching lecturer applications:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // DI Part: Get application statistics for visualization
    async getApplicationStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const lecturerId = req.user?.userId;

            // Verify user is a lecturer
            const lecturer = await this.userRepository.findOne({
                where: { id: lecturerId, userType: UserType.LECTURER },
            });

            if (!lecturer) {
                res.status(403).json({
                    success: false,
                    message: "Only lecturers can access statistics",
                });
                return;
            }

            // Get lecturer's assigned courses
            const courseAssignments = await this.courseAssignmentRepository.find({
                where: { lecturerId },
                relations: ["course"],
            });

            const assignedCourseIds = courseAssignments.map((ca) => ca.courseId);

            if (assignedCourseIds.length === 0) {
                res.status(200).json({
                    success: true,
                    data: {
                        totalApplications: 0,
                        applicationsByRole: { tutor: 0, lab_assistant: 0 },
                        applicationsByCourse: [],
                        applicationsByStatus: { pending: 0, selected: 0, rejected: 0 },
                        skillFrequency: [],
                        availabilityDistribution: { partTime: 0, fullTime: 0 },
                    },
                });
                return;
            }

            // Get all applications for assigned courses
            const applications = await this.applicationRepository.find({
                where: assignedCourseIds.map(courseId => ({ courseId })),
                relations: ["course", "role", "candidate"],
            });

            // Calculate statistics
            const stats = {
                totalApplications: applications.length,
                applicationsByRole: {
                    tutor: applications.filter(app => app.role.roleName === "tutor").length,
                    lab_assistant: applications.filter(app => app.role.roleName === "lab_assistant").length,
                },
                applicationsByCourse: this.groupByCourse(applications),
                applicationsByStatus: {
                    pending: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
                    selected: applications.filter(app => app.status === ApplicationStatus.SELECTED).length,
                    rejected: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
                },
                skillFrequency: this.calculateSkillFrequency(applications),
                availabilityDistribution: this.calculateAvailabilityDistribution(applications),
            };

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error("💥 Error fetching application statistics:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // CR Part: Update application status
    async updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const lecturerId = req.user?.userId;

            const application = await this.applicationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ["course", "role", "candidate"],
            });

            if (!application) {
                res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
                return;
            }

            // Verify lecturer has access to this application's course
            const courseAssignment = await this.courseAssignmentRepository.findOne({
                where: {
                    lecturerId,
                    courseId: application.courseId,
                },
            });

            if (!courseAssignment) {
                res.status(403).json({
                    success: false,
                    message: "You don't have access to this application",
                });
                return;
            }

            // Update application status
            application.status = status;
            const updatedApplication = await this.applicationRepository.save(application);

            // If selected, create SelectedCandidate record
            if (status === ApplicationStatus.SELECTED) {
                const existingSelection = await this.selectedCandidateRepository.findOne({
                    where: { applicationId: application.id },
                });

                if (!existingSelection) {
                    const selection = this.selectedCandidateRepository.create({
                        applicationId: application.id,
                        selectedById: lecturerId,
                    });
                    await this.selectedCandidateRepository.save(selection);
                }
            }

            res.status(200).json({
                success: true,
                message: "Application status updated successfully",
                data: updatedApplication,
            });
        } catch (error) {
            console.error("💥 Error updating application status:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Helper methods for statistics calculation
    private groupByCourse(applications: Application[]): Array<{ course: string; count: number }> {
        const courseGroups = applications.reduce((acc, app) => {
            const courseKey = app.course.courseCode;
            acc[courseKey] = (acc[courseKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(courseGroups).map(([course, count]) => ({ course, count }));
    }

    private calculateSkillFrequency(applications: Application[]): Array<{ skill: string; frequency: number }> {
        const skillCounts = {} as Record<string, number>;

        applications.forEach((app) => {
            if (app.skills) {
                // Split skills by common delimiters and normalize
                const skills = app.skills
                    .split(/[,;|\n]/)
                    .map(skill => skill.trim().toLowerCase())
                    .filter(skill => skill.length > 0);

                skills.forEach((skill) => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            }
        });

        return Object.entries(skillCounts)
            .map(([skill, frequency]) => ({ skill, frequency }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 20); // Top 20 skills
    }

    private calculateAvailabilityDistribution(applications: Application[]): { partTime: number; fullTime: number } {
        let partTime = 0;
        let fullTime = 0;

        applications.forEach((app) => {
            if (app.availability && typeof app.availability === 'object') {
                const availabilityType = (app.availability as any).type;
                if (availabilityType === 'Part Time') {
                    partTime++;
                } else if (availabilityType === 'Full Time') {
                    fullTime++;
                }
            }
        });

        return { partTime, fullTime };
    }

    // PA Part D: Get assigned courses for lecturer
    async getAssignedCoursesForLecturer(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const lecturerId = req.user?.userId;

            console.log("🔄 Fetching assigned courses for lecturer:", lecturerId);

            // Verify user is a lecturer
            const lecturer = await this.userRepository.findOne({
                where: { id: lecturerId, userType: UserType.LECTURER },
            });

            if (!lecturer) {
                res.status(403).json({
                    success: false,
                    message: "Only lecturers can access assigned courses",
                });
                return;
            }

            // Get lecturer's assigned courses with course details
            const courseAssignments = await this.courseAssignmentRepository.find({
                where: { lecturerId },
                relations: ["course"],
                order: { course: { courseCode: "ASC" } },
            });

            const assignedCourses = courseAssignments.map(ca => ca.course);

            console.log(`✅ Found ${assignedCourses.length} assigned courses for lecturer`);

            res.status(200).json({
                success: true,
                data: assignedCourses,
            });
        } catch (error) {
            console.error("💥 Error fetching assigned courses:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Comment management methods
    async updateApplicationComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const lecturerId = req.user?.userId;

            const application = await this.applicationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ["course", "role", "candidate"],
            });

            if (!application) {
                res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
                return;
            }

            // Verify lecturer has access to this application's course
            const courseAssignment = await this.courseAssignmentRepository.findOne({
                where: {
                    lecturerId,
                    courseId: application.courseId,
                },
            });

            if (!courseAssignment) {
                res.status(403).json({
                    success: false,
                    message: "You don't have access to this application",
                });
                return;
            }

            // Update comment
            application.comment = comment || "";
            application.commentedBy = lecturerId;
            application.commentedAt = new Date();

            const updatedApplication = await this.applicationRepository.save(application);

            res.status(200).json({
                success: true,
                message: "Comment updated successfully",
                data: updatedApplication,
            });
        } catch (error) {
            console.error("💥 Error updating application comment:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    async deleteApplicationComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.userId;

            const application = await this.applicationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ["course", "role", "candidate"],
            });

            if (!application) {
                res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
                return;
            }

            // Verify lecturer has access to this application's course
            const courseAssignment = await this.courseAssignmentRepository.findOne({
                where: {
                    lecturerId,
                    courseId: application.courseId,
                },
            });

            if (!courseAssignment) {
                res.status(403).json({
                    success: false,
                    message: "You don't have access to this application",
                });
                return;
            }

            // Clear comment
            application.comment = "";
            application.commentedBy = undefined;
            application.commentedAt = undefined;

            const updatedApplication = await this.applicationRepository.save(application);

            res.status(200).json({
                success: true,
                message: "Comment deleted successfully",
                data: updatedApplication,
            });
        } catch (error) {
            console.error("💥 Error deleting application comment:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Ranking management methods
    async addApplicationToRanking(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { rank, courseCode } = req.body;
            const lecturerId = req.user?.userId;

            const application = await this.applicationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ["course", "role", "candidate"],
            });

            if (!application) {
                res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
                return;
            }

            // Verify lecturer has access to this application's course
            const courseAssignment = await this.courseAssignmentRepository.findOne({
                where: {
                    lecturerId,
                    courseId: application.courseId,
                },
            });

            if (!courseAssignment) {
                res.status(403).json({
                    success: false,
                    message: "You don't have access to this application",
                });
                return;
            }

            // Verify application is selected
            if (application.status !== ApplicationStatus.SELECTED) {
                res.status(400).json({
                    success: false,
                    message: "Application must be selected before adding to ranking",
                });
                return;
            }

            // Update ranking
            application.rank = rank;
            application.rankedBy = lecturerId;
            application.rankedAt = new Date();
            application.rankedForCourse = courseCode;

            const updatedApplication = await this.applicationRepository.save(application);

            res.status(200).json({
                success: true,
                message: "Application added to ranking successfully",
                data: updatedApplication,
            });
        } catch (error) {
            console.error("💥 Error adding application to ranking:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    async updateApplicationRanking(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { rank, courseCode } = req.body;
            const lecturerId = req.user?.userId;

            const application = await this.applicationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ["course", "role", "candidate"],
            });

            if (!application) {
                res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
                return;
            }

            // Verify lecturer has access to this application's course
            const courseAssignment = await this.courseAssignmentRepository.findOne({
                where: {
                    lecturerId,
                    courseId: application.courseId,
                },
            });

            if (!courseAssignment) {
                res.status(403).json({
                    success: false,
                    message: "You don't have access to this application",
                });
                return;
            }

            // Update ranking
            application.rank = rank;
            application.rankedBy = lecturerId;
            application.rankedAt = new Date();
            application.rankedForCourse = courseCode;

            const updatedApplication = await this.applicationRepository.save(application);

            res.status(200).json({
                success: true,
                message: "Application ranking updated successfully",
                data: updatedApplication,
            });
        } catch (error) {
            console.error("💥 Error updating application ranking:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    async removeApplicationFromRanking(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.userId;

            const application = await this.applicationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ["course", "role", "candidate"],
            });

            if (!application) {
                res.status(404).json({
                    success: false,
                    message: "Application not found",
                });
                return;
            }

            // Verify lecturer has access to this application's course
            const courseAssignment = await this.courseAssignmentRepository.findOne({
                where: {
                    lecturerId,
                    courseId: application.courseId,
                },
            });

            if (!courseAssignment) {
                res.status(403).json({
                    success: false,
                    message: "You don't have access to this application",
                });
                return;
            }

            // Remove ranking
            application.rank = undefined;
            application.rankedBy = undefined;
            application.rankedAt = undefined;
            application.rankedForCourse = undefined;

            const updatedApplication = await this.applicationRepository.save(application);

            res.status(200).json({
                success: true,
                message: "Application removed from ranking successfully",
                data: updatedApplication,
            });
        } catch (error) {
            console.error("💥 Error removing application from ranking:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
} 