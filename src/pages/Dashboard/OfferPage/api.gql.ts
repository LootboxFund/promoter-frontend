import { gql } from '@apollo/client';

export const VIEW_OFFER_AS_AFFILIATE = gql`
  query ViewOfferDetailsAsAffiliate(
    $payload: ViewOfferDetailsAsEventAffiliatePayload!
    $affiliateID: ID!
  ) {
    viewOfferDetailsAsAffiliate(payload: $payload) {
      ... on ViewOfferDetailsAsEventAffiliateResponseSuccess {
        offer {
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
            activationID
            activationName
            pricing
            affiliateID
            description
            rank
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
