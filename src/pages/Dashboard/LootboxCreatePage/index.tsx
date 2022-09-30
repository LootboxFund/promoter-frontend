import type {
  AffiliatePublicViewResponse,
  CreateTournamentPayload,
  CreateTournamentResponseSuccess,
  MutationCreateTournamentArgs,
  QueryAffiliatePublicViewArgs,
  ResponseError,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import CreateLootboxForm, {
  CreateLootboxFormProps,
  CreateLootboxRequest,
} from '@/components/CreateLootboxForm';
import { $InfoDescription } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import { Address, AffiliateID } from '@wormgraph/helpers';
import { history, Link } from '@umijs/max';
import Spin from 'antd/lib/spin';
import React, { useCallback } from 'react';
// import { useAccount, useContract, useSigner } from '@web3modal/react';
import { manifest } from '@/manifest';
import { useLootboxFactory } from '@/hooks/useLootboxFactory';
import { startLootboxCreatedListener } from '@/api/firebase/functions';
import useWeb3 from '@/hooks/useWeb3';
import { generateCreateLootboxNonce } from '@/lib/lootbox';
// import { useLootboxFactory } from '@/hooks/useLootboxFactory';
// import { CREATE_TOURNAMENT } from './api.gql';

const LootboxCreatePage: React.FC = () => {
  // const { chainId } = useAccount();
  const { library, network } = useWeb3();
  const { lootboxFactory } = useLootboxFactory();
  // const { signer } = useSigner();

  // console.log('signer', signer);

  // console.log('outer contract', contract);

  // const createLootbox = useCallback(
  //   async (payload: CreateLootboxRequest) => {
  //     console.log('create lootbox', payload, chainId);

  //     console.log('factory', contract);

  //     if (!contract || !signer) {
  //       return;
  //     }

  //     console.log('creating lootbox');
  //     try {
  //       const res = await contract.connect(signer).createLootbox();
  //       console.log('res', res);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   },
  //   [contract, signer, useSigner, useLootboxFactory],
  // );

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
      const res = await lootboxFactory.createLootbox(
        request.payload.name,
        request.payload.tag,
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
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // const { affiliateUser } = useAffiliateUser();
  // const { id: affiliateID } = affiliateUser;
  //   const [createTournamentMutation] = useMutation<
  //     { createTournament: ResponseError | CreateTournamentResponseSuccess },
  //     MutationCreateTournamentArgs
  //   >(CREATE_TOURNAMENT, {
  //     refetchQueries: [{ query: VIEW_TOURNAMENTS_AS_ORGANIZER, variables: { affiliateID } }],
  //   });

  // const createLootbox = async (payload: CreateLootboxRequest) => {
  //   console.log('create lootbox', payload, chainId);

  //   console.log('factory', contract);

  //   if (!contract) {
  //     return;
  //   }

  //   console.log('creating lootbox');
  //   try {
  //     await contract.createLootbox();
  //   } catch (err) {
  //     console.error(err);
  //   }

  //   // Start the blockchain transaction
  //   // const {} = useContract({
  //   //   address: manifest,
  //   // });
  //   // const lootboxFactory = use;

  //   // Start the backend event listener

  //   // const res = await createTournamentMutation({
  //   //   variables: {
  //   //     payload: {
  //   //       title: payload.title || 'Untitled Tournament',
  //   //       description: payload.description,
  //   //       tournamentLink: payload.tournamentLink || '',
  //   //       coverPhoto: payload.coverPhoto || '',
  //   //       prize: payload.prize || '',
  //   //       tournamentDate: payload.tournamentDate,
  //   //       communityURL: payload.communityURL || '',
  //   //       organizer: affiliateID,
  //   //     },
  //   //   },
  //   // });
  //   // if (!res?.data || res?.data?.createTournament?.__typename === 'ResponseError') {
  //   //   // @ts-ignore
  //   //   throw new Error(res?.data?.createTournament?.error?.message || words.anErrorOccured);
  //   // }
  //   // if (res?.data?.createTournament?.__typename === 'CreateTournamentResponseSuccess') {
  //   //   history.push(`/dashboard/events/id/${res?.data?.createTournament?.tournament?.id}`);
  //   // }
  // };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </$InfoDescription>
    );
  };

  return (
    <PageContainer>
      {renderHelpText()}
      <div style={{ maxWidth: '800px' }}>
        <CreateLootboxForm onSubmitCreate={createLootbox} mode="create" />
      </div>
    </PageContainer>
  );
};

export default LootboxCreatePage;
