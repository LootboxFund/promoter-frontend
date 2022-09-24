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
    // return <Spin style={{ margin: 'auto' }} />;
    return (
      <Link to="/user/login">
        <Button type="primary">Login</Button>
      </Link>
    );
  }
  if (loading || !affiliateUser) {
    return <Spin style={{ margin: 'auto' }} />;
  }
  return children;
};

export default AuthGuard;
