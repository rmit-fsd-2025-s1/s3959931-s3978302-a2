import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Int,
    ObjectType,
    Field,
    InputType,
} from "type-graphql";
import { Course } from "../types/Course";
import { CourseAssignment } from "../types/CourseAssignment";
import { User, UserType } from "../types/User";
import { ApplicationStatus } from "../types/Application";
import { AppDataSource } from "../config/database";

@InputType()
class CourseInput {
    @Field()
    courseCode: string;

    @Field()
    courseName: string;

    @Field()
    semester: string;

    @Field({ nullable: true })
    description?: string;

    @Field(() => Int)
    maxTutors: number;

    @Field(() => Int)
    maxLabAssistants: number;
}

@ObjectType()
class CourseResponse {
    @Field()
    success: boolean;

    @Field({ nullable: true })
    message?: string;

    @Field(() => Course, { nullable: true })
    course?: Course;
}

@ObjectType()
class AssignmentResponse {
    @Field()
    success: boolean;

    @Field({ nullable: true })
    message?: string;

    @Field(() => CourseAssignment, { nullable: true })
    assignment?: CourseAssignment;
}

@Resolver()
export class CourseResolver {
    @Query(() => [Course])
    async getAllCourses(): Promise<Course[]> {
        const courseRepository = AppDataSource.getRepository(Course);
        return await courseRepository.find({
            relations: ["courseAssignments", "applications"],
            order: { createdAt: "DESC" },
        });
    }

    @Query(() => Course, { nullable: true })
    async getCourseById(
        @Arg("id", () => Int) id: number
    ): Promise<Course | null> {
        const courseRepository = AppDataSource.getRepository(Course);
        return await courseRepository.findOne({
            where: { id },
            relations: [
                "courseAssignments",
                "courseAssignments.lecturer",
                "applications",
            ],
        });
    }

    @Query(() => [CourseAssignment])
    async getAllCourseAssignments(): Promise<CourseAssignment[]> {
        const assignmentRepository =
            AppDataSource.getRepository(CourseAssignment);
        return await assignmentRepository.find({
            relations: ["lecturer", "course"],
            order: { assignedAt: "DESC" },
        });
    }

