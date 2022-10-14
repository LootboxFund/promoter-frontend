import { gql } from '@apollo/client';

export const GET_AFFILIATE = gql`
  query AffiliatePublicView($affiliateID: ID!) {
    affiliatePublicView(affiliateID: $affiliateID) {
      ... on AffiliatePublicViewResponseSuccess {
        affiliate {
          id
          userID
          name
          avatar
          audienceSize
          website
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

export const REPORT_TOTAL_EARNINGS = gql`
  query ReportTotalEarningsForAffiliate {
    reportTotalEarningsForAffiliate {
      ... on ReportTotalEarningsForAffiliateResponseSuccess {
        sum
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
