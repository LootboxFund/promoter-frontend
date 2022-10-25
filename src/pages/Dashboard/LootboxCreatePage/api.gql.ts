import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';
import { LootboxCreatedNonce, LootboxID } from '@wormgraph/helpers';

export interface CreateLootboxResponseFE {
  createLootbox:
    | ResponseError
    | { __typename: 'CreateLootboxResponseSuccess'; lootbox: { id: LootboxID } };
}

export const CREATE_LOOTBOX = gql`
  mutation BulkEditLootboxTournamentSnapshots($payload: CreateLootboxPayload!) {
    createLootbox(payload: $payload) {
      ... on CreateLootboxResponseSuccess {
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
