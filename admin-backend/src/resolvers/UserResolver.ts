import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Int,
    ObjectType,
    Field,
    Ctx,
} from "type-graphql";
import { User, UserType } from "../types/User";
import { AppDataSource } from "../config/database";
import { pubsub, SUBSCRIPTION_TOPICS } from "../config/pubsub";
import { CandidateBlockedEvent } from "./SubscriptionResolver";
import { ApplicationService } from "../services/ApplicationService";

@ObjectType()
class UserStats {
    @Field(() => Int)
    totalUsers: number;

    @Field(() => Int)
    totalCandidates: number;

    @Field(() => Int)
    totalLecturers: number;

    @Field(() => Int)
    totalAdmins: number;

    @Field(() => Int)
    blockedUsers: number;
}

@ObjectType()
class UserResponse {
    @Field()
    success: boolean;

    @Field({ nullable: true })
    message?: string;

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => [User])
    async getAllUsers(): Promise<User[]> {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
            order: { createdAt: "DESC" },
        });
    }

    @Query(() => [User])
    async getUsersByType(@Arg("userType") userType: UserType): Promise<User[]> {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
            where: { userType },
            order: { createdAt: "DESC" },
        });
    }

    @Query(() => UserStats)
    async getUserStats(): Promise<UserStats> {
        const userRepository = AppDataSource.getRepository(User);

        const [
            totalUsers,
            totalCandidates,
            totalLecturers,
            totalAdmins,
            blockedUsers,
        ] = await Promise.all([
            userRepository.count(),
            userRepository.count({ where: { userType: UserType.CANDIDATE } }),
            userRepository.count({ where: { userType: UserType.LECTURER } }),
            userRepository.count({ where: { userType: UserType.ADMIN } }),
            userRepository.count({ where: { isBlocked: true } }),
        ]);

        return {
            totalUsers,
            totalCandidates,
            totalLecturers,
            totalAdmins,
            blockedUsers,
        };
    }

    @Query(() => User, { nullable: true })
    async getUserById(@Arg("id", () => Int) id: number): Promise<User | null> {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.findOne({
            where: { id },
            relations: [
                "courseAssignments",
                "applications",
                "candidateSelections",
            ],
        });
    }

    @Mutation(() => UserResponse)
    async blockUser(
        @Arg("id", () => Int) id: number,
        @Ctx() ctx: any
    ): Promise<UserResponse> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            // Prevent admin from blocking themselves
            if (ctx.user && ctx.user.id === id) {
                return {
                    success: false,
                    message: "You cannot block yourself",
                };
            }

            if (user.userType === UserType.ADMIN) {
                return {
                    success: false,
                    message: "Cannot block admin users",
                };
            }

            user.isBlocked = true;
            await userRepository.save(user);

            // If blocking a candidate, automatically unselect and unrank their applications
            let applicationResult = null;
            let affectedLecturerIds: number[] = [];

            if (user.userType === UserType.CANDIDATE) {
                console.log(
                    `🔄 Finding affected lecturers and automatically unselecting applications for blocked candidate ${user.id}`
                );

                // First find affected lecturers before unselecting applications
                affectedLecturerIds =
                    await ApplicationService.getAffectedLecturerIds(user.id);
                console.log(
                    `📋 Found ${affectedLecturerIds.length} affected lecturers:`,
                    affectedLecturerIds
                );

                applicationResult =
                    await ApplicationService.unselectAndUnrankCandidateApplications(
                        user.id
                    );

                if (applicationResult.success) {
                    console.log(`✅ ${applicationResult.message}`);
                } else {
                    console.error(
                        `❌ Failed to unselect/unrank applications: ${applicationResult.message}`
                    );
                }
            }

            // Publish subscription event if user is a candidate
            if (user.userType === UserType.CANDIDATE) {
                const event: CandidateBlockedEvent = {
                    candidateId: user.id,
                    candidateName: user.fullName,
                    candidateEmail: user.email,
                    isBlocked: true,
                    timestamp: new Date().toISOString(),
                    candidate: user,
                    unselectedApplicationsCount:
                        applicationResult?.unselectedCount || 0,
                    unrankedApplicationsCount:
                        applicationResult?.unrankedCount || 0,
                    affectedLecturerIds: affectedLecturerIds,
                };

                console.log("📡 Publishing CANDIDATE_BLOCKED event:", event);
                console.log(
                    "🔧 Publishing to topic:",
                    SUBSCRIPTION_TOPICS.CANDIDATE_BLOCKED
                );
                console.log("📦 Publishing payload:", {
                    candidateBlockingUpdates: event,
                });

                await pubsub.publish(SUBSCRIPTION_TOPICS.CANDIDATE_BLOCKED, {
                    candidateBlockingUpdates: event,
                });
                console.log(
                    "✅ CANDIDATE_BLOCKED event published successfully"
                );
                console.log("🕐 Publish timestamp:", new Date().toISOString());
            }

            return {
                success: true,
                message: "User blocked successfully",
                user,
            };
        } catch (error) {
            console.error("Block user error:", error);
            return {
                success: false,
                message: "Failed to block user",
            };
        }
    }

    @Mutation(() => UserResponse)
    async unblockUser(@Arg("id", () => Int) id: number): Promise<UserResponse> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            user.isBlocked = false;
            await userRepository.save(user);

            // Publish subscription event if user is a candidate
            if (user.userType === UserType.CANDIDATE) {
                // Find affected lecturers who have this candidate's applications
                const affectedLecturerIds =
                    await ApplicationService.getAffectedLecturerIds(user.id);
                console.log(
                    `📋 Found ${affectedLecturerIds.length} affected lecturers for unblock:`,
                    affectedLecturerIds
                );

                const event: CandidateBlockedEvent = {
                    candidateId: user.id,
                    candidateName: user.fullName,
                    candidateEmail: user.email,
                    isBlocked: false,
                    timestamp: new Date().toISOString(),
                    candidate: user,
                    affectedLecturerIds: affectedLecturerIds,
                };

                console.log("📡 Publishing CANDIDATE_UNBLOCKED event:", event);
                console.log(
                    "🔧 Publishing to topic:",
                    SUBSCRIPTION_TOPICS.CANDIDATE_UNBLOCKED
                );
                console.log("📦 Publishing payload:", {
                    candidateBlockingUpdates: event,
                });

                await pubsub.publish(SUBSCRIPTION_TOPICS.CANDIDATE_UNBLOCKED, {
                    candidateBlockingUpdates: event,
                });
                console.log(
                    "✅ CANDIDATE_UNBLOCKED event published successfully"
                );
                console.log("🕐 Publish timestamp:", new Date().toISOString());
            }

            return {
                success: true,
                message: "User unblocked successfully",
                user,
            };
        } catch (error) {
            console.error("Unblock user error:", error);
            return {
                success: false,
                message: "Failed to unblock user",
            };
        }
    }

    @Mutation(() => UserResponse)
    async deleteUser(
        @Arg("id", () => Int) id: number,
        @Ctx() ctx: any
    ): Promise<UserResponse> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            // Prevent admin from deleting themselves
            if (ctx.user && ctx.user.id === id) {
                return {
                    success: false,
                    message: "You cannot delete yourself",
                };
            }

            if (user.userType === UserType.ADMIN) {
                return {
                    success: false,
                    message: "Cannot delete admin users",
                };
            }

            await userRepository.remove(user);

            return {
                success: true,
                message: "User deleted successfully",
            };
        } catch (error) {
            console.error("Delete user error:", error);
            return {
                success: false,
                message: "Failed to delete user",
            };
        }
    }
}
