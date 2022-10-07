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
import { AFFILIATE_ID_COOKIE } from '@/api/constants';
import { useCookies } from 'react-cookie';

/**
 * strict = forces login
 */
type AuthGuardProps = PropsWithChildren<{ strict?: boolean } & any>;

const AuthGuard = ({ children, strict, ...props }: AuthGuardProps) => {
  const [cookies, setCookie] = useCookies([AFFILIATE_ID_COOKIE]);
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

  if (!user && !cookies[AFFILIATE_ID_COOKIE]) {
    if (window.location.pathname !== `/user/login`) {
      window.location.href = '/user/login';
      return;
    }
  }
  if (!user && cookies[AFFILIATE_ID_COOKIE]) {
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
