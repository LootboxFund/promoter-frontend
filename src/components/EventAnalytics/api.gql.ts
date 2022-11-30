import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';

export interface BaseEventClaimStatsResponseFE {
  baseClaimStatsForTournament:
    | {
        __typename: 'BaseClaimStatsForTournamentResponseSuccess';
        stats: {
          totalClaimCount: number;
          completedClaimCount: number;
          viralClaimCount: number;
          bonusRewardClaimCount: number;
          oneTimeClaimCount: number;
          pendingClaimCount: number;
        };
      }
    | ResponseError;
}

export const BASE_EVENT_CLAIM_STATS = gql`
  query Stats($tournamentID: ID!) {
    baseClaimStatsForTournament(tournamentID: $tournamentID) {
      ... on BaseClaimStatsForTournamentResponseSuccess {
        stats {
          totalClaimCount
          completedClaimCount
          viralClaimCount
          bonusRewardClaimCount
          oneTimeClaimCount
          pendingClaimCount
        }
      }
      ... on ResponseError {
        error {
          code
          message
        }
      }
    }
  }
`;
