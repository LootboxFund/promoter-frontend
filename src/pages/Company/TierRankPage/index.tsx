import type { Affiliate, AffiliateAdminViewResponse } from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { GET_AFFILIATE_ADMIN_VIEW } from '@/pages/User/Login/api.gql';
import { SmileOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Timeline } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import styles from './index.less';

const Tier1 = [
  <Timeline.Item key="1.0" color="green" position="right">
    <h4>Clay Tier 1</h4>
    <p>50% Revenue Share</p>
  </Timeline.Item>,
  <Timeline.Item key="1.1" color="green" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      {`Watch the "Getting Started" Video (5 mins)`}
    </a>
  </Timeline.Item>,
  <Timeline.Item key="1.2" color="green" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Explore the Marketplace (3 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="1.3" color="blue" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Create your first Lootbox (6 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="1.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Share your first Ticket Rewards (10 mins)
    </a>
  </Timeline.Item>,
];

const Tier2 = [
  <Timeline.Item color="#CECECE" position="right">
    <h4>Bronze Tier 2</h4>
    <p>65% Revenue Share</p>
  </Timeline.Item>,
  <Timeline.Item color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Task 1
    </a>
  </Timeline.Item>,
  <Timeline.Item color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Task 2
    </a>
  </Timeline.Item>,
  <Timeline.Item color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Task 3
    </a>
  </Timeline.Item>,
  <Timeline.Item color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Task 4
    </a>
  </Timeline.Item>,
];

const Tier3 = [
  <Timeline.Item color="#CECECE" position="right">
    <h4>Iron Tier 3</h4>
    <p>70% Revenue Share</p>
  </Timeline.Item>,
  <Timeline.Item color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Task 1
    </a>
  </Timeline.Item>,
  <Timeline.Item color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Task 2
    </a>
  </Timeline.Item>,
  <Timeline.Item color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Task 3
    </a>
  </Timeline.Item>,
  <Timeline.Item color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Task 4
    </a>
  </Timeline.Item>,
];

const TierRankPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;

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
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.affiliateAdminView.__typename === 'ResponseError') {
    return <span>{data?.affiliateAdminView.error?.message || ''}</span>;
  } else if (!data) {
    return null;
  }

  return (
    <PageContainer>
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <Timeline mode="alternate">
            {Tier1.map((item) => item)}
            {Tier2.map((item) => item)}
            {Tier3.map((item) => item)}
          </Timeline>
        </div>
      )}
    </PageContainer>
  );
};

export default TierRankPage;
