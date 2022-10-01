import type {
  ResponseError,
  EditLootboxPayload,
  GetLootboxByIdResponse,
  QueryGetLootboxByIdArgs,
  Lootbox,
} from '@/api/graphql/generated/types';
import { Image } from 'antd';
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

const LootboxPage: React.FC = () => {
  // get the advertiser user
  //   const { affiliateUser } = useAffiliateUser();
  //   const { id: affiliateUserID } = affiliateUser;
  // do the rest
  const { lootboxID, tid: tournamentID } = useParams();
  console.log(lootboxID, tournamentID);
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
    { title: 'Lootbox', route: '/dashboard/lootbox' },
    { title: lootbox?.name || '', route: `/dashboard/lootbox/id/${lootboxID}` },
  ];

  return (
    <PageContainer>
      <div className={styles.content}>
        <BreadCrumbDynamic breadLine={breadLine} />
        <h1>{lootbox.name}</h1>
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
              tournamentID: tournamentID as TournamentID | undefined,
            }}
            mode="view-edit"
            onSubmitEdit={editLootbox}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default LootboxPage;
