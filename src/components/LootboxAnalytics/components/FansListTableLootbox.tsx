import {
  FanListRowForLootbox,
  FanListRowForTournament,
  FansListForTournamentResponse,
  QueryClaimerStatsForTournamentArgs,
  QueryFansListForTournamentArgs,
} from '@/api/graphql/generated/types';
import enUS from 'antd/es/locale/en_US';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID, UserID } from '@wormgraph/helpers';
import { Avatar, Button, Checkbox, Input, Result, Spin, Tag, Tooltip } from 'antd';
import { FANS_LIST_FOR_LOOTBOX } from '../api.gql';
import { truncateUID } from '@/lib/string';
import { convertClaimTypeForLegend } from '@/lib/graph';
import { useMemo, useState } from 'react';
import Table, { ColumnsType } from 'antd/lib/table';
import { $ColumnGap, $Horizontal, $InfoDescription } from '@/components/generics';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import moment from 'moment';
import { manifest } from '@/manifest';
import {
  FansListForLootboxResponse,
  QueryFansListForLootboxArgs,
} from '../../../api/graphql/generated/types';

interface FansListTableLootboxProps {
  lootboxID: LootboxID;
}

const FansListTableLootbox: React.FC<FansListTableLootboxProps> = ({ lootboxID }) => {
  const { data, loading, error } = useQuery<
    { fansListForLootbox: FansListForLootboxResponse },
    QueryFansListForLootboxArgs
  >(FANS_LIST_FOR_LOOTBOX, {
    variables: {
      lootboxID: lootboxID,
    },
  });
  const fans = useMemo(() => {
    if (
      data?.fansListForLootbox &&
      data?.fansListForLootbox.__typename === 'FansListForLootboxResponseSuccess'
    ) {
      const allFans = data?.fansListForLootbox.fans;
      const sortedFans = allFans.slice().sort((a, b) => b.joinedDate - a.joinedDate);
      return sortedFans;
    }
    return [];
  }, [data?.fansListForLootbox]);
  const [searchString, setSearchString] = useState('');
  // const [selectedUsers, setSelectedUsers] = useState<UserID[]>([]);
  // const [selectAllUsers, setSelectAllUsers] = useState(false);
  // const addRemoveUserToSelected = (userID: UserID, included: boolean) => {
  //   const listWithoutUser = selectedUsers.filter((user) => user !== userID);
  //   if (included) {
  //     setSelectedUsers([...listWithoutUser, userID]);
  //   } else {
  //     setSelectAllUsers(false);
  //     setSelectedUsers(listWithoutUser);
  //   }
  // };
  // const addRemoveAllUsersToSelected = (included: boolean) => {
  //   if (included) {
  //     setSelectAllUsers(true);
  //     setSelectedUsers(
  //       potentialClaimers.filter((u) => !u.status).map((user) => user.userID as UserID),
  //     );
  //   } else {
  //     setSelectAllUsers(false);
  //     setSelectedUsers([]);
  //   }
  // };

  const columns: ColumnsType<FanListRowForTournament> = useMemo(
    () => [
      // {
      //   title: () => (
      //     <Checkbox checked={selectAllUsers} onChange={() => console.log('select all users')} />
      //   ),
      //   dataIndex: 'tokenSymbol',
      //   key: 'tokenSymbol',
      //   render: (_, record) => (
      //     <Checkbox
      //       checked={selectedUsers.includes(record.userID as UserID)}
      //       onClick={(e: any) => {
      //         // addRemoveUserToSelected(record.userID, e.target.checked);
      //       }}
      //     />
      //   ),
      // },
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
        title: 'Total Tickets',
        dataIndex: 'totalTickets',
        key: 'totalTickets',
        render: (_, record) => {
          return <span>{record.claimsCount}</span>;
        },
        sorter: (a, b) => a.claimsCount - b.claimsCount,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: 'Total Referrals',
        dataIndex: 'totalReferrals',
        key: 'totalReferrals',
        render: (_, record) => {
          return <span>{record.referralsCount}</span>;
        },
        sorter: (a, b) => a.referralsCount - b.referralsCount,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: 'Participation Rewards',
        dataIndex: 'participationRewards',
        key: 'participationRewards',
        render: (_, record) => {
          return <span>{record.participationRewardsCount}</span>;
        },
        sorter: (a, b) => a.participationRewardsCount - b.participationRewardsCount,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: 'Date Joined',
        dataIndex: 'joinDate',
        key: 'joinDate',
        render: (_, record) => {
          return (
            <Tooltip title={moment(record.joinedDate).format('YYYY-MMM-DD')}>
              <span style={{ marginLeft: '10px' }}>{moment(record.joinedDate).fromNow()}</span>
            </Tooltip>
          );
        },
        sorter: (a, b) => a.joinedDate - b.joinedDate,
        sortDirections: ['descend', 'ascend'],
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
    [fans],
  );

  if (error || data?.fansListForLootbox.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  const filterBySearchString = (fan: FanListRowForLootbox) => {
    return (
      fan.userID.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      fan.username.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };
  const matchingFans = fans.filter(filterBySearchString);
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
    <div>
      <h2>{`List of ${fans.length} Fans`}</h2>
      <$InfoDescription fontSize="0.9rem" maxWidth="50%">
        This is a list of all the fans that have claimed a ticket for this Lootbox. Try sorting by
        the various columns.
      </$InfoDescription>
      <$Horizontal justifyContent="space-between">
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
        >{`${matchingFans.length} matches from total ${fans.length} people`}</span>
      </$Horizontal>
      <br />
      <Table
        // @ts-ignore
        columns={columns}
        dataSource={matchingFans}
        // @ts-ignore
        locale={enUS}
      />
    </div>
  );
};

export default FansListTableLootbox;
