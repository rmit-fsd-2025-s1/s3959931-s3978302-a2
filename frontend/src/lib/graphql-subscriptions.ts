import { gql } from "@apollo/client";

// Simplified subscription query that exactly matches the backend schema
export const CANDIDATE_BLOCKING_SUBSCRIPTION = gql`
  subscription CandidateBlockingUpdates {
    candidateBlockingUpdates {
      candidateId
      candidateName
      candidateEmail
      isBlocked
      timestamp
      unselectedApplicationsCount
      unrankedApplicationsCount
      affectedLecturerIds
      candidate {
        id
        fullName
        email
        userType
        isBlocked
        createdAt
      }
    }
  }
`;

export interface CandidateBlockedEvent {
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  isBlocked: boolean;
  timestamp: string;
  unselectedApplicationsCount?: number;
  unrankedApplicationsCount?: number;
  affectedLecturerIds?: number[];
  candidate: {
    id: number;
    fullName: string;
    email: string;
    userType: string;
    isBlocked: boolean;
    createdAt: string;
  };
}
