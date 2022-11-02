import { useAuth } from '@/api/firebase/useAuth';
import {
  AdvertiserAdminViewResponse,
  AffiliateAdminViewResponse,
  QueryAffiliatePublicViewArgs,
} from '@/api/graphql/generated/types';
import { useLazyQuery } from '@apollo/client';
import { Button, Popconfirm } from 'antd';
import { useState } from 'react';
import { GET_ADVERTISER_ADMIN_VIEW } from './api.gql';
import { manifest } from '../../manifest';

export type SwitchToAdvertiserButtonProps = {
  buttonType?: 'primary' | 'default' | 'link' | 'text' | 'ghost';
};

const SwitchToAdvertiserButton: React.FC<SwitchToAdvertiserButtonProps> = ({ buttonType }) => {
  const [loading, setLoading] = useState(false);
  const { upgradeToAdvertiser } = useAuth();
  // GET ADVERTISER
  const [getAdvertiser] = useLazyQuery<AffiliateAdminViewResponse, QueryAffiliatePublicViewArgs>(
    GET_ADVERTISER_ADMIN_VIEW,
  );
  const onConfirm = async () => {
    setLoading(true);
    const { data: res } = await getAdvertiser();
    const data = res as unknown as { advertiserAdminView: AdvertiserAdminViewResponse };
    console.log(data);
    if (data?.advertiserAdminView.__typename === 'ResponseError') {
      await upgradeToAdvertiser();
      setTimeout(() => {
        window.open(`${manifest.microfrontends.dashboard.advertiser}/user/logout`, '_blank');
        setLoading(false);
      }, 1000);
    } else if (data?.advertiserAdminView.__typename === 'AdvertiserAdminViewResponseSuccess') {
      window.open(`${manifest.microfrontends.dashboard.advertiser}/user/logout`, '_blank');
      setLoading(false);
    }
  };
  return (
    <Popconfirm
      title="To run ads, you will need to switch to the Advertiser App and login there with the same account. Would you like to open it in a new tab?"
      onConfirm={onConfirm}
      okText="Confirm"
      cancelText="Cancel"
    >
      <Button loading={loading} type={buttonType || 'ghost'}>
        Switch to Advertiser
      </Button>
    </Popconfirm>
  );
};

export default SwitchToAdvertiserButton;
