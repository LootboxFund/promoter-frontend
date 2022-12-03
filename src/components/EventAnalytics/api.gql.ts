import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';
import { LootboxID, UserID } from '@wormgraph/helpers';

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
          completionRate: number;
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
          completionRate
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

export interface LootboxCompletedClaimRowFE {
  lootboxID: LootboxID;
  lootboxName: string;
  maxTickets: number;
  lootboxImg: string;
  claimCount: number;
}

export interface LootboxCompletedClaimsForTournamentResponseFE {
  lootboxCompletedClaimsForTournament:
    | {
        __typename: 'LootboxCompletedClaimsForTournamentResponseSuccess';
        data: LootboxCompletedClaimRowFE[];
      }
    | ResponseError;
}

export const LOOTBOX_CLAIM_STATS = gql`
  query LootboxCompletedClaimsForTournament($tournamentID: ID!) {
    lootboxCompletedClaimsForTournament(tournamentID: $tournamentID) {
      ... on LootboxCompletedClaimsForTournamentResponseSuccess {
        data {
          lootboxID
          lootboxName
          maxTickets
          lootboxImg
          claimCount
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

export interface DailyEventClaimsResponseFE {
  dailyClaimStatisticsForTournament:
    | {
        __typename: 'DailyClaimStatisticsForTournamentResponseSuccess';
        data: {
          date: string;
          claimCount: number;
          weekNormalized: number;
          day: number;
        }[];
      }
    | ResponseError;
}

export const DAILY_EVENT_CLAIMS = gql`
  query DailyClaimStatisticsForTournament($payload: DailyClaimStatisticsForTournamentInput!) {
    dailyClaimStatisticsForTournament(payload: $payload) {
      ... on DailyClaimStatisticsForTournamentResponseSuccess {
        data {
          date
          claimCount
          weekNormalized
          day
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

export interface ReferrerClaimsForTournamentRow {
  userName: string;
  userAvatar: string;
  userID: UserID | '';
  claimCount: number;
}
export interface ReferrerClaimsForTournamentResponseFE {
  referrerClaimsForTournament:
    | {
        __typename: 'ReferrerClaimsForTournamentResponseSuccess';
        data: ReferrerClaimsForTournamentRow[];
      }
    | ResponseError;
}

export const REFERRER_CLAIM_STATS = gql`
  query ReferrerClaimsForTournament($tournamentID: ID!) {
    referrerClaimsForTournament(tournamentID: $tournamentID) {
      ... on ReferrerClaimsForTournamentResponseSuccess {
        data {
          userName
          userAvatar
          userID
          claimCount
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
