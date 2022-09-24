import { gql } from '@apollo/client';

export const BROWSE_ACTIVE_OFFERS = gql`
  query BrowseActiveOffers {
    browseActiveOffers {
      ... on BrowseActiveOffersResponseSuccess {
        offers {
          id
          title
          description
          image
          advertiserID
          advertiserName
          advertiserAvatar
          lowerEarn
          upperEarn
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
