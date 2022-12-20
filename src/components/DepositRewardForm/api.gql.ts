import { gql } from '@apollo/client';

export const DEPOSIT_VOUCHER_REWARDS = gql`
  mutation DepositVoucherRewards($payload: DepositVoucherRewardsPayload!) {
    depositVoucherRewards(payload: $payload) {
      ... on DepositVoucherRewardsResponseSuccess {
        depositID
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
