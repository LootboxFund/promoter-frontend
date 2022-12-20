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

export const GET_EXISTING_LOOTBOX_DEPOSITS = gql`
  query GetLootboxDeposits($lootboxID: ID!) {
    getLootboxDeposits(lootboxID: $lootboxID) {
      ... on GetLootboxDepositsResponseSuccess {
        deposits {
          id
          title
          createdAt
          oneTimeVouchersCount
          hasReuseableVoucher
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
