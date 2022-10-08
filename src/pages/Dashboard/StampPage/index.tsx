import type {
  AffiliatePublicViewResponse,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { Button, Card, Popconfirm } from 'antd';
import Spin from 'antd/lib/spin';
import React from 'react';
import { GET_AFFILIATE } from './api.gql';
import { history } from '@umijs/max';
import styles from './index.less';
import { $Vertical, $Horizontal, $InfoDescription } from '@/components/generics';

const StampPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const { data, loading, error } = useQuery<
    { affiliatePublicView: AffiliatePublicViewResponse },
    QueryAffiliatePublicViewArgs
  >(GET_AFFILIATE, {
    variables: { affiliateID },
    onCompleted: (data) => {
      if (data?.affiliatePublicView.__typename === 'AffiliatePublicViewResponseSuccess') {
        const affiliate = data.affiliatePublicView.affiliate;
        console.log(affiliate);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.affiliatePublicView.__typename === 'ResponseError') {
    return <span>{data?.affiliatePublicView.error?.message || ''}</span>;
  }

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </$InfoDescription>
    );
  };
  return (
    <PageContainer>
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          {renderHelpText()}
          <Card>
            <$Horizontal justifyContent="space-between">
              <h3>Stamp Event Graphics</h3>

              <Popconfirm
                title={`Generate Event marketing graphics by clicking the Stamp button on that Event's management page. Find your Event from the Events Page.`}
                onConfirm={() => {
                  history.push(`/dashboard/events`);
                }}
                okText="Go to Events"
                cancelText={'Cancel'}
                style={{ maxWidth: '500px' }}
              >
                <Button type="primary">Generate Event Stamp</Button>
              </Popconfirm>
            </$Horizontal>
            <br />
            <$InfoDescription fontSize="0.9rem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </$InfoDescription>
          </Card>
          <br />
          <Card>
            <$Horizontal justifyContent="space-between">
              <h3>Stamp Lootbox Graphics</h3>
              <Popconfirm
                title={`Generate Lootbox marketing graphics by clicking the Stamp button on that Lootbox's management page. Find your Lootbox from the Events Page.`}
                onConfirm={() => {
                  history.push(`/dashboard/events`);
                }}
                okText="Go to Events"
                cancelText={'Cancel'}
                style={{ maxWidth: '500px' }}
              >
                <Button type="primary">Generate Lootbox Stamp</Button>
              </Popconfirm>
            </$Horizontal>
            <br />
            <$InfoDescription fontSize="0.9rem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </$InfoDescription>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default StampPage;
