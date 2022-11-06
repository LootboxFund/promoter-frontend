import { gql } from '@apollo/client';

export const LIST_POTENTIAL_AIRDROP_CLAIMERS = gql`
  query ListPotentialAirdropClaimers($payload: ListPotentialAirdropClaimersPayload!) {
    listPotentialAirdropClaimers(payload: $payload) {
      ... on ListPotentialAirdropClaimersResponseSuccess {
        potentialClaimers {
          userID
          username
          avatar
          status
          lootboxID
          lootboxAddress
          batchAlias
          tournamentID
          advertiserID
          offerID
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
