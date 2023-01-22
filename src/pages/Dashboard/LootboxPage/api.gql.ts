import {
  LootboxAirdropMetadata,
  LootboxStatus,
  ResponseError,
} from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';
import { Address, ChainIDHex, LootboxCreatedNonce, LootboxID, UserID } from '@wormgraph/helpers';

export interface LootboxFE {
  address: Address | null;
  chainIdHex: ChainIDHex | null;
  name: string;
  description: string;
  status: LootboxStatus;
  nftBountyValue: string;
  joinCommunityUrl?: string;
  maxTickets: number;
  stampImage: string;
  themeColor: string;
  symbol: string | null;
  backgroundImage: string;
  logo: string;
  creatorAddress: Address | null;
  creatorID: UserID;
  runningCompletedClaims: number;
  airdropMetadata: LootboxAirdropMetadata;
  officialInviteGraphic: string | null;
  officialInviteLink: string | null;
  safetyFeatures: {
    maxTicketsPerUser?: number | null;
    isExclusiveLootbox?: boolean | null;
  } | null;
  tournamentSnapshot: {
    creatorID: UserID;
    timestamps: {
      depositEmailSentAt?: number | null;
    };
  } | null;

  stampMetadata: {
    logoURLs?: string[] | null;
    playerHeadshot?: string | null;
    hostName?: string | null;
    eventName?: string | null;
  } | null;
}

export interface GetLootboxFE {
  __typename: 'GetLootboxByIdResponseSuccess';
  lootbox: LootboxFE;
}

export const GET_LOOTBOX = gql`
  query Query($id: ID!, $tournamentID: ID) {
    getLootboxByID(id: $id) {
      ... on LootboxResponseSuccess {
        lootbox {
          address
          chainIdHex
          name
          description
          status
          nftBountyValue
          joinCommunityUrl
          maxTickets
          stampImage
          themeColor
          symbol
          backgroundImage
          logo
          type
          creatorAddress
          creatorID
          runningCompletedClaims
          tournamentSnapshot(tournamentID: $tournamentID) {
            creatorID
            timestamps {
              depositEmailSentAt
            }
          }
          airdropMetadata {
            lootboxID
            batch
            offerID
            title
            oneLiner
            value
            instructionsLink
            tournamentID
            organizerID
            advertiserID
            questions
          }
          safetyFeatures {
            maxTicketsPerUser
            isExclusiveLootbox
          }
          stampMetadata {
            logoURLs
            playerHeadshot
            hostName
            eventName
          }
          officialInviteGraphic
          officialInviteLink
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

export interface EditLootboxResponseSuccessFE {
  __typename: 'EditLootboxResponseSuccess';
  lootbox: {
    id: LootboxID;
  };
}

export const EDIT_LOOTBOX = gql`
  mutation Mutation($payload: EditLootboxPayload!) {
    editLootbox(payload: $payload) {
      ... on EditLootboxResponseSuccess {
        lootbox {
          id
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

export interface LootboxCreatedFE {
  id: LootboxID;
  creationNonce: LootboxCreatedNonce | null;
  name: string;
  address: Address | null;
}

export type MyLootboxByNonceResponseSuccessFE = {
  __typename?: 'MyLootboxByNonceResponseSuccess';
  lootbox: LootboxCreatedFE;
};

export type MyLootboxByNonceResponseFE = {
  myLootboxByNonce: MyLootboxByNonceResponseSuccessFE | ResponseError;
};

export const MY_LOOTBOX_BY_NONCE = gql`
  query MyLootboxByNonce($nonce: ID!) {
    myLootboxByNonce(nonce: $nonce) {
      ... on MyLootboxByNonceResponseSuccess {
        lootbox {
          id
          address
          creationNonce
          name
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
