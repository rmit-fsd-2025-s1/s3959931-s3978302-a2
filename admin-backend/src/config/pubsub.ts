import { PubSub } from "graphql-subscriptions";

// Create a singleton PubSub instance
export const pubsub = new PubSub();

// Subscription topics
export const SUBSCRIPTION_TOPICS = {
    CANDIDATE_BLOCKED: "CANDIDATE_BLOCKED",
    CANDIDATE_UNBLOCKED: "CANDIDATE_UNBLOCKED",
} as const;

// Simplified async iterator implementation that uses PubSub's built-in asyncIterableIterator
export const createAsyncIterator = (
    topics: string | string[]
): AsyncIterableIterator<any> => {
    // Use the built-in asyncIterableIterator from PubSub which handles cleanup properly
    return pubsub.asyncIterableIterator(topics);
};
