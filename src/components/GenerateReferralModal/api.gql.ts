import { gql } from '@apollo/client';
import { Address, LootboxID, ReferralID, ReferralSlug, TournamentID } from '@wormgraph/helpers';

export const CREATE_REFERRAL = gql`
  mutation Mutation($payload: CreateReferralPayload!) {
    createReferral(payload: $payload) {
      ... on CreateReferralResponseSuccess {
        referral {
          id
          slug
          seedLootboxID
          nConversions
          campaignName
          tournamentId
          tournament {
            title
            description
            tournamentDate
            lootboxSnapshots {
              address
              stampImage
            }
          }
        }
      }
      ... on ResponseError {
        error {
          message
          code
        }
      }
    }
  }
`;

export const BULK_CREATE_REFERRAL = gql`
  mutation Mutation($payload: BulkCreateReferralPayload!) {
    bulkCreateReferral(payload: $payload) {
      ... on BulkCreateReferralResponseSuccess {
        csv
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

export interface CreateReferralFE {
  id: ReferralID;
  slug: ReferralSlug;
  seedLootboxID: LootboxID;
  nConversions: number;
  campaignName?: string;
  tournamentId: TournamentID;
  tournament?: {
    title: string;
    description?: string;
    tournamentDate?: string | number;
    lootboxSnapshots?: {
      address: Address;
      stampImage: string;
    }[];
  };
}

export interface CreateReferralResponseFE {
  __typename: 'CreateReferralResponseSuccess';
  referral?: CreateReferralFE;
}

export interface BulkCreateReferralResponseFE {
  __typename: 'BulkCreateReferralResponseSuccess';
  csv: string;
}
