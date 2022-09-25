import { gql } from '@apollo/client';

export const BROWSE_ALL_AFFILIATES = gql`
  query BrowseAllAffiliates {
    browseAllAffiliates {
      ... on BrowseAllAffiliatesResponseSuccess {
        affiliates {
          id
          name
          avatar
          description
          rank
          publicContactEmail
          website
          audienceSize
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
