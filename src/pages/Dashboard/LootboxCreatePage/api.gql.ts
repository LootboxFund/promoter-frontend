import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';
import { LootboxCreatedNonce, LootboxID } from '@wormgraph/helpers';

export interface LootboxCreatedFE {
  id: LootboxID;
  nonce: LootboxCreatedNonce;
  name: string;
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
