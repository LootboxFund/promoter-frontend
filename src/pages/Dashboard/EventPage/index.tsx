import {
  ViewTournamentAsOrganizerResponse,
  QueryViewTournamentAsOrganizerArgs,
  Tournament,
  DealConfigTournament,
  RemoveOfferAdSetFromTournamentResponse,
  MutationRemoveOfferAdSetFromTournamentArgs,
  ResponseError,
  AdSetStatus,
  EditTournamentResponseSuccess,
  MutationEditTournamentArgs,
  EditTournamentPayload,
  LootboxTournamentSnapshot,
} from '@/api/graphql/generated/types';
import { history } from '@umijs/max';
import * as _ from 'lodash';

import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';

import { useMutation, useQuery } from '@apollo/client';
import { Link, useParams } from '@umijs/max';
import type {
  ActivationID,
  AffiliateID,
  LootboxID,
  OfferID,
  RateQuoteID,
  TournamentID,
} from '@wormgraph/helpers';
import { AffiliateType } from '@wormgraph/helpers';
import Spin from 'antd/lib/spin';
import React, { useMemo, useState } from 'react';
import {
  EDIT_TOURNAMENT_AS_ORGANIZER,
  REMOVE_ADSET_FROM_TOURNAMENT,
  VIEW_TOURNAMENT_AS_ORGANIZER,
  PAGINATE_EVENT_LOOTBOXES,
  PaginateEventLootboxesFE,
  LootboxTournamentSnapshotFE,
  parsePaginatedLootboxEventSnapshots,
} from './api.gql';
import styles from './index.less';
import { $Horizontal, $Vertical, $ColumnGap, $InfoDescription } from '@/components/generics';
import {
  Affix,
  Anchor,
  Avatar,
  Button,
  Card,
  Empty,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tag,
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
import {
  AdSetInTournamentStatus,
  LootboxTournamentStatus,
} from '../../../api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import DeviceSimulator, { DeviceSimulatorProps } from '@/components/DeviceSimulator';
import CreateEventForm from '@/components/CreateEventForm';
import { VIEW_TOURNAMENTS_AS_ORGANIZER } from '../EventsPage/api.gql';
import GenerateReferralModal from '@/components/GenerateReferralModal';

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
interface PreviewAdSimulator extends DeviceSimulatorProps {
  title: string;
}
const EventPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const { eventID } = useParams();
  const [rateCard, setRateCard] = useState<RateCardModalInput | null>(null);
  const [offerToAddPromoter, setOfferToAddPromoter] = useState<DealConfigTournament | null>(null);
  const [tournament, setTournament] = useState<Tournament>();
  const [showTableOfContents, setShowTableOfContents] = useState(true);
  const [simulatedAd, setSimulatedAd] = useState<PreviewAdSimulator | null>();
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // VIEW TOURNAMENT AS ORGANIZER
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
        console.log(`--- tournament`, tournament);
      }
    },
  });

  // GET EVENT LOOTBOXES
  const {
    data: paginatedLootboxEdges,
    loading: loadingLootboxEdges,
    // error: errorLootboxEdges,
  } = useQuery<{ tournament: PaginateEventLootboxesFE | ResponseError }>(PAGINATE_EVENT_LOOTBOXES, {
    variables: {
      tournamentID: eventID || '',
      first: 30,
    },
  });

  const lootboxTournamentSnapshots: LootboxTournamentSnapshotFE[] = useMemo(() => {
    return parsePaginatedLootboxEventSnapshots(
      paginatedLootboxEdges?.tournament as PaginateEventLootboxesFE | undefined,
    );
  }, [paginatedLootboxEdges?.tournament]);

  // EDIT TOURNAMENT AS ORGANIZER
  const [editTournamentMutation] = useMutation<
    { editTournament: ResponseError | EditTournamentResponseSuccess },
    MutationEditTournamentArgs
  >(EDIT_TOURNAMENT_AS_ORGANIZER, {
    refetchQueries: [
      {
        query: VIEW_TOURNAMENT_AS_ORGANIZER,
        variables: { tournamentID: eventID || '' },
      },
      { query: VIEW_TOURNAMENTS_AS_ORGANIZER, variables: { affiliateID } },
    ],
  });

  // REMOVE ADSET FROM TOURNAMENT
  const [removeAdSetOffer] = useMutation<
    {
      removeOfferAdSetFromTournament: ResponseError | RemoveOfferAdSetFromTournamentResponse;
    },
    MutationRemoveOfferAdSetFromTournamentArgs
  >(REMOVE_ADSET_FROM_TOURNAMENT, {
    refetchQueries: [
      { query: VIEW_TOURNAMENT_AS_ORGANIZER, variables: { tournamentID: eventID || '' } },
    ],
  });

  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewTournamentAsOrganizer.__typename === 'ResponseError') {
    return <span>{data?.viewTournamentAsOrganizer.error?.message || ''}</span>;
  }

  const editTournament = async (payload: EditTournamentPayload) => {
    const res = await editTournamentMutation({
      variables: {
        payload: {
          id: eventID || '',
          title: payload.title || 'Untitled Tournament',
          description: payload.description,
          tournamentLink: payload.tournamentLink || '',
          coverPhoto: payload.coverPhoto || '',
          prize: payload.prize || '',
          tournamentDate: payload.tournamentDate,
          communityURL: payload.communityURL || '',
          magicLink: payload.magicLink || '',
        },
      },
    });
    if (!res?.data || res?.data?.editTournament?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.editTournament?.error?.message || words.anErrorOccured);
    }
  };

  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Events', route: '/dashboard/events' },
    { title: tournament?.title || '', route: `/dashboard/events/id/${tournament?.id}` },
  ];

  const LootboxGallery = ({
    snapshots,
    loading,
  }: {
    snapshots: LootboxTournamentSnapshotFE[];
    loading: boolean;
  }) => {
    return (
      <div className={styles.content}>
        {snapshots.map((snapshot) => (
          <Link
            key={snapshot.lootboxID}
            to={`/dashboard/lootbox/id/${snapshot.lootboxID}?tid=${eventID}`}
            target="_blank"
          >
            <Card
              hoverable
              className={styles.card}
              cover={
                <img alt="example" src={snapshot.stampImage || ''} className={styles.cardImage} />
              }
            >
              <Meta
                title={snapshot.name}
                description={
                  snapshot.status === LootboxTournamentStatus.Active ? (
                    <Tag color="success">Active</Tag>
                  ) : (
                    <Tag color="warning">Inactive</Tag>
                  )
                }
              />
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`This is the Event Control Panel for "${
          tournament?.title || 'your event'
        }". You can manage partners, revenue & Lootboxes as well as view analytics.`}{' '}
        To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };
  const maxWidth = '1000px';
  return (
    <div>
      {loading || !tournament ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div id="breadcrumbs" style={{ maxWidth }}>
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
          {renderHelpText()}

          <$Horizontal justifyContent="flex-end" style={{ width: '100%' }}>
            <CreateEventForm
              onSubmitEdit={editTournament}
              tournament={{
                title: tournament.title,
                description: tournament.description,
                tournamentDate: tournament.tournamentDate,
                tournamentLink: tournament.tournamentLink || '',
                coverPhoto: tournament.coverPhoto || '',
                magicLink: tournament.magicLink || '',
                prize: tournament.prize || '',
                communityURL: tournament.communityURL || '',
              }}
              mode="view-edit"
              affiliateID={affiliateID as AffiliateID}
            />
            <$ColumnGap />
            <Affix offsetTop={60} style={{ pointerEvents: 'none' }}>
              <Card style={{ width: '300px', pointerEvents: 'all' }}>
                <$Horizontal justifyContent="space-between">
                  <h4>Table of Contents</h4>
                  <Button size="small" onClick={() => setShowTableOfContents(!showTableOfContents)}>
                    {showTableOfContents ? 'Hide' : 'Expand'}
                  </Button>
                </$Horizontal>
                {showTableOfContents && (
                  <Anchor offsetTop={70}>
                    <Anchor.Link href="#breadcrumbs" title="Event Info" />
                    <Anchor.Link href="#lootbox-gallery" title="Lootbox Gallery" />
                    <Anchor.Link href="#ticket-analytics" title="Ticket Analytics" />
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
            <h2 id="lootbox-gallery">Lootbox Gallery</h2>
            <$Horizontal>
              <Popconfirm
                title={`Coming soon - Inviting a team means letting them customize their own Lootbox design. Copy the invite link and send it to them. Their Lootbox will appear here once they've created it.`}
                onConfirm={() => {
                  message.info('Feature coming soon.');
                  // navigator.clipboard.writeText('magic_link');
                  // message.success('Copied Lootbox Invite Link to clipboard');
                }}
                okText="Copy Invite Link - Coming Soon"
                cancelText={'Cancel'}
                style={{ maxWidth: '500px' }}
              >
                <Button style={{ marginRight: '5px' }}>Invite Team</Button>
              </Popconfirm>
              <Link to={`/dashboard/lootbox/create?tid=${eventID}`}>
                <Button type="primary">Create Lootbox</Button>
              </Link>
            </$Horizontal>
          </$Horizontal>
          <$InfoDescription maxWidth={maxWidth}>
            Each Lootbox represents a team competing in the event.
          </$InfoDescription>

          {!lootboxTournamentSnapshots || lootboxTournamentSnapshots.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`There are no Lootboxes for this event. Create one to get started.`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to={`/dashboard/lootbox/create?tid=${eventID}`}>
                <Button>Create Lootbox</Button>
              </Link>
            </Empty>
          ) : (
            <LootboxGallery loading={loadingLootboxEdges} snapshots={lootboxTournamentSnapshots} />
          )}
          <br />
          <br />
          <$Horizontal justifyContent="space-between">
            <h2 id="ticket-analytics">Ticket Analytics</h2>
            <Button
              type="primary"
              onClick={() => setIsReferralModalOpen(true)}
              disabled={lootboxTournamentSnapshots.length === 0}
            >
              Invite Fans
            </Button>
          </$Horizontal>
          <$InfoDescription maxWidth={maxWidth}>
            {`Lootbox tickets are distributed to fans & audience members.`}
          </$InfoDescription>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Analytics Coming Soon"
            style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
          />
          <br />
          <br />
          <$Horizontal justifyContent="space-between">
            <h2 id="revenue-sharing">Revenue Sharing</h2>
            <Popconfirm
              title="Go to the Offers Page to add them as a revenue for this Event"
              onConfirm={() => history.push(`/dashboard/offers`)}
              okText="Go To Offers Page"
              showCancel={false}
            >
              <Button type="primary">Add Revenue</Button>
            </Popconfirm>
          </$Horizontal>
          <$InfoDescription maxWidth={maxWidth}>
            {`Earn revenue from the video ads played on Lootbox tickets.`}
          </$InfoDescription>
          {!tournament.dealConfigs || tournament.dealConfigs.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You have not created any revenue streams yet.
                  Go to the Offers Page to get started!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to="/dashboard/offers">
                <Button>Add Revenue</Button>
              </Link>
            </Empty>
          ) : null}
          {tournament.dealConfigs.map((dealConfig) => {
            const uniqueActivations = _.uniq(
              dealConfig.rateQuoteConfigs
                .slice()
                .sort((a, b) => a.activationOrder - b.activationOrder)
                .map((x) => x.activationID),
            );

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
                      {dealConfig.adSets
                        .filter((adSet) => adSet.status === AdSetInTournamentStatus.Active)
                        .map((adSet) => {
                          let isLoading = false;
                          return (
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
                                  key={`${dealConfig.offerID}-${adSet.id}-view`}
                                  type="primary"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (adSet.ad) {
                                      setSimulatedAd({
                                        title: `Offer "${dealConfig.offerName}" - Ad Set "${adSet.name}"`,
                                        placement: adSet.placement,
                                        creative: {
                                          themeColor: adSet.ad.themeColor,
                                          callToAction: adSet.ad.callToAction,
                                          creativeType: adSet.ad.creativeType,
                                          creativeLinks: adSet.ad.creativeLinks,
                                          aspectRatio: adSet.ad.aspectRatio,
                                        },
                                      });
                                    }
                                  }}
                                  style={{ width: '85%' }}
                                >
                                  View
                                </Button>,
                                <Popconfirm
                                  key={`${dealConfig.offerID}-${adSet.id}-button`}
                                  title="Are you sure to remove this Ad from your Event?"
                                  onConfirm={async (e) => {
                                    console.log(`eventID = `, eventID);
                                    if (eventID) {
                                      isLoading = true;
                                      await removeAdSetOffer({
                                        variables: {
                                          payload: {
                                            adSetID: adSet.id,
                                            tournamentID: eventID,
                                            offerID: dealConfig.offerID,
                                          },
                                        },
                                      });
                                      isLoading = false;
                                    }
                                  }}
                                  okText="Remove"
                                  cancelText="Cancel"
                                >
                                  <Button
                                    onClick={(e) => e.preventDefault()}
                                    loading={isLoading}
                                    style={{ width: '85%' }}
                                  >
                                    Remove
                                  </Button>
                                </Popconfirm>,
                              ]}
                            >
                              <Meta title={adSet.name} description={adSet.placement} />
                            </Card>
                          );
                        })}
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
      {simulatedAd && (
        <Modal
          title={simulatedAd?.title || 'Simulated Ad'}
          open={!!simulatedAd}
          onCancel={() => setSimulatedAd(null)}
          footer={[
            <Button key="simulated-ad-modal-close" onClick={() => setSimulatedAd(null)}>
              Close
            </Button>,
          ]}
        >
          {simulatedAd && <DeviceSimulator creative={simulatedAd.creative} />}
        </Modal>
      )}
      {lootboxTournamentSnapshots.length > 0 && (
        <GenerateReferralModal
          isOpen={isReferralModalOpen}
          setIsOpen={setIsReferralModalOpen}
          lootboxID={(lootboxTournamentSnapshots[0].lootboxID || '') as LootboxID}
          tournamentID={(eventID || '') as TournamentID}
        />
      )}
    </div>
  );
};

export default EventPage;
