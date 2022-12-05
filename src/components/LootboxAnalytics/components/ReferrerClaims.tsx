import { QueryReferrerClaimsForLootboxArgs } from '@/api/graphql/generated/types';
import { Bar } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import { Result } from 'antd';
import {
  GET_REFERRER_CLAIM_STATS,
  GetReferrerClaimStatsResponseFE,
  ReferrerLootboxClaimRowFE,
} from '../api.gql';

interface ReferrerClaimsProps {
  eventID: TournamentID;
  lootboxID: LootboxID;
}

const ReferrerClaims: React.FC<ReferrerClaimsProps> = ({ eventID, lootboxID }) => {
  const { data, loading, error } = useQuery<
    GetReferrerClaimStatsResponseFE,
    QueryReferrerClaimsForLootboxArgs
  >(GET_REFERRER_CLAIM_STATS, {
    variables: {
      tournamentID: eventID,
      lootboxID: lootboxID,
    },
  });

  if (error || data?.referrerClaimsForLootbox?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  const convertDataRowFE = (
    row: ReferrerLootboxClaimRowFE,
  ): { userName: string; ticketsClaimed: number } => {
    return {
      userName: row.userName,
      ticketsClaimed: row.claimCount,
    };
  };

  const parsedData =
    data?.referrerClaimsForLootbox && 'data' in data?.referrerClaimsForLootbox
      ? data.referrerClaimsForLootbox.data.map(convertDataRowFE)
      : [];

  console.log('data', parsedData);

  const config = {
    loading,
    data: parsedData,
    xField: 'ticketsClaimed',
    yField: 'userName',
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
    xAxis: {
      title: { text: '# Tickets Distributed' },
    },
    scrollbar: {
      type: 'vertical' as 'vertical',
    },
    barBackground: {
      style: {
        fill: 'rgba(0,0,0,0.1)',
      },
    },
  };
  return (
    <div>
      <h2>Tickets Distributed by Promoter</h2>
      <Bar {...config} />
    </div>
  );
};

export default ReferrerClaims;
