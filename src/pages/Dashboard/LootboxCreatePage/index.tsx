import CreateLootboxForm, { CreateLootboxRequest } from '@/components/CreateLootboxForm';
import { $InfoDescription } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { Address, TournamentID } from '@wormgraph/helpers';
import React, { useState } from 'react';
import { manifest } from '@/manifest';
import { useLootboxFactory } from '@/hooks/useLootboxFactory';
import { startLootboxCreatedListener } from '@/api/firebase/functions';
import useWeb3 from '@/hooks/useWeb3';
import { generateCreateLootboxNonce } from '@/lib/lootbox';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';

interface MagicLinkParams {
  tournamentID?: TournamentID;
}

export const extractURLState_LootboxCreatePage = (): MagicLinkParams => {
  const url = new URL(window.location.href);

  const params: MagicLinkParams = {
    tournamentID: url.searchParams.get('tid') as TournamentID | undefined,
  };

  return params;
};

const LootboxCreatePage: React.FC = () => {
  // const { chainId } = useAccount();
  const { library, network } = useWeb3();
  const { lootboxFactory } = useLootboxFactory();
  const [magicLinkParams, setMagicLinkParams] = useState<MagicLinkParams>(
    extractURLState_LootboxCreatePage(),
  );

  const createLootbox = async (request: CreateLootboxRequest) => {
    console.log('create lootbox', request);
    console.log('factory', lootboxFactory);

    const chain = network?.chainId
      ? manifest.chains.find((chain) => chain.chainIdDecimal === `${network?.chainId}`)
      : undefined;

    if (!lootboxFactory || !library?.provider || !chain) {
      return;
    }

    const nonce = generateCreateLootboxNonce(); // Used to find the event in the backend

    try {
      const blockNum = await library.getBlockNumber();

      console.log('block num', blockNum);
      console.log(`

      request.payload.name = ${request.payload.name}
      request.payload.name.slice(0, 11) = ${request.payload.name.slice(0, 11)}
      request.payload.maxTickets = ${request.payload.maxTickets}
      nonce = ${nonce}

      `);
      const res = await lootboxFactory.createLootbox(
        request.payload.name,
        request.payload.name.slice(0, 11),
        request.payload.maxTickets,
        nonce,
      );
      console.log('res', res);
      // Start the indexer

      startLootboxCreatedListener({
        listenAddress: lootboxFactory.address as Address,
        fromBlock: blockNum,
        chainIdHex: chain.chainIdHex,
        payload: {
          /** Used to find the correct lootbox */
          nonce: nonce,
          lootboxDescription: request.payload.description,
          backgroundImage: request.payload.backgroundImage,
          logoImage: request.payload.logoImage,
          themeColor: request.payload.themeColor,
          nftBountyValue: request.payload.nftBountyValue,
          joinCommunityUrl: request.payload.joinCommunityUrl,
          symbol: request.payload.tag,
          tournamentID: magicLinkParams.tournamentID,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        A LOOTBOX is used to print fan tickets and reward them with prizes. You can customize your
        LOOTBOX with cool designs - each ticket is a collectible NFT. To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
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
        <CreateLootboxForm onSubmitCreate={createLootbox} mode="create" />
      </div>
    </div>
  );
};

export default LootboxCreatePage;
