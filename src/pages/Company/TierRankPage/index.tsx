import type { Affiliate, AffiliateAdminViewResponse } from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { $InfoDescription } from '@/components/generics';
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
  <Timeline.Item key="2.0" color="#CECECE" position="right">
    <h4>Bronze Tier 2</h4>
    <span>65% Revenue Share</span>
    <br />
    <span>Access to Marketplace</span>
  </Timeline.Item>,
  <Timeline.Item key="2.1" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Unlock your first Revenue (15 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="2.2" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Launch your first Event (14 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="2.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Partner with Promoters (14 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="2.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Collect your first Payout (5 days)
    </a>
  </Timeline.Item>,
];

const Tier3 = [
  <Timeline.Item key="3.0" color="#CECECE" position="right">
    <h4>Iron Tier 3</h4>
    <span>70% Revenue Share</span>
    <br />
    <span>Business Club Membership</span>
  </Timeline.Item>,
  <Timeline.Item key="3.1" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Join Online Seminar (120 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.2" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Meet the Lootbox Team (20 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Run 10 Successful Events
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Earn $10,000 USD in Revenue
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.5" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      10k Social Media Followers
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.6" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Refer an Advertiser to Lootbox
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.7" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Grow your Network (Ongoing)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.8" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Assist in a Silver Tier Event
    </a>
  </Timeline.Item>,
];

const Tier4 = [
  <Timeline.Item key="4.0" color="#CECECE" position="right">
    <h4>Silver Tier 4</h4>
    <span>75% Revenue Share</span>
    <br />
    <span>Access Private Deals</span>
  </Timeline.Item>,
  <Timeline.Item key="4.1" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Run 50 Successful Events
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.2" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Earn $100,000 USD in Revenue
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      100k Social Media Followers
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Refer an Advertiser to Lootbox
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.5" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Assist in a Gold Tier Event
    </a>
  </Timeline.Item>,
];

const Tier5 = [
  <Timeline.Item key="5.0" color="#CECECE" position="right">
    <h4>Gold Tier 5</h4>
    <span>80% Revenue Share</span>
    <br />
    <span>Access Exclusive Deals</span>
    <br />
    <span>Invite to Mastermind Group</span>
  </Timeline.Item>,
  <Timeline.Item key="5.1" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Run 100 Successful Events
    </a>
  </Timeline.Item>,
  <Timeline.Item key="5.2" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Earn $500,000 USD in Revenue
    </a>
  </Timeline.Item>,
  <Timeline.Item key="5.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      500k Social Media Followers
    </a>
  </Timeline.Item>,
  <Timeline.Item key="5.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Refer an Advertiser to Lootbox
    </a>
  </Timeline.Item>,
  <Timeline.Item key="5.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Lead a Gold Tier Event
    </a>
  </Timeline.Item>,
];

const Tier6 = [
  <Timeline.Item key="6.0" color="#CECECE" position="right">
    <h4>Platinum Tier 6</h4>
    <span>85% Revenue Share</span>
    <br />
    <span>Enterprise Support</span>
    <br />
    <span>API Access</span>
  </Timeline.Item>,
  <Timeline.Item key="6.1" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Earn $1,000,000 USD in Revenue
    </a>
  </Timeline.Item>,
  <Timeline.Item key="6.2" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      1M Social Media Followers
    </a>
  </Timeline.Item>,
  <Timeline.Item key="6.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Refer an Advertiser to Lootbox
    </a>
  </Timeline.Item>,
  <Timeline.Item key="6.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Run an Official Esports League
    </a>
  </Timeline.Item>,
];

const Tier7 = [
  <Timeline.Item key="7.0" color="#CECECE" position="right">
    <h4>Diamond Tier 7</h4>
    <span>Confidential</span>
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
        <div style={{ maxWidth: '800px' }}>
          <div className={styles.content}>
            {renderHelpText()}
            <br />
            <br />
            <Timeline mode="alternate">
              {Tier1.map((item) => item)}
              {Tier2.map((item) => item)}
              {Tier3.map((item) => item)}
              {Tier4.map((item) => item)}
              {Tier5.map((item) => item)}
              {Tier6.map((item) => item)}
              {Tier7.map((item) => item)}
            </Timeline>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default TierRankPage;
