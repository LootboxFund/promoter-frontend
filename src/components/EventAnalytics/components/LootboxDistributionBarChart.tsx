import { QueryLootboxCompletedClaimsForTournamentArgs } from '@/api/graphql/generated/types';
import { Bar } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Result } from 'antd';
import {
  LootboxCompletedClaimRowFE,
  LootboxCompletedClaimsForTournamentResponseFE,
  LOOTBOX_CLAIM_STATS,
} from '../api.gql';

interface LootboxDistributionBarChartProps {
  eventID: TournamentID;
}

const LootboxDistributionBarChart: React.FC<LootboxDistributionBarChartProps> = ({ eventID }) => {
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

  const convertDataRowFE = (
    row: LootboxCompletedClaimRowFE,
  ): { lootbox: string; ticketsClaimed: number } => {
    return {
      lootbox: row.lootboxName,
      ticketsClaimed: row.claimCount,
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
    seriesField: 'lootbox',
    legend: {
      position: 'top-left' as 'top-left',
    },
  };
  return <Bar {...config} />;
};

export default LootboxDistributionBarChart;
