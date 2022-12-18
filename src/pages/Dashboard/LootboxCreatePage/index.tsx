import CreateLootboxForm, {
  CreateLootboxRequest,
  MagicLinkParams,
} from '@/components/CreateLootboxForm';
import { $InfoDescription } from '@/components/generics';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import React, { useState } from 'react';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { useMutation } from '@apollo/client';
import { CREATE_LOOTBOX, CreateLootboxResponseFE } from './api.gql';
import { MutationCreateLootboxArgs } from '@/api/graphql/generated/types';

export const extractURLState_LootboxCreatePage = (): MagicLinkParams => {
  const url = new URL(window.location.href);

  const params: MagicLinkParams = {
    tournamentID: url.searchParams.get('tid') as TournamentID | undefined,
  };

  return params;
};

const LootboxCreatePage: React.FC = () => {
  const [magicLinkParams, setMagicLinkParams] = useState<MagicLinkParams>(
    extractURLState_LootboxCreatePage(),
  );

  const [createLootboxMutation, { loading: loadingLootboxCreate }] = useMutation<
    CreateLootboxResponseFE,
    MutationCreateLootboxArgs
  >(CREATE_LOOTBOX);

  const createLootbox = async (
    request: CreateLootboxRequest,
  ): Promise<{ lootboxID: LootboxID }> => {
    console.log(`

      request.payload.name = ${request.payload.name}
      request.payload.name.slice(0, 11) = ${request.payload.name.slice(0, 11)}
      request.payload.maxTickets = ${request.payload.maxTickets}

      `);

    const res = await createLootboxMutation({
      variables: {
        payload: {
          name: request.payload.name,
          description: request.payload.description,
          logo: request.payload.logoImage,
          backgroundImage: request.payload.backgroundImage,
          nftBountyValue: request.payload.nftBountyValue,
          joinCommunityUrl: request.payload.joinCommunityUrl,
          maxTickets: request.payload.maxTickets,
          themeColor: request.payload.themeColor,
          tournamentID: magicLinkParams.tournamentID as TournamentID,
        },
      },
    });

    if (res?.data?.createLootbox.__typename === 'CreateLootboxResponseSuccess') {
      const lootboxID = res.data.createLootbox.lootbox.id;
      return { lootboxID: lootboxID };
    }

    throw new Error('An error occured!');
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        A LOOTBOX is used to print fan tickets and reward them with prizes. You can customize your
        LOOTBOX with cool designs - each ticket is a collectible NFT. To learn more,{' '}
        <span>
          <a href="https://lootbox.fyi/3DyNQXz" target="_blank" rel="noreferrer">
            click here for a tutorial.
          </a>
        </span>
      </$InfoDescription>
    );
  };

  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Event', route: `/dashboard/events/id/${magicLinkParams.tournamentID}` },
    { title: 'Create Lootbox', route: `/dashboard/lootbox/create` },
  ];

  return (
    <div id="breadcrumbs" style={{ maxWidth: '1000px' }}>
      <BreadCrumbDynamic breadLine={breadLine} />
      {renderHelpText()}
      <div style={{ maxWidth: '1000px' }}>
        <CreateLootboxForm
          onSubmitCreate={createLootbox}
          mode="create"
          magicLinkParams={magicLinkParams}
        />
      </div>
    </div>
  );
};

export default LootboxCreatePage;
