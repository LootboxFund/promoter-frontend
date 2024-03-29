import type {
  AffiliatePublicViewResponse,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { Button, Card, Empty, Popconfirm } from 'antd';
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
        Auto-generate marketing graphics to be shared on social media, which will help you
        distribute more tickets and earn more affiliate revenue. To learn more,{' '}
        <span>
          <a href="https://lootbox.fyi/3VyMVhe" target="_blank" rel="noreferrer">
            click here for a tutorial.
          </a>
        </span>
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
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Coming Soon"
            style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
          />
          {/* <Card
            style={{
              borderRadius: 8,
            }}
            bodyStyle={{
              backgroundImage:
                'radial-gradient(circle at 97% 10%, #EBF2FF 0%, #F5F8FF 28%, #EBF1FF 124%)',
            }}
          >
            <$Horizontal justifyContent="space-between">
              <h3>Event Marketing</h3>

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
            <div
              style={{
                display: 'flex',
                gap: 16,
              }}
            >
              <InfoCard
                index={1}
                href="https://umijs.org/docs/introduce/introduce"
                title="The Problem"
                desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
              <InfoCard
                index={2}
                title="The Solution"
                href="https://ant.design"
                desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
              <InfoCard
                index={3}
                title="Your Oppourtunity"
                href="https://procomponents.ant.design"
                desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
            </div>
          </Card>
          <br />
          <Card
            style={{
              borderRadius: 8,
            }}
            bodyStyle={{
              backgroundImage:
                'radial-gradient(circle at 97% 10%, #EBF2FF 0%, #F5F8FF 28%, #EBF1FF 124%)',
            }}
          >
            <$Horizontal justifyContent="space-between">
              <h3>Lootbox Marketing</h3>
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
            <div
              style={{
                display: 'flex',
                gap: 16,
              }}
            >
              <InfoCard
                index={1}
                href="https://umijs.org/docs/introduce/introduce"
                title="The Problem"
                desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
              <InfoCard
                index={2}
                title="The Solution"
                href="https://ant.design"
                desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
              <InfoCard
                index={3}
                title="Your Oppourtunity"
                href="https://procomponents.ant.design"
                desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              />
            </div>
          </Card> */}
        </div>
      )}
    </PageContainer>
  );
};

export default StampPage;
