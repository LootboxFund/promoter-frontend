import { gql } from '@apollo/client';

export const LIST_CONQUEST_PREVIEWS = gql`
  query ListConquestPreviews($advertiserID: ID!) {
    listConquestPreviews(advertiserID: $advertiserID) {
      ... on ListConquestPreviewsResponseSuccess {
        conquests {
          id
          title
          image
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
