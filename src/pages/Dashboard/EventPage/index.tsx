import type {
  ViewTournamentAsOrganizerResponse,
  QueryViewTournamentAsOrganizerArgs,
  Tournament,
  DealConfigTournament,
} from '@/api/graphql/generated/types';
import { history } from '@umijs/max';

import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';

import { useQuery } from '@apollo/client';
import { Link, useParams } from '@umijs/max';
import type {
  ActivationID,
  AffiliateID,
  OfferID,
  RateQuoteID,
  TournamentID,
} from '@wormgraph/helpers';
import { AffiliateType } from '@wormgraph/helpers';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { VIEW_TOURNAMENT_AS_ORGANIZER } from './api.gql';
import styles from './index.less';
import { $Horizontal, $Vertical, $ColumnGap } from '@/components/generics';
import {
  Affix,
  Anchor,
  Avatar,
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tooltip,
} from 'antd';
import Meta from 'antd/lib/card/Meta';
import type { ColumnsType } from 'antd/lib/table';
import RateCardEditorModal from '@/components/RateCardEditorModal';
import type { RateCardModalInput } from '@/components/RateCardEditorModal';
import AddPromoterToTournamentModal, {
  ChosenPromoter,
} from '@/components/AddPromoterToTournamentModal';
import { InfoCircleOutlined } from '@ant-design/icons';

const affiliateID = 'rMpu8oZN3EjEe5XL3s50' as AffiliateID;

interface DataType {
  rateQuoteID: string;
  activationID: string;
  activationName: string;
  affiliateAvatar: string;
  affiliateName: string;
  pricing: number;
  activationOrder: number;
  description: string;
  affiliateID: string;
  offerID: string;
  offerName: string;
}

