import {
  FanListRowForTournament,
  FansListForTournamentResponse,
  QueryFansListForTournamentArgs,
} from '@/api/graphql/generated/types';
import enUS from 'antd/es/locale/en_US';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Avatar, Button, Input, Result, Spin, Tag, Tooltip } from 'antd';
import { FANS_LIST_FOR_TOURNAMENT } from '../api.gql';
import { useMemo, useState } from 'react';
import Table, { ColumnsType } from 'antd/lib/table';
import { $ColumnGap, $Horizontal, $InfoDescription } from '@/components/generics';
import { Link } from '@umijs/max';
import moment from 'moment';
import { manifest } from '@/manifest';

interface FansListTableEventProps {
  eventID: TournamentID;
}

const FansListTableEvent: React.FC<FansListTableEventProps> = ({ eventID }) => {
  const { data, loading, error } = useQuery<
    { fansListForTournament: FansListForTournamentResponse },
    QueryFansListForTournamentArgs
  >(FANS_LIST_FOR_TOURNAMENT, {
    variables: {
      tournamentID: eventID,
    },
  });
  const fans = useMemo(() => {
    if (
      data?.fansListForTournament &&
      data?.fansListForTournament.__typename === 'FansListForTournamentResponseSuccess'
    ) {
      const allFans = data?.fansListForTournament.fans;
      const sortedFans = allFans.slice().sort((a, b) => b.joinedDate - a.joinedDate);
      return sortedFans;
    }
    return [];
  }, [data?.fansListForTournament]);
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
        title: 'Favorite',
        dataIndex: 'favorite',
        key: 'favorite',
        filterMode: 'menu',
        render: (_value: any, record) => {
          if (
            record.favoriteLootbox &&
            record.favoriteLootbox.lootboxID &&
            record.favoriteLootbox.name
          ) {
            return (
              <Link
                to={`/dashboard/lootbox/id/${record.favoriteLootbox.lootboxID}?tid=${eventID}`}
                target="_blank"
              >
                <Tag>{record.favoriteLootbox.name}</Tag>
              </Link>
            );
          }
          return null;
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
        title: 'Expired Claims',
        dataIndex: 'expiredClaims',
        key: 'expiredClaims',
        render: (_, record) => {
          return <span>{record.expiredClaimsCount}</span>;
        },
        sorter: (a, b) => a.expiredClaimsCount - b.expiredClaimsCount,
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

  const filterBySearchString = (fan: FanListRowForTournament) => {
    return (
      fan.userID.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      fan.username.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      (fan.favoriteLootbox &&
        fan.favoriteLootbox.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1)
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

  if (error || data?.fansListForTournament.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  return (
    <div>
      <h2>{`List of ${fans.length} Fans`}</h2>
      <$InfoDescription>
        This is a list of all the fans that have claimed a ticket for your tournament. Try sorting
        by the various columns.
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
        scroll={{ x: true }}
      />
    </div>
  );
};

export default FansListTableEvent;
