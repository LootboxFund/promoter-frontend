import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';

export interface OfferEventClaimsCSVResponseFE {
  offerEventClaimsCSV:
    | {
        __typename: 'OfferEventClaimsCSVResponseSuccess';
        csvDownloadURL: string;
      }
    | ResponseError;
}

export const OFFER_EVENT_CLAIMS_FOR_EVENT = gql`
  mutation OfferEventClaimsCSV($payload: OfferEventClaimsCSVPayload!) {
    offerEventClaimsCSV(payload: $payload) {
      ... on OfferEventClaimsCSVResponseSuccess {
        csvDownloadURL
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
