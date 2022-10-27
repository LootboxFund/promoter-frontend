import type {
  ResponseError,
  QueryGetLootboxByIdArgs,
  MutationEditLootboxArgs,
  QueryMyLootboxByNonceArgs,
} from '@/api/graphql/generated/types';
import { Button, Empty, Popconfirm, notification, Spin, Tooltip } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import React, { useMemo, useRef, useState } from 'react';
import {
  GET_LOOTBOX,
  GetLootboxFE,
  LootboxFE,
  EDIT_LOOTBOX,
  EditLootboxResponseSuccessFE,
  MyLootboxByNonceResponseSuccessFE,
  MY_LOOTBOX_BY_NONCE,
  MyLootboxByNonceResponseFE,
} from './api.gql';
import styles from './index.less';
import { useParams } from 'react-router-dom';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { $Horizontal, $InfoDescription } from '@/components/generics';
import CreateLootboxForm, { EditLootboxRequest } from '@/components/CreateLootboxForm';
import { Address, ChainIDHex, LootboxID, TournamentID } from '@wormgraph/helpers';
import GenerateReferralModal from '@/components/GenerateReferralModal';
import { Link } from '@umijs/max';
import DepositRewardForm, {
  CheckAllowancePayload,
  RewardSponsorsPayload,
} from '@/components/DepositRewardForm';
import { useLootbox } from '@/hooks/useLootbox';
import { ContractTransaction, ethers } from 'ethers';
import useERC20 from '@/hooks/useERC20';
import useWeb3 from '@/hooks/useWeb3';
import { manifest } from '@/manifest';
import { useAuth } from '@/api/firebase/useAuth';
import { startLootboxCreatedListener } from '@/api/firebase/functions';
import { generateCreateLootboxNonce } from '@/lib/lootbox';
import { useLootboxFactory } from '@/hooks/useLootboxFactory';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { shortenAddress } from '@/lib/address';

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
  const { user } = useAuth();
  const { lootboxID } = useParams();
  const [magicLinkParams, setMagicLinkParams] = useState<MagicLinkParams>(
    extractURLState_LootboxPage(),
  );
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const { currentAccount, library, network } = useWeb3();
  const { lootboxFactory } = useLootboxFactory();

  const isPolling = useRef<boolean>(false);
  const polledLootboxID = useRef<LootboxID | null>(null);

  // VIEW Lootbox
  const {
    data,
    loading,
    error,
    refetch: refetchLootboxQuery,
  } = useQuery<{ getLootboxByID: GetLootboxFE | ResponseError }, QueryGetLootboxByIdArgs>(
    GET_LOOTBOX,
    {
      variables: { id: lootboxID || '' },
    },
  );

  // Polling for Lootbox
  const [geMyLootboxByNonce, { startPolling, stopPolling }] = useLazyQuery<
    MyLootboxByNonceResponseFE,
    QueryMyLootboxByNonceArgs
  >(MY_LOOTBOX_BY_NONCE, {
    onCompleted: (data) => {
      const createdLootbox = (data?.myLootboxByNonce as MyLootboxByNonceResponseSuccessFE)?.lootbox;
      if (
        isPolling &&
        createdLootbox &&
        createdLootbox.id === lootboxID &&
        !!createdLootbox.address
      ) {
        console.log('stop polling');
        stopPolling();
        polledLootboxID.current = createdLootbox.id;
        isPolling.current = false;
      }
    },
  });

  // EDIT Lootbox
  const [editLootboxMutation] = useMutation<
    { editLootbox: ResponseError | EditLootboxResponseSuccessFE },
    MutationEditLootboxArgs
  >(EDIT_LOOTBOX, {
    refetchQueries: [{ query: GET_LOOTBOX, variables: { id: lootboxID } }],
  });

  const lootbox: LootboxFE | undefined = useMemo(() => {
    return (data?.getLootboxByID as GetLootboxFE)?.lootbox;
  }, [data]);

  const { depositERC20, depositNative, changeMaxTickets } = useLootbox({
    address: lootbox?.address || undefined,
  });
  const { getAllowance, approveTokenAmount } = useERC20({
    chainIDHex: lootbox?.chainIdHex || undefined,
  });
  const editLootbox = async ({ payload }: EditLootboxRequest) => {
    if (!lootboxID) {
      throw new Error('No Lootbox ID');
    }

    if (payload.maxTickets && lootbox.address) {
      try {
        // The only person who can change MaxTickets is the one with the DAO role
        // Typically, the DAO_ROLE is the issuing entity
        if (
          lootbox?.creatorAddress &&
          currentAccount &&
          lootbox.creatorAddress.toLowerCase() !== currentAccount.toLowerCase()
        ) {
          throw new Error(
            `Only the wallet of the LOOTBOX creator can change the Max Tickets. Try switching to address ${shortenAddress(
              lootbox.creatorAddress,
            )}.`,
          );
        }

        // MaxTickets lives on the web3 & web2 layer
        // First we will update the contract because thats the most brittle lol
        notification.info({
          key: 'max-tix-metamask',
          message: 'Complete the transaction in MetaMask',
          description:
            'Please complete this transaction in your wallet. Updating LOOTBOX max tickets changes the Blockchain and requires a small fee that LOOTBOX does not control or receive.',
          duration: 0,
          placement: 'top',
        });
        const tx = await changeMaxTickets(payload.maxTickets);
        notification.close('max-tix-metamask');
        notification.info({
          key: 'loading-change-max-tickets',
          icon: <Spin />,
          message: 'Changing Max Tickets',
          description:
            'Please wait while we change your LOOTBOX Max Tickets. This happens on the blockchain and it might take a minute.',
          duration: 0,
          placement: 'top',
        });
        await tx.wait();
        notification.close('loading-change-max-tickets');
        notification.success({
          key: 'max-tix-success',
          message: 'Max Tickets Successfully changed on the Blockchain',
        });
      } catch (err) {
        notification.close('max-tix-metamask');
        notification.close('loading-change-max-tickets');
        throw err;
      }
    }

    const res = await editLootboxMutation({
      variables: {
        payload: {
          lootboxID: lootboxID,
          name: payload.name,
          description: payload.description,
          joinCommunityUrl: payload.joinCommunityUrl,
          logo: payload.logoImage,
          backgroundImage: payload.backgroundImage,
          maxTickets: payload.maxTickets,
          nftBountyValue: payload.nftBountyValue,
          status: payload.status,
          themeColor: payload.themeColor,
        },
      },
    });

    if (!res?.data || res?.data?.editLootbox?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.editLootbox?.error?.message || 'An error occured');
    }
  };

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

  const createLootboxWeb3 = async (payload: {
    chainIDHex: ChainIDHex;
    name: string;
    maxTickets: number;
  }): Promise<{ tx: ContractTransaction; lootboxID: LootboxID }> => {
    if (!lootboxID) {
      throw new Error('No Lootbox ID');
    }

    const currentChain = network?.chainId
      ? manifest.chains.find((chain) => chain.chainIdDecimal === `${network?.chainId}`)
      : undefined;

    const targetChain = payload?.chainIDHex
      ? manifest.chains.find((chain) => chain.chainIdHex === payload.chainIDHex)
      : undefined;

    if (!lootboxFactory || !library?.provider) {
      throw new Error('No lootbox factory');
    }

    if (
      !currentChain ||
      !currentChain.chainIdHex ||
      !payload.chainIDHex ||
      !targetChain ||
      currentChain.chainIdHex !== payload.chainIDHex
    ) {
      throw new Error(
        `Wrong network${
          targetChain?.chainName ? `. Please switch to ${targetChain.chainName}` : ''
        }`,
      );
    }

    try {
      const nonce = generateCreateLootboxNonce(); // Used to find the event in the backend

      const blockNum = await library.getBlockNumber();

      console.log(`
  
        request.payload.name = ${payload.name}
        request.payload.name.slice(0, 11) = ${payload.name.slice(0, 11)}
        request.payload.maxTickets = ${payload.maxTickets}
  
        `);

      notification.info({
        key: 'metamask',
        message: 'Confirm the transaction in Metamask',
        description: 'Please confirm the transaction in your Metamask wallet',
        placement: 'top',
        duration: null,
      });

      const res: ContractTransaction = await lootboxFactory.createLootbox(
        payload.name,
        payload.name.slice(0, 11),
        payload.maxTickets,
        lootboxID,
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
        chainIdHex: targetChain.chainIdHex,
        payload: {
          /** Used to find the correct lootbox */
          nonce: nonce,
          lootboxID: lootboxID as LootboxID,
          symbol: payload.name.slice(0, 11),
        },
      });

      const wasSuccess = await awaitLootboxCreated(nonce);

      notification.close('pending-creation');

      if (!wasSuccess || !polledLootboxID.current) {
        throw new Error('Failed to create lootbox');
      }

      refetchLootboxQuery();

      return { tx: res, lootboxID: polledLootboxID.current };
    } catch (err) {
      notification.close('metamask');
      notification.close('pending-creation');

      throw err;
    }
  };

  const renderDepositHelpText = () => {
    return (
      <$InfoDescription>
        Reward your sponsors by depositing native or ERC20 tokens back into this Lootbox. Rewards
        can only be redeemed if they own an NFT ticket minted from your Lootbox.
      </$InfoDescription>
    );
  };

  const rewardSponsors = async (payload: RewardSponsorsPayload): Promise<ContractTransaction> => {
    let tx: ContractTransaction;
    if (payload.rewardType === 'Native') {
      // Do transaction
      tx = await depositNative(payload.amount);
    } else {
      // ERC20
      if (!payload.tokenAddress || !ethers.utils.isAddress(payload.tokenAddress)) {
        throw new Error('Invalid token address');
      }
      tx = await depositERC20(payload.amount, payload.tokenAddress);
    }
    return tx;
  };

  const isWithinAllowance = async ({
    amount,
    tokenAddress,
  }: CheckAllowancePayload): Promise<boolean> => {
    if (!currentAccount) {
      throw new Error('Connect your Wallet');
    }

    if (!lootbox.address) {
      throw new Error('Lootbox has not been deployed to the Blockchain yet');
    }

    if (!ethers.utils.isAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }

    const approvedAmount = await getAllowance(currentAccount, lootbox.address, tokenAddress);

    return approvedAmount.gte(amount);
  };

  const approveAllowance = async (payload: RewardSponsorsPayload): Promise<ContractTransaction> => {
    if (!currentAccount) {
      throw new Error('Connect your Wallet');
    }

    if (!lootbox.address) {
      throw new Error('Lootbox has not been deployed to the Blockchain yet');
    }

    if (payload.rewardType === 'Native') {
      // Dont need to approve these
      throw new Error('Native tokens do not need approval');
    }

    if (!payload.tokenAddress || !ethers.utils.isAddress(payload.tokenAddress)) {
      throw new Error('Invalid token address');
    }

    const tx = await approveTokenAmount(
      currentAccount,
      lootbox.address,
      payload.tokenAddress,
      payload.amount,
    );
    return tx;
  };

  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Event', route: `/dashboard/events/id/${magicLinkParams.tournamentID}` },
    { title: lootbox?.name || '', route: `/dashboard/lootbox/id/${lootboxID}` },
  ];

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`This is the Lootbox Control Panel for ${lootbox.name}. You can invite team members, invite fans, generate marketing graphics, deposit rewards and view analytics.`}{' '}
        To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };

  if (loading) {
    return <PageContainer ghost loading />;
  } else if (error || !data?.getLootboxByID) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.getLootboxByID.__typename === 'ResponseError') {
    return <span>{data?.getLootboxByID?.error?.message || ''}</span>;
  }

  const maxWidth = '1000px';
  const doesUserHaveEditPermission = user?.id && lootbox.creatorID === user.id;

  return (
    <div style={{ maxWidth }}>
      <BreadCrumbDynamic breadLine={breadLine} />
      <$Horizontal justifyContent="space-between">
        <h1>{lootbox.name}</h1>
        <a
          href={`${manifest.microfrontends.webflow.cosmicLootboxPage}?lid=${lootboxID}`}
          target="_blank"
          rel="noreferrer"
        >
          <Button type="primary">View Public Page</Button>
        </a>
      </$Horizontal>
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
            tag: lootbox.symbol || lootbox.name.slice(0, 11),
            tournamentID: magicLinkParams.tournamentID as TournamentID | undefined,
            status: lootbox.status,
            address: lootbox.address,
            creatorAddress: lootbox.creatorAddress,
            chainIDHex: lootbox.chainIdHex,
            runningCompletedClaims: lootbox.runningCompletedClaims,
          }}
          mode={doesUserHaveEditPermission ? 'view-edit' : 'view-only'}
          onSubmitEdit={editLootbox}
          onCreateWeb3={createLootboxWeb3}
        />
      </div>
      <br />
      <br />
      <$Horizontal justifyContent="space-between">
        <h2 id="team-members">Team Members</h2>
        <Popconfirm
          title="Invite a team member to this LOOTBOX by sending them a magic invite link. They will automatically be onboarded by clicking the link."
          onConfirm={() => console.log('confirm')}
          okText="Copy Invite Link"
        >
          <Button type="primary">Invite Team Member</Button>
        </Popconfirm>
      </$Horizontal>
      <$InfoDescription maxWidth={maxWidth}>
        The team captain is responsible for inviting team members to their Lootbox.
      </$InfoDescription>
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
        <Popconfirm
          title="Invite a team member to this LOOTBOX by sending them a magic invite link. They will automatically be onboarded by clicking the link."
          onConfirm={() => console.log('confirm')}
          okText="Copy Invite Link"
        >
          <Button>Invite Member</Button>
        </Popconfirm>
      </Empty>
      <br />
      <br />
      <$Horizontal justifyContent="space-between">
        <h2 id="team-members">Ticket Analytics</h2>
        <$Horizontal justifyContent="space-between">
          <Link to={`/dashboard/stamp/lootbox/id/${lootboxID}?tid=${magicLinkParams.tournamentID}`}>
            <Button style={{ marginRight: '5px' }}>Generate Stamp</Button>
          </Link>
          <Button type="primary" onClick={() => setIsReferralModalOpen(true)}>
            Invite Fans
          </Button>
        </$Horizontal>
      </$Horizontal>
      <$InfoDescription maxWidth={maxWidth}>
        View who helped distribute tickets for this team.
      </$InfoDescription>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Analytics Coming Soon"
        style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
      />
      <br />
      <br />
      <$Horizontal justifyContent="space-between">
        <h2 id="team-members">Payout Rewards</h2>
        {/* <Button type="primary">Deposit Payout</Button> */}
      </$Horizontal>
      <br />
      {renderDepositHelpText()}
      {!lootbox.address || !lootbox.chainIdHex ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          imageStyle={{
            height: 60,
          }}
          description={
            <span style={{ maxWidth: '200px' }}>
              {`This LOOTBOX has not been deployed to the blockchain yet`}
              &nbsp;
              <Tooltip title="This Lootbox can not pay out rewards to fans until it is deployed on the Blockchain. To deploy this Lootbox, you must install MetaMask and connect your wallet by clicking below.">
                <InfoCircleTwoTone />
              </Tooltip>
            </span>
          }
          style={{
            flex: 1,
            padding: '100px',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        ></Empty>
      ) : (
        <DepositRewardForm
          chainIDHex={lootbox.chainIdHex}
          onSubmitReward={rewardSponsors}
          onTokenApprove={approveAllowance}
          onCheckAllowance={isWithinAllowance}
          lootboxID={(lootboxID || '') as LootboxID}
        />
      )}

      <GenerateReferralModal
        isOpen={isReferralModalOpen}
        setIsOpen={setIsReferralModalOpen}
        lootboxID={(lootboxID || '') as LootboxID}
        tournamentID={(magicLinkParams.tournamentID || '') as TournamentID}
      />
    </div>
  );
};

export default LootboxPage;
