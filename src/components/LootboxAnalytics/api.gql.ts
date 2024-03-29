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

export interface CampaignClaimRowFE {
  referralCampaignName: string;
  referralSlug: string;
  userAvatar: string;
  username: string;
  userID: string;
  claimCount: number;
}

export interface CampaignClaimsForLootboxResponseFE {
  campaignClaimsForLootbox:
    | {
        __typename: 'CampaignClaimsForLootboxResponseSuccess';
        data: CampaignClaimRowFE[];
      }
    | ResponseError;
}
export const CAMPAIGN_CLAIMS_FOR_LOOTBOX = gql`
  query CampaignClaimsForLootbox($lootboxID: ID!, $tournamentID: ID) {
    campaignClaimsForLootbox(lootboxID: $lootboxID, tournamentID: $tournamentID) {
      ... on CampaignClaimsForLootboxResponseSuccess {
        data {
          referralCampaignName
          referralSlug
          userAvatar
          username
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

export interface ClaimerStatsLootboxTournamentRowFE {
  lootboxID: string;
  claimerUserID: string;
  username: string;
  userAvatar: string;
  claimCount: number;
  claimType: string;
  totalUserClaimCount: number;
  referralType: string;
}

export interface ClaimerStatsForLootboxTournamentFE {
  claimerStatisticsForLootboxTournament:
    | {
        __typename: 'ClaimerStatsForLootboxTournamentResponseSuccess';
        data: ClaimerStatsLootboxTournamentRowFE[];
      }
    | ResponseError;
}

export const CLAIMER_STATS_FOR_LOOTBOX_TOURNAMENT = gql`
  query ClaimerStatisticsForLootboxTournament($lootboxID: ID!, $tournamentID: ID!) {
    claimerStatisticsForLootboxTournament(lootboxID: $lootboxID, tournamentID: $tournamentID) {
      ... on ClaimerStatsForLootboxTournamentResponseSuccess {
        data {
          claimerUserID
          lootboxID
          username
          userAvatar
          claimCount
          claimType
          totalUserClaimCount
          referralType
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

export const FANS_LIST_FOR_LOOTBOX = gql`
  query FansListForLootbox($lootboxID: ID!) {
    fansListForLootbox(lootboxID: $lootboxID) {
      ... on FansListForLootboxResponseSuccess {
        lootboxID
        fans {
          userID
          username
          avatar
          claimsCount
          referralsCount
          participationRewardsCount
          joinedDate
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
