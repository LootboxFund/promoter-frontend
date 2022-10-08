import type {
  ResponseError,
  EditLootboxPayload,
  QueryGetLootboxByIdArgs,
  Lootbox,
} from '@/api/graphql/generated/types';
import { Button, Empty, Image, Modal, Popconfirm } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { EDIT_LOOTBOX, GET_LOOTBOX, GetLootboxFE, LootboxFE } from './api.gql';
import styles from './index.less';
import { useParams } from 'react-router-dom';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { $ColumnGap, $Horizontal, $InfoDescription } from '@/components/generics';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import CreateLootboxForm from '@/components/CreateLootboxForm';
import { TournamentID } from '@wormgraph/helpers';
import GenerateReferralModal from '@/components/GenerateReferralModal';

interface MagicLinkParams {
  tournamentID?: TournamentID;
}

export const extractURLState_LootboxPage = (): MagicLinkParams => {
  const url = new URL(window.location.href);

  const params: MagicLinkParams = {
    tournamentID: url.searchParams.get('tid') as TournamentID | undefined,
  };

  return params;
};

const LootboxPage: React.FC = () => {
  // get the advertiser user
  //   const { affiliateUser } = useAffiliateUser();
  //   const { id: affiliateUserID } = affiliateUser;
  // do the rest
  const { lootboxID } = useParams();
  const [magicLinkParams, setMagicLinkParams] = useState<MagicLinkParams>(
    extractURLState_LootboxPage(),
  );
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  //   const [lootbox, setLootbox] = useState<LootboxFE>();

  // VIEW Lootbox
  const { data, loading, error } = useQuery<
    { getLootboxByID: GetLootboxFE | ResponseError },
    QueryGetLootboxByIdArgs
  >(GET_LOOTBOX, {
    variables: { id: lootboxID || '' },
  });
  // EDIT Lootbox
  //   const [editAdMutation] = useMutation<
  //     { editAd: ResponseError | EditAdResponseSuccess },
  //     MutationEditAdArgs
  //   >(EDIT_AD, {
  //     refetchQueries: [
  //       { query: VIEW_AD, variables: { adID: adID as AdID } },
  //       { query: LIST_ADS_PREVIEWS, variables: { advertiserID } },
  //     ],
  //   });
  const editLootbox = async (payload: Omit<EditLootboxPayload, 'id'>) => {
    console.log('EDIT LOOTBOX', payload);
    // const res = await editAdMutation({
    //   variables: {
    //     payload: {
    //       ...payload,
    //       id: adID as AdID,
    //     },
    //   },
    // });
    // if (!res?.data || res?.data?.editAd?.__typename === 'ResponseError') {
    //   // @ts-ignore
    //   throw new Error(res?.data?.editAd?.error?.message || words.anErrorOccured);
    // }
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </$InfoDescription>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <div className={styles.loading_container}>
          <Spin />
        </div>
      </PageContainer>
    );
  } else if (error || !data?.getLootboxByID) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.getLootboxByID.__typename === 'ResponseError') {
    return <span>{data?.getLootboxByID?.error?.message || ''}</span>;
  }

  const lootbox = (data?.getLootboxByID as GetLootboxFE).lootbox;

  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Event', route: `/dashboard/events/id/${magicLinkParams.tournamentID}` },
    { title: lootbox?.name || '', route: `/dashboard/lootbox/id/${lootboxID}` },
  ];

  const maxWidth = '1000px';
  return (
    <div style={{ maxWidth }}>
      <BreadCrumbDynamic breadLine={breadLine} />

      <$Horizontal justifyContent="space-between">
        <h1>{lootbox.name}</h1>
        <Button type="primary">View Public Page</Button>
      </$Horizontal>
      <br />
      {renderHelpText()}
      <div style={{ minWidth: '1000px', maxWidth: '1000px' }}>
        <CreateLootboxForm
          lootbox={{
            description: lootbox.description,
            backgroundImage: lootbox.backgroundImage,
            logoImage: lootbox.logo,
            themeColor: lootbox.themeColor,
            nftBountyValue: lootbox.nftBountyValue || '',
            joinCommunityUrl: lootbox.joinCommunityUrl || '',
            name: lootbox.name,
            maxTickets: lootbox.maxTickets,
            tag: lootbox.symbol,
            tournamentID: magicLinkParams.tournamentID as TournamentID | undefined,
          }}
          mode="view-edit"
          onSubmitEdit={editLootbox}
        />
      </div>
      <br />
      <br />
      <$Horizontal justifyContent="space-between">
        <h2 id="team-members">Team Members</h2>
        <Popconfirm
          title="Go to the Offers Page to add them as a revenue for this Event"
          onConfirm={() => console.log('confirm')}
          okText="Go To Offers Page"
          showCancel={false}
        >
          <Button type="primary">Invite Member</Button>
        </Popconfirm>
      </$Horizontal>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{
          height: 60,
        }}
        description={
          <span style={{ maxWidth: '200px' }}>
            {`There are no team members for this LOOTBOX. Invite some to start generating marketing graphics & social media posts.`}
          </span>
        }
        style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
      >
        <Button>Invite Member</Button>
      </Empty>
      <br />
      <br />
      <$Horizontal justifyContent="space-between">
        <h2 id="team-members">Ticket Analytics</h2>
        <$Horizontal justifyContent="space-between">
          <Button onClick={() => setIsReferralModalOpen(true)} style={{ marginRight: '5px' }}>
            Generate Invite
          </Button>
          <Popconfirm
            title="Go to the Offers Page to add them as a revenue for this Event"
            onConfirm={() => console.log('confirm')}
            okText="Go To Offers Page"
            showCancel={false}
          >
            <Button type="primary">Generate Marketing</Button>
          </Popconfirm>
        </$Horizontal>
      </$Horizontal>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Analytics Coming Soon"
        style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
      />
      <br />
      <br />
      <$Horizontal justifyContent="space-between">
        <h2 id="team-members">Payout Rewards</h2>
        <Popconfirm
          title="Go to the Offers Page to add them as a revenue for this Event"
          onConfirm={() => console.log('confirm')}
          okText="Go To Offers Page"
          showCancel={false}
        >
          <Button type="primary">Deposit Payout</Button>
        </Popconfirm>
      </$Horizontal>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{
          height: 60,
        }}
        description={
          <span style={{ maxWidth: '200px' }}>
            {`There are no team members for this LOOTBOX. Invite some to start generating marketing graphics & social media posts.`}
          </span>
        }
        style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
      >
        <Button>Payout Rewards</Button>
      </Empty>
      <GenerateReferralModal isOpen={isReferralModalOpen} setIsOpen={setIsReferralModalOpen} />
    </div>
  );
};

export default LootboxPage;
