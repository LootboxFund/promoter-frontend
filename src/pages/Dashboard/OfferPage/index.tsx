import type {
  ViewOfferDetailsAsEventAffiliateResponse,
  QueryViewOfferDetailsAsAffiliateArgs,
  OfferAffiliateView,
  ViewOfferDetailsAsEventAffiliatePayload,
  AdSetPreview,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { $ColumnGap, $Horizontal, placeholderImage } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Col, Image, Row } from 'antd';
import { useQuery } from '@apollo/client';
import { Link, useParams } from '@umijs/max';
import { AdvertiserID, AffiliateID, OfferID } from '@wormgraph/helpers';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { VIEW_OFFER_AS_AFFILIATE } from './api.gql';
import styles from './index.less';

import Meta from 'antd/lib/card/Meta';
import AdSetToTournamentModal from '@/components/AdSetToTournamentModal';
import CreateOfferForm from '@/components/CreateOfferForm';

const OfferPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const { offerID } = useParams();
  const [offer, setOffer] = useState<OfferAffiliateView>();
  const [selectedAdSet, setSelectedAdSet] = useState<AdSetPreview | null>(null);
  const { data, loading, error } = useQuery<
    { viewOfferDetailsAsAffiliate: ViewOfferDetailsAsEventAffiliateResponse },
    {
      affiliateID: AffiliateID;
      payload: ViewOfferDetailsAsEventAffiliatePayload;
    }
  >(VIEW_OFFER_AS_AFFILIATE, {
    variables: {
      affiliateID: affiliateID as AffiliateID,
      payload: {
        affiliateID,
        offerID: offerID || '',
      },
    },
    onCompleted: (data) => {
      if (
        data?.viewOfferDetailsAsAffiliate.__typename ===
        'ViewOfferDetailsAsEventAffiliateResponseSuccess'
      ) {
        const offer = data.viewOfferDetailsAsAffiliate.offer;
        console.log(offer);
        setOffer(offer);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewOfferDetailsAsAffiliate.__typename === 'ResponseError') {
    return <span>{data?.viewOfferDetailsAsAffiliate.error?.message || ''}</span>;
  }
  const gridStyle: React.CSSProperties = {
    flex: '100%',
  };
  const maxWidth = '1000px';
  const breadLine = [
    { title: 'Manage', route: '/dashboard' },
    { title: 'Offers', route: '/dashboard/offers' },
    { title: offer?.title || '', route: `/dashboard/offers/id/${offer?.id}` },
  ];
  const activationsSorted = (offer?.activationsForAffiliate || [])
    .slice()
    .sort((a, b) => (a.order && b.order ? a.order - b.order : 1));
  return (
    <div style={{ maxWidth }}>
      {loading || !offer ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />

          <h1>{offer.title}</h1>
          <br />
          <$Horizontal>
            <CreateOfferForm
              offer={{
                title: offer.title,
                description: offer.description || '',
                image: offer.image || '',
                advertiserID: offer.advertiserID as AdvertiserID,
                advertiserName: offer.advertiserName,
                maxBudget: offer.maxBudget || 0,
                startDate: offer.startDate,
                endDate: offer.endDate,
                status: offer.status,
              }}
              advertiserID={offer.advertiserID as AdvertiserID}
              onSubmit={() => {}}
              mode="view-only"
            />
            <$ColumnGap />
            <Image width={200} src={offer.image || ''} />
          </$Horizontal>
          <br />
          <h2>Activation Funnel</h2>
          <br />
          <Card>
            {activationsSorted.map((activation, i) => {
              return (
                <Card.Grid key={activation.activationID} style={gridStyle}>
                  <Row>
                    <Col
                      span={4}
                      className={styles.verticalCenter}
                      style={{ alignItems: 'flex-end' }}
                    >
                      ${activation.pricing}
                    </Col>
                    <Col span={6} className={styles.verticalCenter}>
                      {activation.activationName}{' '}
                    </Col>
                    <Col span={14} className={styles.verticalCenter}>
                      {activation.description}{' '}
                    </Col>
                  </Row>
                </Card.Grid>
              );
            })}
          </Card>
          <br />
          <br />
          <h2>Ad Sets</h2>
          <br />
          <div className={styles.adSetGrid}>
            {offer.adSetPreviews.map((adSet) => {
              const imageToDisplay = adSet.thumbnail || placeholderImage;
              return (
                <Card
                  key={adSet.id}
                  hoverable
                  className={styles.card}
                  cover={<img alt="example" src={imageToDisplay} className={styles.cardImage} />}
                  actions={[
                    <Button
                      key={`${adSet.id}-add-to-event`}
                      onClick={() => setSelectedAdSet(adSet)}
                      type="primary"
                      style={{ width: '90%' }}
                    >
                      Add To Event
                    </Button>,
                  ]}
                >
                  <Meta title={adSet.name} description={adSet.placement} />
                </Card>
              );
            })}
          </div>
          <br />
          <AdSetToTournamentModal
            offerID={offer.id as OfferID}
            adSet={selectedAdSet}
            isOpen={!!selectedAdSet}
            closeModal={() => {
              setSelectedAdSet(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OfferPage;
