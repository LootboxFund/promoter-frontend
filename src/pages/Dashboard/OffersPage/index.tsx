import type {
  ListOffersAvailableForOrganizerResponse,
  OfferAffiliateView,
  QueryListOffersAvailableForOrganizerArgs,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import SwitchToAdvertiserButton from '@/components/SwitchToAdvertiserButton';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { AffiliateID } from '@wormgraph/helpers';
import { Button, Card, Empty, Input, message } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { LIST_OFFERS_FOR_AFFILIATE } from './api.gql';
import styles from './index.less';

const OffersPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const [searchString, setSearchString] = useState('');
  const [offers, setOffers] = useState<OfferAffiliateView[]>([]);
  const { data, loading, error } = useQuery<
    { listOffersAvailableForOrganizer: ListOffersAvailableForOrganizerResponse },
    QueryListOffersAvailableForOrganizerArgs
  >(LIST_OFFERS_FOR_AFFILIATE, {
    variables: { affiliateID },
    onCompleted: (data) => {
      if (
        data?.listOffersAvailableForOrganizer.__typename ===
        'ListOffersAvailableForOrganizerResponseSuccess'
      ) {
        const offers = data.listOffersAvailableForOrganizer.offers;
        console.log(offers);
        setOffers(offers);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listOffersAvailableForOrganizer.__typename === 'ResponseError') {
    return <span>{data?.listOffersAvailableForOrganizer.error?.message || ''}</span>;
  }

  const filterBySearchString = (offer: OfferAffiliateView) => {
    return (
      offer.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      offer.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        This page lists all the offers you have access to. Offers are revenue streams for promoting
        an advertisers product or service. To get more,{' '}
        <Link to="/marketplace/browse">visit the marketplace.</Link> To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
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
        <$Vertical>
          {renderHelpText()}
          <$Horizontal justifyContent="space-between">
            <Input.Search
              placeholder="Filter Offers"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <$Horizontal spacing={2}>
              <SwitchToAdvertiserButton buttonText="Create Own Offer" />
              <Link to="/marketplace/browse">
                <Button type="primary">Add Marketplace Offer</Button>
              </Link>
            </$Horizontal>
          </$Horizontal>
          <br />
          {offers.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You do not have any offers yet. Visit the marketplace to hunt for a good one!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to="/marketplace/browse">
                <Button type="primary">Visit Marketplace</Button>
              </Link>
            </Empty>
          )}
          <div className={styles.content}>
            {offers.filter(filterBySearchString).map((offer) => {
              const minEarn =
                offer.activationsForAffiliate
                  .slice()
                  .sort((a, b) => (a?.pricing || 0) - (b?.pricing || 0))[0]?.pricing || 0;
              const maxEarn = offer.activationsForAffiliate.reduce((acc, curr) => {
                return acc + curr?.pricing || 0;
              }, 0);
              return (
                <Link key={offer.id} to={`/dashboard/offers/id/${offer.id}`}>
                  <Card
                    hoverable
                    className={styles.card}
                    cover={
                      <img alt="example" src={offer.image || ''} className={styles.cardImage} />
                    }
                  >
                    <Meta title={offer.title} description={`$${minEarn}-$${maxEarn} Each`} />
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

export default OffersPage;
