import { Button, Spin } from 'antd';
import { COLORS } from '@wormgraph/helpers';
import { PropsWithChildren, useState } from 'react';
import { useAuth } from '@/api/firebase/useAuth';
import { useQuery } from '@apollo/client';
import { history, Link } from '@umijs/max';
import {
  AdvertiserAdminViewResponse,
  AdvertiserAdminViewResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_ADVERTISER } from '@/pages/User/Login/api.gql';

/**
 * strict = forces login
 */
type AuthGuardProps = PropsWithChildren<{ strict?: boolean } & any>;

const AuthGuard = ({ children, strict, ...props }: AuthGuardProps) => {
  const [advertiserUser, setAdvertiserUser] = useState<AdvertiserAdminViewResponseSuccess>();
  const { user } = useAuth();
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
  if (!user) {
    // return <Spin style={{ margin: 'auto' }} />;
    return (
      <Link to="/user/login">
        <Button type="primary">Login</Button>
      </Link>
    );
  }
  if (loading || !advertiserUser) {
    return <Spin style={{ margin: 'auto' }} />;
  }
  return children;
};

export default AuthGuard;
