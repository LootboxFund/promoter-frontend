import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';

export interface CreateClaimerCSVResponseFE {
  claimerCSVData:
    | {
        __typename: 'ClaimerCSVDataResponseSuccess';
        csvDownloadURL: string;
      }
    | ResponseError;
}

export const MUTATION_CREATE_CLAIMER_CSV = gql`
  mutation Mutation($payload: ClaimerCSVDataPayload!) {
    claimerCSVData(payload: $payload) {
      ... on ClaimerCSVDataResponseSuccess {
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
