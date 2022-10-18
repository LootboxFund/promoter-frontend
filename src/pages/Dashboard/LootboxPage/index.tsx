import type {
  ResponseError,
  QueryGetLootboxByIdArgs,
  MutationEditLootboxArgs,
} from '@/api/graphql/generated/types';
import { Button, Empty, Popconfirm } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useMemo, useState } from 'react';
import {
  GET_LOOTBOX,
  GetLootboxFE,
  LootboxFE,
  EDIT_LOOTBOX,
  EditLootboxResponseSuccessFE,
} from './api.gql';
import styles from './index.less';
import { useParams } from 'react-router-dom';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { $Horizontal, $InfoDescription } from '@/components/generics';
import CreateLootboxForm, { EditLootboxRequest } from '@/components/CreateLootboxForm';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
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
  const { lootboxID } = useParams();
  const [magicLinkParams, setMagicLinkParams] = useState<MagicLinkParams>(
    extractURLState_LootboxPage(),
  );
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const { currentAccount } = useWeb3();

  // VIEW Lootbox
  const { data, loading, error } = useQuery<
    { getLootboxByID: GetLootboxFE | ResponseError },
    QueryGetLootboxByIdArgs
  >(GET_LOOTBOX, {
    variables: { id: lootboxID || '' },
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

  const { depositERC20, depositNative } = useLootbox({ address: lootbox?.address });
  const { getAllowance, approveTokenAmount } = useERC20({
    chainIDHex: lootbox?.chainIdHex,
  });
  const editLootbox = async (payload: EditLootboxRequest) => {
    console.log('EDIT LOOTBOX', payload);

    if (!lootboxID) {
      throw new Error('No Lootbox ID');
    }
    if (payload.payload.maxTickets) {
      // TODO We need to update the web3 layer first
      console.error('MAX TICKETS not implemented!');
    }

    const res = await editLootboxMutation({
      variables: {
        payload: {
          lootboxID: lootboxID,
          name: payload.payload.name,
          description: payload.payload.description,
          joinCommunityUrl: payload.payload.joinCommunityUrl,
          logo: payload.payload.logoImage,
          // maxTickets: payload.payload.maxTickets,
          nftBountyValue: payload.payload.nftBountyValue,
          status: payload.payload.status,
          themeColor: payload.payload.themeColor,
          // symbol: payload.payload.symbol,
        },
      },
    });

    if (!res?.data || res?.data?.editLootbox?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.editLootbox?.error?.message || 'An error occured');
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

    if (!ethers.utils.isAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }

    const approvedAmount = await getAllowance(currentAccount, lootbox.address, tokenAddress);

    return approvedAmount.gte(amount);
  };

  const approveAllowance = async (payload: RewardSponsorsPayload): Promise<ContractTransaction> => {
    if (payload.rewardType === 'Native') {
      // Dont need to approve these
      throw new Error('Native tokens do not need approval');
    }

    if (!payload.tokenAddress || !ethers.utils.isAddress(payload.tokenAddress)) {
      throw new Error('Invalid token address');
    }

    if (!currentAccount) {
      throw new Error('Connect your Wallet');
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

  const maxWidth = '1000px';
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
            tag: lootbox.symbol,
            tournamentID: magicLinkParams.tournamentID as TournamentID | undefined,
            status: lootbox.status,
            address: lootbox.address,
            creatorAddress: lootbox.creatorAddress,
            chainIDHex: lootbox.chainIdHex,
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
      <DepositRewardForm
        chainIDHex={lootbox.chainIdHex}
        onSubmitReward={rewardSponsors}
        onTokenApprove={approveAllowance}
        onCheckAllowance={isWithinAllowance}
      />
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
