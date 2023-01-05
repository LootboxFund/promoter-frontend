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
import { GET_AFFILIATE_ADMIN_VIEW } from '@/components/LoginAccount/api.gql';
import { $Horizontal, $Vertical } from '../generics';
import { AFFILIATE_ID_COOKIE } from '@/api/constants';
import { useCookies } from 'react-cookie';
import RegisterAccount from '../RegisterAccount';
import styled from 'styled-components';

type AuthGuardProps = PropsWithChildren<{ pageLayout?: boolean } & any>;

const AuthGuard = ({ children, ...props }: AuthGuardProps) => {
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

  const shouldRedirectToLogin =
    (user === undefined && cookies[AFFILIATE_ID_COOKIE] === undefined) ||
    (!user && !cookies[AFFILIATE_ID_COOKIE]);

  if (shouldRedirectToLogin) {
    if (window.location.pathname !== `/user/login`) {
      window.location.href = '/user/login';
      return null;
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
    return props.pageLayout ? (
      <$PageLayout>
        <h1 style={{ fontWeight: 900, color: '#26A6EF', fontSize: '2rem', textAlign: 'center' }}>
          🎁 LOOTBOX
        </h1>
        <Spin size="large" style={{ margin: '30px auto auto' }} />
      </$PageLayout>
    ) : (
      <Spin style={{ margin: 'auto' }} />
    );
  }
  return children;
};

const $PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-image: url(https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr);
  background-size: cover;
  padding-top: 20vh;
`;

export default AuthGuard;
