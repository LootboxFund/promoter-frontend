import {
  Affiliate,
  AffiliateAdminViewResponse,
  AffiliateAdminViewResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_AFFILIATE_ADMIN_VIEW } from '@/pages/User/Login/api.gql';
import { useQuery } from '@apollo/client';
import { useState } from 'react';

export const useAffiliateUser = () => {
  const [affiliateUser, setAffiliateUser] = useState<Affiliate>();
  const { data, loading, error } = useQuery<{ affiliateAdminView: AffiliateAdminViewResponse }>(
    GET_AFFILIATE_ADMIN_VIEW,
    {
      onCompleted: (data) => {
        if (data?.affiliateAdminView.__typename === 'AffiliateAdminViewResponseSuccess') {
          const affiliate = data.affiliateAdminView.affiliate;
          setAffiliateUser(affiliate);
        }
      },
    },
  );
  return { affiliateUser: affiliateUser || { id: '', name: '', avatar: '' }, loading, error };
};
