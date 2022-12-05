import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';

export interface BaseLootboxStatsFE {
  totalClaimCount: number;
  completedClaimCount: number;
  viralClaimCount: number;
  bonusRewardClaimCount: number;
  oneTimeClaimCount: number;
  completionRate: number;
  maxTickets: number;
}

export interface BaseLootboxStatsResponseFE {
  baseClaimStatsForLootbox:
    | {
        __typename: 'BaseClaimStatsForLootboxResponseSuccess';
        stats: BaseLootboxStatsFE;
      }
    | ResponseError;
}

export const GET_LOOTBOX_BASE_STATS = gql`
  query LootboxBaseStats($lootboxID: ID!, $tournamentID: ID) {
    baseClaimStatsForLootbox(lootboxID: $lootboxID, tournamentID: $tournamentID) {
      ... on BaseClaimStatsForLootboxResponseSuccess {
        stats {
          totalClaimCount
          completedClaimCount
          viralClaimCount
          bonusRewardClaimCount
          oneTimeClaimCount
          completionRate
          maxTickets
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

export interface ReferrerLootboxClaimRowFE {
  userName: string;
  userAvatar: string;
  userID: string;
  claimCount: number;
}

export interface GetReferrerClaimStatsResponseFE {
  referrerClaimsForLootbox:
    | {
        __typename: 'ReferrerClaimsForLootboxResponseSuccess';
        data: ReferrerLootboxClaimRowFE[];
      }
    | ResponseError;
}

export const GET_REFERRER_CLAIM_STATS = gql`
  query ReferrerClaimsForLootbox($lootboxID: ID!, $tournamentID: ID) {
    referrerClaimsForLootbox(lootboxID: $lootboxID, tournamentID: $tournamentID) {
      ... on ReferrerClaimsForLootboxResponseSuccess {
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
