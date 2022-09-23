import { gql } from '@apollo/client';

export const LIST_OFFERS_FOR_AFFILIATE = gql`
  query ListOffersAvailableForOrganizer($affiliateID: ID!) {
    listOffersAvailableForOrganizer(affiliateID: $affiliateID) {
      ... on ListOffersAvailableForOrganizerResponseSuccess {
        offers {
          id
          title
          description
          image
          advertiserID
          spentBudget
          maxBudget
          startDate
          endDate
          status
          adSetPreviews {
            id
            name
            status
            placement
            thumbnail
          }
          activationsForAffiliate(affiliateID: $affiliateID) {
            rank
            activationID
            activationName
            pricing
            affiliateID
            order
          }
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