    @Query(() => [User])
    async getUnassignedLecturers(): Promise<User[]> {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
            where: { userType: UserType.LECTURER },
            relations: ["courseAssignments"],
            order: { createdAt: "DESC" },
        });
    }

    @Mutation(() => CourseResponse)
    async createCourse(
        @Arg("input") input: CourseInput
    ): Promise<CourseResponse> {
        try {
            const courseRepository = AppDataSource.getRepository(Course);

            // Check if course code already exists
            const existingCourse = await courseRepository.findOne({
                where: { courseCode: input.courseCode },
            });

            if (existingCourse) {
                return {
                    success: false,
                    message: "Course code already exists",
                };
            }

            const course = courseRepository.create(input);
            await courseRepository.save(course);

            return {
                success: true,
                message: "Course created successfully",
                course,
            };
        } catch (error) {
            console.error("Create course error:", error);
            return {
                success: false,
                message: "Failed to create course",
            };
        }
    }

    @Mutation(() => CourseResponse)
    async updateCourse(
        @Arg("id", () => Int) id: number,
        @Arg("input") input: CourseInput
    ): Promise<CourseResponse> {
        try {
            const courseRepository = AppDataSource.getRepository(Course);
            const course = await courseRepository.findOne({ where: { id } });

            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }

            // Check if course code already exists (excluding current course)
            const existingCourse = await courseRepository.findOne({
                where: { courseCode: input.courseCode },
            });

            if (existingCourse && existingCourse.id !== id) {
                return {
                    success: false,
                    message: "Course code already exists",
                };
            }

            Object.assign(course, input);
            await courseRepository.save(course);

            return {
                success: true,
                message: "Course updated successfully",
                course,
            };
        } catch (error) {
            console.error("Update course error:", error);
            return {
                success: false,
                message: "Failed to update course",
            };
        }
    }

    @Mutation(() => CourseResponse)
    async deleteCourse(
        @Arg("id", () => Int) id: number
    ): Promise<CourseResponse> {
        try {
            const courseRepository = AppDataSource.getRepository(Course);
            const course = await courseRepository.findOne({
                where: { id },
                relations: ["courseAssignments", "applications"],
            });

            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }

            // Check if there are active applications
            const activeApplications =
                course.applications?.filter(
                    (app) =>
                        app.status === ApplicationStatus.PENDING ||
                        app.status === ApplicationStatus.SELECTED
                ) || [];

            if (activeApplications.length > 0) {
                return {
                    success: false,
                    message: `Cannot delete course. There are ${activeApplications.length} active application(s). Please handle these applications first.`,
                };
            }

            // The database cascade rules will handle the deletion of:
            // - Course assignments (due to onDelete: "CASCADE" in CourseAssignment entity)
            // - Applications (due to onDelete: "CASCADE" in Application entity)
            await courseRepository.remove(course);

            return {
                success: true,
                message:
                    "Course deleted successfully. All related assignments and applications have been removed.",
            };
        } catch (error) {
            console.error("Delete course error:", error);

            // Check if it's a foreign key constraint error
            if (error.message.includes("foreign key constraint")) {
                return {
                    success: false,
                    message:
                        "Cannot delete course due to existing references. Please remove all related data first.",
                };
            }

            return {
                success: false,
                message: "Failed to delete course",
            };
        }
    }

    @Mutation(() => AssignmentResponse)
    async assignLecturerToCourse(
        @Arg("lecturerId", () => Int) lecturerId: number,
        @Arg("courseId", () => Int) courseId: number
    ): Promise<AssignmentResponse> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const courseRepository = AppDataSource.getRepository(Course);
            const assignmentRepository =
                AppDataSource.getRepository(CourseAssignment);

            // Verify lecturer exists and is a lecturer
            const lecturer = await userRepository.findOne({
                where: { id: lecturerId, userType: UserType.LECTURER },
            });

            if (!lecturer) {
                return {
                    success: false,
                    message: "Lecturer not found",
                };
            }

            // Verify course exists
            const course = await courseRepository.findOne({
                where: { id: courseId },
            });
            if (!course) {
                return {
                    success: false,
                    message: "Course not found",
                };
            }

            // Check if assignment already exists
            const existingAssignment = await assignmentRepository.findOne({
                where: { lecturerId, courseId },
            });

            if (existingAssignment) {
                return {
                    success: false,
                    message: "Lecturer is already assigned to this course",
                };
            }

            const assignment = assignmentRepository.create({
                lecturerId,
                courseId,
            });

            await assignmentRepository.save(assignment);

            // Load the assignment with relations
            const savedAssignment = await assignmentRepository.findOne({
                where: { id: assignment.id },
                relations: ["lecturer", "course"],
            });

            return {
                success: true,
                message: "Lecturer assigned to course successfully",
                assignment: savedAssignment!,
            };
        } catch (error) {
            console.error("Assign lecturer error:", error);
            return {
                success: false,
                message: "Failed to assign lecturer to course",
            };
        }
    }

    @Mutation(() => AssignmentResponse)
    async removeLecturerFromCourse(
        @Arg("lecturerId", () => Int) lecturerId: number,
        @Arg("courseId", () => Int) courseId: number
    ): Promise<AssignmentResponse> {
        try {
            const assignmentRepository =
                AppDataSource.getRepository(CourseAssignment);

            const assignment = await assignmentRepository.findOne({
                where: { lecturerId, courseId },
                relations: ["lecturer", "course"],
            });

            if (!assignment) {
                return {
                    success: false,
                    message: "Assignment not found",
                };
            }

            await assignmentRepository.remove(assignment);

            return {
                success: true,
                message: "Lecturer removed from course successfully",
            };
        } catch (error) {
            console.error("Remove lecturer error:", error);
            return {
                success: false,
                message: "Failed to remove lecturer from course",
            };
        }
    }
}
