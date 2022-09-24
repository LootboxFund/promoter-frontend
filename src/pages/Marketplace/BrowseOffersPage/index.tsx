import type {
  AffiliatePublicViewResponse,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { BROWSE_ACTIVE_OFFERS } from './api.gql';
import styles from './index.less';
import {
  BrowseActiveOffersResponse,
  MarketplacePreviewOffer,
} from '../../../api/graphql/generated/types';
import { $Horizontal, $Vertical } from '@/components/generics';
import { Button, Card, Input, message } from 'antd';
import { Link } from '@umijs/max';
import Meta from 'antd/lib/card/Meta';

const BrowseOffersPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const [searchString, setSearchString] = useState('');
  const [activeOffers, setActiveOffers] = useState<MarketplacePreviewOffer[]>([]);
  const { data, loading, error } = useQuery<{ browseActiveOffers: BrowseActiveOffersResponse }>(
    BROWSE_ACTIVE_OFFERS,
    {
      onCompleted: (data) => {
        if (data?.browseActiveOffers.__typename === 'BrowseActiveOffersResponseSuccess') {
          const offers = data.browseActiveOffers.offers;
          console.log(offers);
          setActiveOffers(offers);
        }
      },
    },
  );
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.browseActiveOffers.__typename === 'ResponseError') {
    return <span>{data?.browseActiveOffers.error?.message || ''}</span>;
  }
  const filterBySearchString = (offer: MarketplacePreviewOffer) => {
    return (
      offer.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      offer.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
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
            placeholder="Filter Offers"
            allowClear
            onChange={(e) => setSearchString(e.target.value)}
            onSearch={setSearchString}
            style={{ width: 200 }}
          />
          <br />
          <div className={styles.content}>
            {activeOffers.filter(filterBySearchString).map((offer) => {
              return (
                <Link key={offer.id} to={`/marketplace/offers/id/${offer.id}`}>
                  <Card
                    hoverable
                    className={styles.card}
                    cover={
                      <img alt="example" src={offer.image || ''} className={styles.cardImage} />
                    }
                  >
                    <Meta
                      title={offer.title}
                      description={`$${offer.lowerEarn.toFixed(2)}-$${offer.upperEarn.toFixed(
                        2,
                      )} Each`}
                    />
                  </Card>
                </Link>
              );
            })}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default BrowseOffersPage;
