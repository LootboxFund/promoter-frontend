import { ClaimType_Firestore } from '@wormgraph/helpers';

export const convertClaimTypeForLegend = (claimType: ClaimType_Firestore | string): string => {
  switch (claimType) {
    case ClaimType_Firestore.reward:
      return 'Bonus Reward';
    case ClaimType_Firestore.referral:
      return 'Referral';
    case ClaimType_Firestore.one_time:
      return 'Participation Reward';
    case ClaimType_Firestore.airdrop:
      return 'Air Drop';
    default:
      return claimType;
  }
};
