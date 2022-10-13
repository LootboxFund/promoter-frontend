import { AFFILIATE_ID_COOKIE } from '@/api/constants';
import {
  Affiliate,
  AffiliateAdminViewResponse,
  AffiliateAdminViewResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_AFFILIATE_ADMIN_VIEW } from '@/components/LoginAccount/api.gql';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useCookies } from 'react-cookie';

export const useAffiliateUser = () => {
  const [cookies, setCookie] = useCookies([AFFILIATE_ID_COOKIE]);
  const savedAffiliateID = cookies[AFFILIATE_ID_COOKIE];
  const [affiliateUser, setAffiliateUser] = useState<Affiliate>();
  const { data, loading, error } = useQuery<{ affiliateAdminView: AffiliateAdminViewResponse }>(
    GET_AFFILIATE_ADMIN_VIEW,
    {
      onCompleted: (data) => {
        if (data?.affiliateAdminView.__typename === 'AffiliateAdminViewResponseSuccess') {
          const affiliate = data.affiliateAdminView.affiliate;
          setAffiliateUser(affiliate);
          setCookie(AFFILIATE_ID_COOKIE, affiliate.id, { path: '/' });
        }
      },
    },
  );
  return {
    affiliateUser: affiliateUser || { id: savedAffiliateID, name: '', avatar: '' },
    loading,
    error,
  };
};
