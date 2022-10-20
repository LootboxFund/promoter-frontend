import { LootboxStatus } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';
import {
  Address,
  ChainIDHex,
  LootboxID,
  LootboxStatus_Firestore,
  UserID,
} from '@wormgraph/helpers';

export interface LootboxFE {
  address: Address;
  chainIdHex: ChainIDHex;
  name: string;
  description: string;
  status: LootboxStatus;
  nftBountyValue: string;
  joinCommunityUrl?: string;
  maxTickets: number;
  stampImage: string;
  themeColor: string;
  symbol: string;
  backgroundImage: string;
  logo: string;
  creatorAddress: Address;
  creatorID: UserID;
}

export interface GetLootboxFE {
  __typename: 'GetLootboxByIdResponseSuccess';
  lootbox: LootboxFE;
}

export const GET_LOOTBOX = gql`
  query Query($id: ID!) {
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
          creatorAddress
          creatorID
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
