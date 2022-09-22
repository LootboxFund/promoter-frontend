import {
  AdvertiserAdminViewResponse,
  AdvertiserAdminViewResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_ADVERTISER } from '@/pages/User/Login/api.gql';
import { useQuery } from '@apollo/client';
import { useState } from 'react';

export const useAdvertiserUser = () => {
  const [advertiserUser, setAdvertiserUser] = useState<AdvertiserAdminViewResponseSuccess>();
  const { data, loading, error } = useQuery<{ advertiserAdminView: AdvertiserAdminViewResponse }>(
    GET_ADVERTISER,
    {
      onCompleted: (data) => {
        if (data?.advertiserAdminView.__typename === 'AdvertiserAdminViewResponseSuccess') {
          const advertiser = data.advertiserAdminView;
          setAdvertiserUser(advertiser);
        }
      },
    },
  );
  return { advertiserUser: advertiserUser || { id: '', name: '', avatar: '' }, loading, error };
};
