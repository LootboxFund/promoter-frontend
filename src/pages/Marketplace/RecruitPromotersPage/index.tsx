import type {
  BrowseAllAffiliatesResponse,
  MarketplacePreviewAffiliate,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { history } from '@umijs/max';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { $Vertical } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { Button, Card, Input, message, Popconfirm } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { BROWSE_ALL_AFFILIATES } from './api.gql';
import styles from './index.less';

const RecruitPromotersPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const [searchString, setSearchString] = useState('');
  const [affiliates, setAffiliates] = useState<MarketplacePreviewAffiliate[]>([]);
  const { data, loading, error } = useQuery<{ browseAllAffiliates: BrowseAllAffiliatesResponse }>(
    BROWSE_ALL_AFFILIATES,
    {
      onCompleted: (data) => {
        if (data?.browseAllAffiliates.__typename === 'BrowseAllAffiliatesResponseSuccess') {
          const affiliates = data.browseAllAffiliates.affiliates;
          setAffiliates(affiliates);
        }
      },
    },
  );
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.browseAllAffiliates.__typename === 'ResponseError') {
    return <span>{data?.browseAllAffiliates.error?.message || ''}</span>;
  }

  const filterBySearchString = (affiliate: MarketplacePreviewAffiliate) => {
    return (
      affiliate.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      affiliate.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };
  return (
    <PageContainer>
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <$Vertical>
          <Input.Search
            placeholder="Filter Promoters"
            allowClear
            onChange={(e) => setSearchString(e.target.value)}
            onSearch={setSearchString}
            style={{ width: 200 }}
          />
          <br />
          <div className={styles.content}>
            {affiliates.filter(filterBySearchString).map((affiliate) => {
              return (
                <Card
                  key={affiliate.id}
                  className={styles.card}
                  cover={
                    <img alt="example" src={affiliate.avatar || ''} className={styles.cardImage} />
                  }
                  actions={[
                    <Popconfirm
                      key={`invite-${affiliate.id}`}
                      title={`To invite ${affiliate.name} to your Event, copy their PromoterID "${affiliate.id}" and add them from your Event Page`}
                      onConfirm={() => {
                        navigator.clipboard.writeText(affiliate.id);
                        message.success('Copied to clipboard');
                      }}
                      okText="Copy Promoter ID"
                    >
                      <Button type="primary" style={{ width: '90%' }}>
                        Invite
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Meta title={affiliate.name} />
                </Card>
              );
            })}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default RecruitPromotersPage;
