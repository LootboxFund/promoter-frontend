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
