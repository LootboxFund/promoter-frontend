import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';

export interface OfferActivationsForEventFE {
  offerActivationsForEvent:
    | {
        __typename: 'OfferActivationsForEventResponseSuccess';
        data: {
          activationName: string;
          adEventCount: number;
          activationDescription: string;
          activationID: string;
        }[];
      }
    | ResponseError;
}

export const OFFER_ACTIVATIONS_FOR_EVENT = gql`
  query Data($payload: OfferActivationsForEventPayload!) {
    offerActivationsForEvent(payload: $payload) {
      ... on OfferActivationsForEventResponseSuccess {
        data {
          activationName
          adEventCount
          activationDescription
          activationID
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

export {};