const EventPage: React.FC = () => {
  const { eventID } = useParams();
  const [rateCard, setRateCard] = useState<RateCardModalInput | null>(null);
  const [offerToAddPromoter, setOfferToAddPromoter] = useState<DealConfigTournament | null>(null);
  const [tournament, setTournament] = useState<Tournament>();
  const [showTableOfContents, setShowTableOfContents] = useState(true);

  const { data, loading, error } = useQuery<
    { viewTournamentAsOrganizer: ViewTournamentAsOrganizerResponse },
    QueryViewTournamentAsOrganizerArgs
  >(VIEW_TOURNAMENT_AS_ORGANIZER, {
    variables: {
      tournamentID: eventID || '',
    },
    onCompleted: (data) => {
      if (
        data?.viewTournamentAsOrganizer.__typename === 'ViewTournamentAsOrganizerResponseSuccess'
      ) {
        const tournament = data.viewTournamentAsOrganizer.tournament;

        setTournament(tournament);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewTournamentAsOrganizer.__typename === 'ResponseError') {
    return <span>{data?.viewTournamentAsOrganizer.error?.message || ''}</span>;
  }

  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Events', route: '/dashboard/events' },
    { title: tournament?.title || '', route: `/dashboard/events/id/${tournament?.id}` },
  ];

  return (
    <div>
      {loading || !tournament ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div id="breadcrumbs" style={{ maxWidth: '1000px' }}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <$Horizontal justifyContent="space-between">
            <h1>{tournament.title}</h1>
            <a
              href={`https://www.lootbox.fund/watch?tournament=${tournament.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button type="primary">View Event</Button>
            </a>
          </$Horizontal>
          <br />
          <$Horizontal justifyContent="flex-end" style={{ width: '100%' }}>
            <Card style={{ flex: 1 }}>
              <p>{tournament.description}</p>
            </Card>
            <$ColumnGap />
            <Affix offsetTop={60}>
              <Card style={{ width: '300px' }}>
                <$Horizontal justifyContent="space-between">
                  <h4>Table of Contents</h4>
                  <Button size="small" onClick={() => setShowTableOfContents(!showTableOfContents)}>
                    {showTableOfContents ? 'Hide' : 'Expand'}
                  </Button>
                </$Horizontal>
                {showTableOfContents && (
                  <Anchor offsetTop={70}>
                    <Anchor.Link href="#breadcrumbs" title="Event Info" />
                    <Anchor.Link href="#revenue-sharing" title="Revenue Sharing">
                      {tournament.dealConfigs.map((dealConfig) => {
                        return (
                          <Anchor.Link
                            key={`#toc-deal-${dealConfig.offerID}`}
                            href={`#offer-${dealConfig.offerID}`}
                            title={dealConfig.offerName}
                          />
                        );
                      })}
                    </Anchor.Link>
                  </Anchor>
                )}
              </Card>
            </Affix>
          </$Horizontal>
          <br />
          <br />

          <$Horizontal justifyContent="space-between">
            <h2 id="revenue-sharing">Revenue Sharing</h2>
            <Popconfirm
              title="Go to the Offers Page to add them into this Event"
              onConfirm={() => history.push(`/dashboard/offers`)}
              okText="Go To Offers Page"
              showCancel={false}
            >
              <Button type="primary">Add Offer</Button>
            </Popconfirm>
          </$Horizontal>
          <br />

          {tournament.dealConfigs.map((dealConfig) => {
            const uniqueActivations = dealConfig.rateQuoteConfigs
              .slice()
              .sort((a, b) => a.activationOrder - b.activationOrder)
              .map((x) => x.activationID);

            return (
              <Card id={`offer-${dealConfig.offerID}`} key={dealConfig.offerID}>
                <$Horizontal justifyContent="space-between">
                  <$Vertical style={{ marginBottom: '30px' }}>
                    <h3>{dealConfig.offerName}</h3>
                    <span style={{ color: 'gray' }}>{`From ${dealConfig.advertiserName}`}</span>
                  </$Vertical>
                  <Link to={`/dashboard/offers/id/${dealConfig.offerID}`}>
                    <Button>View Offer</Button>
                  </Link>
                </$Horizontal>
                <Tabs defaultActiveKey="1" type="card" style={{ width: '100%' }}>
                  <Tabs.TabPane tab="Revenue Sharing" key="1">
                    <$Horizontal justifyContent="flex-end" style={{ marginBottom: '10px' }}>
                      <Button onClick={() => setOfferToAddPromoter(dealConfig)}>
                        Add Promoter
                      </Button>
                    </$Horizontal>
                    {uniqueActivations.map((uniqueActivationID) => {
                      const uniqueActivation = dealConfig.rateQuoteConfigs.find(
                        (rqc) => rqc.activationID === uniqueActivationID,
                      );
                      const columns: ColumnsType<DataType> = [
                        {
                          title: (
                            <Tooltip title={uniqueActivation?.description}>
                              <InfoCircleOutlined />
                              <span style={{ marginLeft: '10px' }}>
                                {uniqueActivation?.activationName}
                              </span>
                            </Tooltip>
                          ),
                          dataIndex: 'activationName',
                          key: 'activationName',
                          width: '60%',
                          render: (_, record) => (
                            <$Horizontal>
                              <Avatar
                                src={record.affiliateAvatar}
                                size="small"
                                style={{ marginRight: '10px' }}
                              />
                              <span>{record.affiliateName}</span>
                            </$Horizontal>
                          ),
                        },
                        {
                          title: 'Rate',
                          dataIndex: 'pricing',
                          key: 'pricing',
                          width: '20%',
                          render: (_, record) => <span>{`$${record.pricing}`}</span>,
                        },
                        {
                          title: 'Action',
                          key: 'action',
                          width: '20%',
                          render: (_, record) => {
                            if (record.affiliateID !== affiliateID) {
                              return (
                                <Space size="middle">
                                  <a
                                    onClick={() => {
                                      const rateCard = {
                                        tournamentID: (eventID || '') as TournamentID,
                                        promoterID: record.affiliateID as AffiliateID,
                                        promoterName: record.affiliateName,
                                        promoterAvatar: record.affiliateAvatar,
                                        offerID: record.offerID as OfferID,
                                        offerName: record.offerName,
                                        rateQuotes: dealConfig.rateQuoteConfigs
                                          .filter((rq) => rq.affiliateID === record.affiliateID)
                                          .map((rq) => {
                                            const overTotalPricing =
                                              dealConfig.rateQuoteConfigs.find(
                                                (r) =>
                                                  r.affiliateID === affiliateID &&
                                                  r.activationID === rq.activationID,
                                              )?.pricing || 0;
                                            return {
                                              id: rq.rateQuoteID as RateQuoteID,
                                              offerID: dealConfig.offerID as OfferID,
                                              activationID: rq.activationID as ActivationID,
                                              activationName: rq.activationName,
                                              activationDescription: rq.description || '',
                                              pricing: rq.pricing,
                                              overTotalPricing: overTotalPricing,
                                              tournamentID: (eventID || '') as TournamentID,
                                              affiliateID: rq.affiliateID as AffiliateID,
                                              affiliateType:
                                                rq.affiliateID === affiliateID
                                                  ? AffiliateType.Organizer
                                                  : AffiliateType.Promoter,
                                            };
                                          }),
                                      };
                                      setRateCard(rateCard);
                                    }}
                                  >
                                    Edit
                                  </a>
                                </Space>
                              );
                            }
                            return <i style={{ color: 'gray' }}>Default</i>;
                          },
                        },
                      ];
                      return (
                        <Table
                          key={`table-${uniqueActivationID}-${dealConfig.offerID}`}
                          pagination={false}
                          columns={columns}
                          style={{ marginBottom: '50px' }}
                          dataSource={dealConfig.rateQuoteConfigs
                            .filter((rqc) => rqc.activationID === uniqueActivationID)
                            .slice()
                            .sort((a, b) => b.pricing - a.pricing)
                            .map((rqc) => {
                              return {
                                rateQuoteID: rqc.rateQuoteID,
                                activationID: rqc.activationID,
                                pricing: rqc.pricing,
                                activationName: rqc.activationName,
                                activationOrder: rqc.activationOrder,
                                description: rqc.description || '',
                                affiliateID: rqc.affiliateID,
                                affiliateName: rqc.affiliateName,
                                affiliateAvatar: rqc.affiliateAvatar || '',
                                offerID: dealConfig.offerID,
                                offerName: dealConfig.offerName,
                              };
                            })}
                        />
                      );
                    })}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Ad Placements" key="2">
                    <$Horizontal justifyContent="flex-end">
                      <Popconfirm
                        title="Go to the Offer Page to include new Ad Sets into this Event"
                        onConfirm={() => history.push(`/dashboard/offers/id/${dealConfig.offerID}`)}
                        okText="Go to Offer"
                        showCancel={false}
                      >
                        <Button>Include Ad Set</Button>
                      </Popconfirm>
                    </$Horizontal>
                    <div className={styles.content}>
                      {dealConfig.adSets.map((adSet) => (
                        <Card
                          key={`${dealConfig.offerID}-${adSet.id}`}
                          hoverable
                          className={styles.card}
                          cover={
                            <img
                              alt="example"
                              src={adSet.thumbnail || ''}
                              className={styles.cardImage}
                            />
                          }
                          actions={[
                            <Button
                              key={`${dealConfig.offerID}-${adSet.id}-button`}
                              style={{ width: '80%' }}
                            >
                              Remove
                            </Button>,
                          ]}
                        >
                          <Meta title={adSet.name} description={adSet.placement} />
                        </Card>
                      ))}
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            );
          })}

          <RateCardEditorModal
            eventID={tournament.id as TournamentID}
            rateCard={rateCard}
            isOpen={!!rateCard}
            closeModal={() => setRateCard(null)}
          />

          <AddPromoterToTournamentModal
            isModalOpen={!!offerToAddPromoter}
            closeModal={() => setOfferToAddPromoter(null)}
            setChosenPromoter={async (promoter: ChosenPromoter) => {
              const dealConfig = tournament.dealConfigs.find(
                (dc) => dc.offerID === offerToAddPromoter?.offerID,
              );
              if (offerToAddPromoter && dealConfig) {
                const rateCard = {
                  tournamentID: (eventID || '') as TournamentID,
                  promoterID: promoter.affiliateID as AffiliateID,
                  promoterName: promoter.affiliateName,
                  promoterAvatar: promoter.affiliateAvatar,
                  offerID: offerToAddPromoter.offerID as OfferID,
                  offerName: offerToAddPromoter.offerName,
                  rateQuotes: dealConfig.rateQuoteConfigs
                    .filter((rq) => rq.affiliateID === affiliateID)
                    .map((rq) => {
                      const overTotalPricing =
                        dealConfig.rateQuoteConfigs.find(
                          (r) =>
                            r.affiliateID === affiliateID && r.activationID === rq.activationID,
                        )?.pricing || 0;
                      return {
                        id: rq.rateQuoteID as RateQuoteID,
                        offerID: dealConfig.offerID as OfferID,
                        activationID: rq.activationID as ActivationID,
                        activationName: rq.activationName,
                        activationDescription: rq.description || '',
                        pricing: overTotalPricing / 2,
                        overTotalPricing: overTotalPricing,
                        tournamentID: (eventID || '') as TournamentID,
                        affiliateID: promoter.affiliateID as AffiliateID,
                        affiliateType:
                          promoter.affiliateID === affiliateID
                            ? AffiliateType.Organizer
                            : AffiliateType.Promoter,
                      };
                    }),
                };
                setRateCard(rateCard);
                setOfferToAddPromoter(null);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventPage;
