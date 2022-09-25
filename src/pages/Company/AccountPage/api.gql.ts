import { gql } from '@apollo/client';

export const UPDATE_AFFILIATE = gql`
  mutation UpdateAffiliateDetails($affiliateID: ID!, $payload: UpdateAffiliateDetailsPayload!) {
    updateAffiliateDetails(affiliateID: $affiliateID, payload: $payload) {
      ... on UpdateAffiliateDetailsResponseSuccess {
        affiliate {
          id
          userID
          name
          avatar
          description
          rank
          publicContactEmail
          audienceSize
          website
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
