import {
  ListPotentialAirdropClaimersResponse,
  OfferAirdropPromoterView,
  PotentialAirdropClaimer,
  QueryListPotentialAirdropClaimersArgs,
} from '@/api/graphql/generated/types';
import { useQuery } from '@apollo/client';
import {
  Address,
  AdvertiserID,
  LootboxID,
  OfferID,
  TournamentID,
  UserID,
} from '@wormgraph/helpers';
import { Avatar, Button, Checkbox, Input, Modal, Select, Spin, Tag, Tooltip } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { useCallback, useMemo, useState } from 'react';
import { $Horizontal, $InfoDescription, $Vertical, $ColumnGap } from '../generics';
import { LIST_POTENTIAL_AIRDROP_CLAIMERS } from './index.gql';
import { ClaimRedemptionStatus } from '../../api/graphql/generated/types';
import { Link } from '@umijs/max';
import { manifest } from '@/manifest';
import { InfoCircleOutlined } from '@ant-design/icons';
import { uniq } from 'lodash';
import AirdropDeployModal from '../AirdropDeployModal';

export type AirdropControlPanelProps = {
  tournamentID: TournamentID;
  offerID: OfferID;
};

export type AirdropPotentialUserTableRow = {
  userID: UserID;
  username: string;
  avatar: string;
  tournamentID: TournamentID;
  advertiserID: AdvertiserID;
  offerID: OfferID;
  status: ClaimRedemptionStatus;
  lootboxID: LootboxID;
  lootboxAddress: Address;
  batchAlias: string;
};
enum AirdropAction {
  SendAirdrop = 'Send Airdrop',
}
const AirdropControlPanel: React.FC<AirdropControlPanelProps> = ({ tournamentID, offerID }) => {
  const [potentialClaimers, setPotentialClaimers] = useState<PotentialAirdropClaimer[]>([]);
  const [offer, setOffer] = useState<OfferAirdropPromoterView>();
  const [searchString, setSearchString] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserID[]>([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [airdropAction, setAirdropAction] = useState<AirdropAction>(AirdropAction.SendAirdrop);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, error } = useQuery<
    { listPotentialAirdropClaimers: ListPotentialAirdropClaimersResponse },
    QueryListPotentialAirdropClaimersArgs
  >(LIST_POTENTIAL_AIRDROP_CLAIMERS, {
    variables: {
      payload: {
        offerID,
        tournamentID,
      },
    },
    onCompleted: (data) => {
      if (
        data?.listPotentialAirdropClaimers.__typename ===
        'ListPotentialAirdropClaimersResponseSuccess'
      ) {
        const potentialClaimers = data.listPotentialAirdropClaimers.potentialClaimers;
        const offer = data.listPotentialAirdropClaimers.offer;

        setPotentialClaimers(potentialClaimers);
        setOffer(offer);
      }
    },
  });
  const renderColorForStatus = useCallback((status: ClaimRedemptionStatus) => {
    if (status === ClaimRedemptionStatus.Awaiting) {
      return <Tag color="gold">{status}</Tag>;
    }
    if (status === ClaimRedemptionStatus.Started) {
      return <Tag color="cyan">{status}</Tag>;
    }
    if (status === ClaimRedemptionStatus.InProgress) {
      return <Tag color="blue">{status}</Tag>;
    }
    if (status === ClaimRedemptionStatus.Answered) {
      return <Tag color="geekblue">{status}</Tag>;
    }
    if (status === ClaimRedemptionStatus.Rewarded) {
      return <Tag color="green">{status}</Tag>;
    }
    if (status === ClaimRedemptionStatus.Revoked) {
      return <Tag color="red">{status}</Tag>;
    }
    return null;
  }, []);
  const addRemoveUserToSelected = (userID: UserID, included: boolean) => {
    const listWithoutUser = selectedUsers.filter((user) => user !== userID);
    if (included) {
      setSelectedUsers([...listWithoutUser, userID]);
    } else {
      setSelectAllUsers(false);
      setSelectedUsers(listWithoutUser);
    }
  };
  const addRemoveAllUsersToSelected = (included: boolean) => {
    if (included) {
      setSelectAllUsers(true);
      setSelectedUsers(
        potentialClaimers.filter((u) => !u.status).map((user) => user.userID as UserID),
      );
    } else {
      setSelectAllUsers(false);
      setSelectedUsers([]);
    }
  };

  const uniqueBatches = uniq(potentialClaimers.map((c) => c.batchAlias));

  const columns: ColumnsType<AirdropPotentialUserTableRow> = useMemo(
    () => [
      {
        title: () => (
          <Checkbox
            checked={selectAllUsers}
            onChange={() => addRemoveAllUsersToSelected(!selectAllUsers)}
          />
        ),
        dataIndex: 'tokenSymbol',
        key: 'tokenSymbol',
        render: (_, record) =>
          record.status ? null : (
            <Checkbox
              checked={selectedUsers.includes(record.userID)}
              onClick={(e: any) => {
                addRemoveUserToSelected(record.userID, e.target.checked);
              }}
            />
          ),
      },
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        render: (amount: string, record) => {
          return (
            <$Horizontal>
              <Avatar src={record.avatar} size="small" style={{ marginRight: '10px' }} />
              <span>{record.username}</span>
            </$Horizontal>
          );
        },
      },
      {
        title: () => (
          <Tooltip
            title={
              <$Vertical>
                <p>{'No Status  = User has no received any airdrop ticket or reward yet'}</p>
                <p>
                  {'Awaiting   = User has received airdropped ticket but has not clicked it yet'}
                </p>
                <p>
                  {
                    'Started    = User has seen the airdrop and may or may not have read the instructions'
                  }
                </p>
                <p>
                  {
                    'InProgress = User has viewed the airdrop claim instructions and is in-progress of doing your tasks or answering your questions'
                  }
                </p>
                <p>
                  {
                    'Answered  = User has answered all your airdrop questions, but has not yet redeemed their airdrop reward'
                  }
                </p>
                <p>{'Rewarded  = User has fully claimed their airdrop reward'}</p>
                <p>
                  {'Revoked    = User had their airdrop revoked and their ticket no longer works'}
                </p>
              </$Vertical>
            }
          >
            <InfoCircleOutlined />
            <span style={{ marginLeft: '10px' }}>Status</span>
          </Tooltip>
        ),
        dataIndex: 'status',
        key: 'status',
        filterMode: 'menu',
        filters: [
          {
            text: `None (${potentialClaimers.filter((u) => !u.status).length})`,
            value: '',
          },
          ...Object.keys(ClaimRedemptionStatus).map((key) => ({
            text: `${ClaimRedemptionStatus[key]} (${
              potentialClaimers.filter((u) => u.status === ClaimRedemptionStatus[key]).length
            })`,
            value: ClaimRedemptionStatus[key],
          })),
        ],
        onFilter: (value: any, record) => {
          if (!value) return !record.status;
          return record.status === value;
        },
        render: (_value: any, record) => {
          if (record.status) {
            return renderColorForStatus(record.status);
          }
          return null;
        },
      },
      {
        title: 'Batch',
        dataIndex: 'batch',
        key: 'batch',
        filterMode: 'menu',
        filters: uniqueBatches
          .filter((b) => b)
          .map((b: any) => ({
            text: b,
            value: b,
          })),
        onFilter: (value: any, record) => {
          return record.batchAlias === value;
        },
        render: (_, record) => {
          if (record.lootboxID && record.batchAlias) {
            return (
              <Link
                key={`${record.lootboxID}-${record.userID}`}
                to={`/dashboard/lootbox/id/${record.lootboxID}?tid=${tournamentID}`}
                target="_blank"
              >
                {record.batchAlias}
              </Link>
            );
          }
          return null;
        },
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (_value: any, record) => {
          return (
            <Button
              href={`${manifest.microfrontends.webflow.publicProfile}?uid=${record.userID}`}
              target="_blank"
            >
              View Profile
            </Button>
          );
        },
      },
    ],
    [selectedUsers, uniqueBatches],
  );

  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listPotentialAirdropClaimers.__typename === 'ResponseError') {
    return <span>{data?.listPotentialAirdropClaimers.error?.message || ''}</span>;
  }

  const filterBySearchString = (potentialClaimer: PotentialAirdropClaimer) => {
    return (
      potentialClaimer.userID.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      potentialClaimer.username.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };
  const matchingUsers = potentialClaimers.filter(filterBySearchString);
  if (loading) {
    return (
      <div style={{ width: '100%', padding: '5px', height: '200px' }}>
        <$Horizontal
          justifyContent="center"
          verticalCenter
          style={{ width: '100%', height: '100%' }}
        >
          <Spin />
        </$Horizontal>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '5px' }}>
      <$Horizontal justifyContent="space-between">
        <$Vertical>
          <span style={{ color: 'gray', fontWeight: 600 }}>Airdrop</span>
          <h2>{offer?.title}</h2>
          <$InfoDescription fontSize={'0.9rem'}>
            {
              'Airdrop rewards to fans who have claimed tickets from your event. Only showing users deemed eligible by the advertiser. '
            }
            <a href="https://google.com" target="_blank" rel="noreferrer">
              View Tutorial
            </a>
          </$InfoDescription>
        </$Vertical>
        <Button disabled>{`Download CSV (coming soon)`}</Button>
      </$Horizontal>
      <$Vertical>
        <$Horizontal justifyContent="space-between">
          <$Horizontal justifyContent="flex-start">
            <Input.Search
              placeholder="Filter Users"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <$ColumnGap />
            <span
              style={{ color: 'gray' }}
            >{`Selected ${selectedUsers.length} of ${matchingUsers.length} Filtered`}</span>
          </$Horizontal>
          <$Horizontal justifyContent="flex-end">
            <Select
              defaultValue={airdropAction}
              style={{ width: 200 }}
              onChange={(v: AirdropAction) => setAirdropAction(v)}
              options={[
                {
                  value: AirdropAction.SendAirdrop,
                  label: 'Send Airdrop',
                },
              ]}
            />
            <Button
              type="primary"
              onClick={() => setIsModalOpen(true)}
              disabled={selectedUsers.length === 0}
              style={{ width: '150px' }}
            >
              Execute
            </Button>
          </$Horizontal>
        </$Horizontal>
        <br />
        <Table
          // @ts-ignore
          columns={columns}
          dataSource={matchingUsers
            .sort((a, b) => (a.status ? 1 : -1))
            .map((potentialClaimer) => {
              return {
                userID: potentialClaimer.userID,
                username: potentialClaimer.username,
                avatar: potentialClaimer.avatar,
                tournamentID: potentialClaimer.tournamentID,
                advertiserID: potentialClaimer.advertiserID,
                offerID: potentialClaimer.offerID,
                status: potentialClaimer.status,
                lootboxID: potentialClaimer.lootboxID,
                lootboxAddress: potentialClaimer.lootboxAddress,
                batchAlias: potentialClaimer.batchAlias,
              };
            })}
        />
      </$Vertical>
      {offer && offer.airdropMetadata && (
        <Modal
          title="Deploy an Airdrop Batch"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>,
          ]}
          bodyStyle={{
            maxWidth: '900px',
            padding: '40px',
          }}
          width="900px"
        >
          <AirdropDeployModal
            offerID={offerID}
            tournamentID={tournamentID}
            title={offer.title || ''}
            oneLiner={offer.airdropMetadata.oneLiner || ''}
            value={offer.airdropMetadata?.value || ''}
            instructionsLink={offer.airdropMetadata.instructionsLink || ''}
            batchNumber={(offer.airdropMetadata.batchCount || 0) + 1}
            toggleModal={(bool: boolean) => setIsModalOpen(bool)}
            selectedClaimers={selectedUsers}
            lootboxTemplateStamp={offer.airdropMetadata.lootboxTemplateStamp}
            exitClear={() => {
              setIsModalOpen(false);
              setSelectedUsers([]);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default AirdropControlPanel;
