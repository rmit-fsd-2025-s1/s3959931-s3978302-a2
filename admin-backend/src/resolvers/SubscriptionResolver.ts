import {
    Resolver,
    Subscription,
    Root,
    ObjectType,
    Field,
    ID,
    Int,
    Mutation,
} from "type-graphql";
import {
    pubsub,
    SUBSCRIPTION_TOPICS,
    createAsyncIterator,
} from "../config/pubsub";
import { User, UserType } from "../types/User";

@ObjectType()
export class CandidateBlockedEvent {
    @Field(() => ID)
    candidateId: number;

    @Field()
    candidateName: string;

    @Field()
    candidateEmail: string;

    @Field()
    isBlocked: boolean;

    @Field()
    timestamp: string;

    @Field(() => User)
    candidate: User;

    @Field(() => Int, { nullable: true })
    unselectedApplicationsCount?: number;

    @Field(() => Int, { nullable: true })
    unrankedApplicationsCount?: number;

    @Field(() => [Int], { nullable: true })
    affectedLecturerIds?: number[];
}

@Resolver()
export class SubscriptionResolver {
    @Subscription(() => CandidateBlockedEvent, {
        description: "Subscribe to candidate blocking/unblocking events",
        subscribe: () =>
            createAsyncIterator([
                SUBSCRIPTION_TOPICS.CANDIDATE_BLOCKED,
                SUBSCRIPTION_TOPICS.CANDIDATE_UNBLOCKED,
            ]),
    })
    candidateBlockingUpdates(@Root() payload: any): CandidateBlockedEvent {
        console.log("📡 Subscription resolver received event:", {
            rawPayload: payload,
            candidateBlockingUpdates: payload?.candidateBlockingUpdates,
        });
        console.log(
            "🔔 SUBSCRIPTION RESOLVER CALLED - this means a client is subscribed!"
        );

        const eventData = payload?.candidateBlockingUpdates || payload;

        console.log("📡 Processing event data:", {
            eventData,
            candidateId: eventData?.candidateId,
            candidateName: eventData?.candidateName,
            isBlocked: eventData?.isBlocked,
            timestamp: eventData?.timestamp,
            affectedLecturerIds: eventData?.affectedLecturerIds,
        });

        if (!eventData) {
            console.error(
                "❌ Subscription resolver received undefined event data"
            );
            throw new Error("No subscription data available");
        }

        return eventData;
    }

    @Mutation(() => String)
    async testSubscription(): Promise<string> {
        console.log("🧪 Test subscription mutation triggered");

        // Create a fake event for testing
        const testEvent: CandidateBlockedEvent = {
            candidateId: 999,
            candidateName: "Test Candidate",
            candidateEmail: "test@example.com",
            isBlocked: true,
            timestamp: new Date().toISOString(),
            candidate: {
                id: 999,
                email: "test@example.com",
                firstName: "Test",
                lastName: "Candidate",
                userType: UserType.CANDIDATE,
                isBlocked: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                password: "",
            } as User,
            affectedLecturerIds: [1, 2, 3], // Test with some lecturer IDs
        };

        console.log("📡 Publishing test CANDIDATE_BLOCKED event:", testEvent);

        // Try different payload formats to see what works
        console.log("🧪 Testing direct payload...");
        await pubsub.publish(SUBSCRIPTION_TOPICS.CANDIDATE_BLOCKED, testEvent);

        console.log("🧪 Testing wrapped payload...");
        await pubsub.publish(SUBSCRIPTION_TOPICS.CANDIDATE_BLOCKED, {
            candidateBlockingUpdates: testEvent,
        });

        console.log("✅ Test CANDIDATE_BLOCKED events published successfully");

        return "Test subscription event triggered successfully";
    }
}
