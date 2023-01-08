import { gql } from '@apollo/client';

export const GET_AFFILIATE_ADMIN_VIEW = gql`
  query AffiliateAdminView {
    affiliateAdminView {
      ... on AffiliateAdminViewResponseSuccess {
        affiliate {
          id
          userID
          name
          avatar
          description
          avatar
          publicContactEmail
          website
          audienceSize
          visibility
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
