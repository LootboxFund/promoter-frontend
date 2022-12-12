import { ClaimType_Firestore, ReferralType_Firestore } from '@wormgraph/helpers';

export const convertClaimTypeForLegend = (
  claimType: ClaimType_Firestore | string,
  referralType: ClaimType_Firestore | string,
): string => {
  switch (claimType) {
    case ClaimType_Firestore.reward:
      return 'Referral Bonus';
    case ClaimType_Firestore.referral:
      if (referralType === ReferralType_Firestore.genesis) {
        return 'Original Referral';
      }
      return 'Viral Referral';
    case ClaimType_Firestore.one_time:
      return 'Participation Reward';
    case ClaimType_Firestore.airdrop:
      return 'Air Drop';
    default:
      return claimType;
  }
};
