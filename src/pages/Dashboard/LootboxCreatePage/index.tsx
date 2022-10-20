import CreateLootboxForm, { CreateLootboxRequest } from '@/components/CreateLootboxForm';
import { $InfoDescription } from '@/components/generics';
import { Address, LootboxID, TournamentID } from '@wormgraph/helpers';
import React, { useRef, useState } from 'react';
import { manifest } from '@/manifest';
import { useLootboxFactory } from '@/hooks/useLootboxFactory';
import { startLootboxCreatedListener } from '@/api/firebase/functions';
import useWeb3 from '@/hooks/useWeb3';
import { generateCreateLootboxNonce } from '@/lib/lootbox';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { ContractTransaction } from 'ethers';
import { useLazyQuery } from '@apollo/client';
import {
  MyLootboxByNonceResponseSuccessFE,
  MY_LOOTBOX_BY_NONCE,
  MyLootboxByNonceResponseFE,
} from './api.gql';
import { QueryMyLootboxByNonceArgs } from '@/api/graphql/generated/types';
import { notification, Spin } from 'antd';

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
  const isPolling = useRef<boolean>(false);
  const lootboxID = useRef<LootboxID | null>(null);

  const [geMyLootboxByNonce, { startPolling, stopPolling }] = useLazyQuery<
    MyLootboxByNonceResponseFE,
    QueryMyLootboxByNonceArgs
  >(MY_LOOTBOX_BY_NONCE, {
    onCompleted: (data) => {
      const createdLootbox = (data?.myLootboxByNonce as MyLootboxByNonceResponseSuccessFE)?.lootbox;
      if (createdLootbox) {
        if (isPolling && createdLootbox) {
          stopPolling();
          lootboxID.current = createdLootbox.id;
          isPolling.current = false;
        }
      }
    },
  });

  const createLootbox = async (
    request: CreateLootboxRequest,
  ): Promise<{ tx: ContractTransaction; lootboxID: LootboxID }> => {
    const awaitLootboxCreated = async (nonce: string) => {
      console.log('awaiting lootbox created', nonce);
      geMyLootboxByNonce({ variables: { nonce } });
      isPolling.current = true;
      startPolling(3000);
      const isDone: boolean = await new Promise(async (res, rej) => {
        const timer = setTimeout(() => {
          res(false);
        }, 1000 * 60 * 8); // 8 minute timeout
        while (isPolling.current) {
          await new Promise((resolve, reject) =>
            setTimeout(() => {
              resolve(null);
            }, 2000),
          );
        }
        clearInterval(timer);
        res(true);
      });

      if (!isDone) {
        throw new Error(
          `Timed out waiting for Lootbox to be created. Please check back later for your newly created LOOTBOX. Don't worry! Your Lootbox should be ready soon. `,
        );
      }
      return true;
    };

    const chain = network?.chainId
      ? manifest.chains.find((chain) => chain.chainIdDecimal === `${network?.chainId}`)
      : undefined;

    if (!lootboxFactory || !library?.provider || !chain) {
      throw new Error('No lootbox factory');
    }

    const nonce = generateCreateLootboxNonce(); // Used to find the event in the backend

    const blockNum = await library.getBlockNumber();

    console.log('block num', blockNum);
    console.log(`

      request.payload.name = ${request.payload.name}
      request.payload.name.slice(0, 11) = ${request.payload.name.slice(0, 11)}
      request.payload.maxTickets = ${request.payload.maxTickets}
      nonce = ${nonce}

      `);

    notification.info({
      key: 'metamask',
      message: 'Confirm the transaction in Metamask',
      description: 'Please confirm the transaction in your Metamask wallet',
      placement: 'top',
      duration: null,
    });

    const res: ContractTransaction = await lootboxFactory.createLootbox(
      request.payload.name,
      request.payload.name.slice(0, 11),
      request.payload.maxTickets,
      nonce,
    );

    notification.close('metamask');

    notification.open({
      key: 'pending-creation',
      message: 'Generating your Lootbox...',
      description: 'Please be patient, this may take up to 1 minute.',
      placement: 'top',
      icon: <Spin />,
      duration: null,
    });

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

    const wasSuccess = await awaitLootboxCreated(nonce);
    console.log('Found lootbox with ID', lootboxID.current);

    notification.close('pending-creation');

    if (!wasSuccess || !lootboxID.current) {
      throw new Error('Failed to create lootbox');
    }

    return { tx: res, lootboxID: lootboxID.current };
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
