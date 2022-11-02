import { gql } from '@apollo/client';

export const GET_ADVERTISER_ADMIN_VIEW = gql`
  query AdvertiserAdminView {
    advertiserAdminView {
      ... on AdvertiserAdminViewResponseSuccess {
        id
        userID
        name
        description
        avatar
        publicContactEmail
        website
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
