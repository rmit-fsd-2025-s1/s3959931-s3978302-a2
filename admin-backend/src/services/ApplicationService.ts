import { AppDataSource } from "../config/database";
import { Application } from "../types/Application";
import { ApplicationStatus } from "../types/Application";
import { CourseAssignment } from "../types/CourseAssignment";

export class ApplicationService {
    /**
     * Get affected lecturer IDs who have applications from the given candidate
     * This is used to send targeted notifications only to relevant lecturers
     */
    static async getAffectedLecturerIds(
        candidateId: number
    ): Promise<number[]> {
        try {
            const applicationRepository =
                AppDataSource.getRepository(Application);
            const courseAssignmentRepository =
                AppDataSource.getRepository(CourseAssignment);

            console.log(`🔍 Finding applications for candidate ${candidateId}`);

            // Get all applications for this candidate
            const candidateApplications = await applicationRepository.find({
                where: { candidateId: candidateId },
                relations: ["course"],
                select: ["id", "courseId"],
            });

            console.log(
                `📋 Found ${candidateApplications.length} applications for candidate ${candidateId}`
            );

            if (candidateApplications.length === 0) {
                return [];
            }

            // Get unique course IDs from the applications
            const courseIds = [
                ...new Set(candidateApplications.map((app) => app.courseId)),
            ];
            console.log(`📚 Candidate has applications in courses:`, courseIds);

            // Find lecturers assigned to these courses
            const courseAssignments = await courseAssignmentRepository.find({
                where: {
                    courseId: courseIds.length === 1 ? courseIds[0] : undefined,
                },
                relations: ["lecturer"],
                select: ["id", "lecturerId", "courseId"],
            });

            // If multiple course IDs, use a more complex query
            if (courseIds.length > 1) {
                const assignments = await courseAssignmentRepository
                    .createQueryBuilder("assignment")
                    .select(["assignment.lecturerId", "assignment.courseId"])
                    .where("assignment.courseId IN (:...courseIds)", {
                        courseIds,
                    })
                    .getMany();

                const affectedLecturerIds = [
                    ...new Set(
                        assignments.map((assignment) => assignment.lecturerId)
                    ),
                ];
                console.log(
                    `👨‍🏫 Found ${affectedLecturerIds.length} affected lecturers:`,
                    affectedLecturerIds
                );
                return affectedLecturerIds;
            }

            const affectedLecturerIds = [
                ...new Set(
                    courseAssignments.map((assignment) => assignment.lecturerId)
                ),
            ];
            console.log(
                `👨‍🏫 Found ${affectedLecturerIds.length} affected lecturers:`,
                affectedLecturerIds
            );
            return affectedLecturerIds;
        } catch (error) {
            console.error("❌ Error finding affected lecturer IDs:", error);
            return [];
        }
    }

    /**
     * Unselect and unrank all applications for a blocked candidate
     * This ensures that when a candidate is blocked, they're completely removed from selection and ranking
     */
    static async unselectAndUnrankCandidateApplications(
        candidateId: number
    ): Promise<{
        success: boolean;
        message: string;
        unselectedCount: number;
        unrankedCount: number;
    }> {
        try {
            const applicationRepository =
                AppDataSource.getRepository(Application);

            // Find all applications for the candidate that are currently selected
            const selectedApplications = await applicationRepository.find({
                where: {
                    candidateId: candidateId,
                    status: ApplicationStatus.SELECTED,
                },
                relations: ["course", "role", "candidate"],
            });

            console.log(
                `📋 Found ${selectedApplications.length} selected applications for candidate ${candidateId}`
            );

            let unselectedCount = 0;
            let unrankedCount = 0;

            // Process each selected application
            for (const application of selectedApplications) {
                console.log(
                    `🔄 Processing application ${application.id} for candidate ${candidateId}`
                );

                // Check if the application was ranked
                const wasRanked =
                    application.rank !== null &&
                    application.rank !== undefined &&
                    application.rank > 0;

                if (wasRanked) {
                    console.log(
                        `🗑️ Removing ranking for application ${application.id} (rank: ${application.rank})`
                    );

                    // Clear ranking information
                    application.rank = null;
                    application.rankedBy = null;
                    application.rankedAt = null;
                    application.rankedForCourse = null;
                    unrankedCount++;
                }

                // Change status back to pending
                application.status = ApplicationStatus.PENDING;
                unselectedCount++;

                // Save the updated application
                await applicationRepository.save(application);

                console.log(
                    `✅ Application ${application.id} unselected and unranked`
                );
            }

            // After unranking applications, we need to reorder remaining rankings
            await this.reorderRankingsAfterRemoval();

            console.log(
                `✅ Successfully processed ${selectedApplications.length} applications for candidate ${candidateId}`
            );
            console.log(
                `📊 Unselected: ${unselectedCount}, Unranked: ${unrankedCount}`
            );

            return {
                success: true,
                message: `Successfully unselected ${unselectedCount} applications and removed ${unrankedCount} rankings`,
                unselectedCount,
                unrankedCount,
            };
        } catch (error) {
            console.error(
                "❌ Error unselecting and unranking candidate applications:",
                error
            );
            return {
                success: false,
                message: "Failed to unselect and unrank candidate applications",
                unselectedCount: 0,
                unrankedCount: 0,
            };
        }
    }

    /**
     * Reorder rankings after removing applications to ensure consecutive ranking
     * This prevents gaps in the ranking sequence
     */
    static async reorderRankingsAfterRemoval(): Promise<void> {
        try {
            const applicationRepository =
                AppDataSource.getRepository(Application);

            // Get all ranked applications grouped by course
            const rankedApplications = await applicationRepository.find({
                where: {
                    status: ApplicationStatus.SELECTED,
                },
                relations: ["course", "role", "candidate"],
                order: {
                    rankedForCourse: "ASC",
                    rank: "ASC",
                },
            });

            // Filter only applications that have ranks
            const applicationsWithRanks = rankedApplications.filter(
                (app) =>
                    app.rank !== null && app.rank !== undefined && app.rank > 0
            );

            console.log(
                `🔄 Reordering ${applicationsWithRanks.length} ranked applications`
            );

            // Group by course
            const applicationsByCourse = applicationsWithRanks.reduce(
                (acc, app) => {
                    const course = app.rankedForCourse || "unknown";
                    if (!acc[course]) {
                        acc[course] = [];
                    }
                    acc[course].push(app);
                    return acc;
                },
                {} as Record<string, Application[]>
            );

            // Reorder rankings for each course
            for (const [courseCode, courseApplications] of Object.entries(
                applicationsByCourse
            )) {
                console.log(
                    `🔄 Reordering ${courseApplications.length} applications for course ${courseCode}`
                );

                // Sort by current rank to maintain relative order
                courseApplications.sort(
                    (a, b) => (a.rank || 0) - (b.rank || 0)
                );

                // Assign new consecutive ranks
                for (let i = 0; i < courseApplications.length; i++) {
                    const newRank = i + 1;
                    if (courseApplications[i].rank !== newRank) {
                        console.log(
                            `📝 Updating application ${courseApplications[i].id} rank from ${courseApplications[i].rank} to ${newRank}`
                        );
                        courseApplications[i].rank = newRank;
                        await applicationRepository.save(courseApplications[i]);
                    }
                }
            }

            console.log("✅ Ranking reordering completed");
        } catch (error) {
            console.error("❌ Error reordering rankings:", error);
        }
    }
}
