import { Button, Spin } from 'antd';
import { COLORS } from '@wormgraph/helpers';
import { PropsWithChildren, useState } from 'react';
import { useAuth } from '@/api/firebase/useAuth';
import { useQuery } from '@apollo/client';
import { history, Link } from '@umijs/max';
import {
  AffiliateAdminViewResponse,
  AffiliateAdminViewResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_AFFILIATE_ADMIN_VIEW } from '@/pages/User/Login/api.gql';
import { $Horizontal, $Vertical } from '../generics';

/**
 * strict = forces login
 */
type AuthGuardProps = PropsWithChildren<{ strict?: boolean } & any>;

const AuthGuard = ({ children, strict, ...props }: AuthGuardProps) => {
  const [affiliateUser, setAffiliateUser] = useState<AffiliateAdminViewResponseSuccess>();
  const { user } = useAuth();
  const { data, loading, error } = useQuery<{ affiliateAdminView: AffiliateAdminViewResponse }>(
    GET_AFFILIATE_ADMIN_VIEW,
    {
      onCompleted: (data) => {
        if (data?.affiliateAdminView.__typename === 'AffiliateAdminViewResponseSuccess') {
          const advertiser = data.affiliateAdminView;
          setAffiliateUser(advertiser);
        }
      },
    },
  );

  if (!user) {
    if (window.location.pathname === `/user/login`) {
      return children;
    }
    return (
      <$Horizontal
        justifyContent="center"
        verticalCenter
        style={{ width: '100vw', height: '100vh' }}
      >
        <$Vertical>
          <Spin style={{ margin: 'auto' }} />
          <br />
          <a href={`${window.location.origin}/user/login`}>
            <Button>LOGIN</Button>
          </a>
        </$Vertical>
      </$Horizontal>
    );
  }
  if (loading) {
    return <Spin style={{ margin: 'auto' }} />;
  }
  return children;
};

export default AuthGuard;
