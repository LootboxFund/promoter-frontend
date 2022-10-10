import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button, Spin } from 'antd';
import { history, useModel } from '@umijs/max';
import styles from './index.less';
import React, { useState } from 'react';
import { useAuth } from '@/api/firebase/useAuth';
import { stringify } from 'querystring';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { useMutation, useQuery } from '@apollo/client';
import {
  AffiliateAdminViewResponse,
  AffiliateAdminViewResponseSuccess,
  MutationUpdateAffiliateDetailsArgs,
  MutationUpgradeToAffiliateArgs,
  ResponseError,
  UpdateAffiliateDetailsPayload,
} from '@/api/graphql/generated/types';
import { GET_AFFILIATE_ADMIN_VIEW } from '@/pages/User/Login/api.gql';
import { UPDATE_AFFILIATE } from './api.gql';
import {
  UpdateAffiliateDetailsResponseSuccess,
  Affiliate,
} from '../../../api/graphql/generated/types';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import EditAffiliateForm from '@/components/EditAffiliateForm';
import { AffiliateID } from '@wormgraph/helpers';
import { Image } from 'antd';

const AccountPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const { logout } = useAuth();
  const [affiliate, setAffiliateUser] = useState<Affiliate>();
  // GET AFFILIATE
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
  // UPDATE AFFILIATE
  const [updateAffiliateMutation] = useMutation<
    { updateAffiliateDetails: ResponseError | UpdateAffiliateDetailsResponseSuccess },
    MutationUpdateAffiliateDetailsArgs
  >(UPDATE_AFFILIATE, {
    refetchQueries: [{ query: GET_AFFILIATE_ADMIN_VIEW }],
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.affiliateAdminView.__typename === 'ResponseError') {
    return (
      <$Vertical>
        <span>{data?.affiliateAdminView.error?.message || ''}</span>
        <Link to="/user/logout">
          <Button style={{ marginTop: '20px' }}>Log Out</Button>
        </Link>
      </$Vertical>
    );
  } else if (!data) {
    return null;
  }
  const updateAffiliate = async (payload: UpdateAffiliateDetailsPayload) => {
    const res = await updateAffiliateMutation({
      variables: {
        payload: {
          name: payload.name,
          description: payload.description,
          avatar: payload.avatar,
          publicContactEmail: payload.publicContactEmail,
          website: payload.website,
          audienceSize: payload.audienceSize,
        },
        affiliateID: affiliateID,
      },
    });
    if (!res?.data || res?.data?.updateAffiliateDetails?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.updateAffiliateDetails?.error?.message || words.anErrorOccured);
    }
  };
  const loginOut = async () => {
    await logout();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };
  const renderHelpText = () => {
    return (
      <$InfoDescription>
        This is your company profile page. Be sure to fill out all your details so that you appear
        in the recruitment marketplace for advertisers to give you access to good offers. To learn
        more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };
  const maxWidth = '1000px';
  return (
    <PageContainer>
      {loading || !affiliate ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          {renderHelpText()}
          <$Horizontal style={{ maxWidth }}>
            <EditAffiliateForm
              affiliate={{
                id: affiliate.id as AffiliateID,
                name: affiliate.name,
                description: affiliate.description || '',
                avatar: affiliate.avatar || '',
                publicContactEmail: affiliate.publicContactEmail || '',
                website: affiliate.website || '',
                audienceSize: affiliate.audienceSize || 0,
              }}
              onSubmit={updateAffiliate}
              mode="view-edit"
            />
            <Image width={200} src={affiliate.avatar || ''} />
          </$Horizontal>
          <br />
          <Button onClick={() => loginOut()} type="ghost">
            Logout
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default AccountPage;
