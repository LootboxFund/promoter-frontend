import { QueryLootboxCompletedClaimsForTournamentArgs } from '@/api/graphql/generated/types';
import { convertFilenameToThumbnail } from '@/lib/storage';
import { Bar } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Result, Space, Typography } from 'antd';
import {
  LootboxCompletedClaimRowFE,
  LootboxCompletedClaimsForTournamentResponseFE,
  LOOTBOX_CLAIM_STATS,
} from '../api.gql';

interface LootboxClaimsProps {
  eventID: TournamentID;
}

interface DataRow {
  lootbox: string;
  ticketsClaimed: number;
  lootboxImg: string;
  maxTickets: number;
  lootboxID: string;
}

const LootboxClaims: React.FC<LootboxClaimsProps> = ({ eventID }) => {
  const { data, loading, error } = useQuery<
    LootboxCompletedClaimsForTournamentResponseFE,
    QueryLootboxCompletedClaimsForTournamentArgs
  >(LOOTBOX_CLAIM_STATS, {
    variables: {
      tournamentID: eventID,
    },
  });

  if (error || data?.lootboxCompletedClaimsForTournament?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  const convertDataRowFE = (row: LootboxCompletedClaimRowFE): DataRow => {
    return {
      lootbox: row.lootboxName,
      ticketsClaimed: row.claimCount,
      lootboxImg: row.lootboxImg,
      maxTickets: row.maxTickets,
      lootboxID: row.lootboxID,
    };
  };

  const parsedData =
    data?.lootboxCompletedClaimsForTournament && 'data' in data?.lootboxCompletedClaimsForTournament
      ? data.lootboxCompletedClaimsForTournament.data.map(convertDataRowFE)
      : [];

  const config = {
    loading,
    data: parsedData,
    xField: 'ticketsClaimed',
    yField: 'lootbox',
    seriesField: 'ticketsClaimed',
    label: {
      position: 'middle' as 'middle',
    },
    legend: {
      position: 'top-left' as 'top-left',
    },
    yAxis: {
      label: {
        autoRotate: false,
      },
    },
    scrollbar: {
      type: 'vertical' as 'vertical',
    },
    barBackground: {
      style: {
        fill: 'rgba(0,0,0,0.1)',
      },
    },
    xAxis: {
      title: { text: '# Tickets Claimed' },
    },
    tooltip: {
      customContent: (title: any, data: any) => {
        if (!data || !data[0]) {
          return;
        }
        const parsedData: DataRow = data[0]?.data || {};
        const { lootbox, ticketsClaimed, lootboxImg, maxTickets, lootboxID } = parsedData;
        return (
          <Space direction="vertical">
            <br />
            <Typography.Title level={5}>{lootbox}</Typography.Title>
            <Typography.Text>
              <b>{ticketsClaimed}</b> of <b>{maxTickets}</b> tickets claimed
            </Typography.Text>
            <br />
            <img
              src={lootboxImg ? convertFilenameToThumbnail(lootboxImg, 'sm') : undefined}
              alt={lootbox}
              style={{ height: '120px', margin: 'auto' }}
            />
            <br />
          </Space>
        );
      },
    },
  };
  return (
    <div>
      <h2>Lootbox Ticket Claims</h2>
      <Bar {...config} />
    </div>
  );
};

export default LootboxClaims;
