import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';
import { LootboxID, UserID } from '@wormgraph/helpers';

export interface BaseEventClaimStatsFE {
  totalClaimCount: number;
  completedClaimCount: number;
  viralClaimCount: number;
  referralBonusClaimCount: number;
  participationRewardCount: number;
  airdropClaimCount: number;
  pendingClaims: number;
  originalClaims: number;
  impressions: number;
  allFans: number;
  originalFans: number;
  viralFans: number;
  completionRate: number;
  airdropCompletionRate: number;
  totalMaxTickets: number;
  participationFans: number;
  completedPlayerClaimCount: number;
  completedPromoterClaimCount: number;
  totalPlayerMaxTickets: number;
  totalPromoterMaxTickets: number;
}

export interface BaseEventClaimStatsResponseFE {
  baseClaimStatsForTournament:
    | {
        __typename: 'BaseClaimStatsForTournamentResponseSuccess';
        stats: BaseEventClaimStatsFE;
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
          referralBonusClaimCount
          participationRewardCount
          airdropClaimCount
          pendingClaims
          originalClaims
          impressions
          allFans
          originalFans
          viralFans
          completionRate
          airdropCompletionRate
          totalMaxTickets
          participationFans
          completedPlayerClaimCount
          completedPromoterClaimCount
          totalPlayerMaxTickets
          totalPromoterMaxTickets
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

export interface CampaignClaimsRowFE {
  referralCampaignName: string;
  referralSlug: string;
  userAvatar: string;
  username: string;
  userID: string;
  claimCount: number;
}

export interface CampaignClaimsForTournamentResponseFE {
  campaignClaimsForTournament:
    | {
        __typename: 'CampaignClaimsForTournamentResponseSuccess';
        data: CampaignClaimsRowFE[];
      }
    | ResponseError;
}

export const CAMPAIGN_CLAIM_STATS = gql`
  query CampaignClaimsForTournament($tournamentID: ID!) {
    campaignClaimsForTournament(tournamentID: $tournamentID) {
      ... on CampaignClaimsForTournamentResponseSuccess {
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

export interface ClaimerStatsRowFE {
  claimerUserID: string;
  username: string;
  userAvatar: string;
  claimCount: number;
  claimType: string;
  totalUserClaimCount: number;
  referralType: string;
}

export interface ClaimerStatsForTournamentFE {
  claimerStatsForTournament:
    | {
        __typename: 'ClaimerStatsForTournamentResponseSuccess';
        data: ClaimerStatsRowFE[];
      }
    | ResponseError;
}

export const CLAIMER_STATS = gql`
  query ClaimerStatsForTournamentResponseSuccess($eventID: ID!) {
    claimerStatsForTournament(eventID: $eventID) {
      ... on ClaimerStatsForTournamentResponseSuccess {
        data {
          claimerUserID
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

export const FANS_LIST_FOR_TOURNAMENT = gql`
  query FansListForTournament($tournamentID: ID!) {
    fansListForTournament(tournamentID: $tournamentID) {
      ... on FansListForTournamentResponseSuccess {
        tournamentID
        fans {
          userID
          username
          avatar
          claimsCount
          referralsCount
          participationRewardsCount
          expiredClaimsCount
          joinedDate
          favoriteLootbox {
            lootboxID
            stampImage
            name
            count
          }
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
