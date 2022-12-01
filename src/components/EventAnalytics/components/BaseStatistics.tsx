import { BaseEventClaimStatsResponseFE, BASE_EVENT_CLAIM_STATS } from '../api.gql';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { QueryBaseClaimStatsForTournamentArgs } from '@/api/graphql/generated/types';
import { Col, Result, Row, Statistic } from 'antd';

export interface BaseStatsProps {
  eventID: TournamentID;
}
const BaseStats: React.FC<BaseStatsProps> = ({ eventID }) => {
  const { data, loading, error } = useQuery<
    BaseEventClaimStatsResponseFE,
    QueryBaseClaimStatsForTournamentArgs
  >(BASE_EVENT_CLAIM_STATS, {
    variables: {
      tournamentID: eventID,
    },
  });

  if (error || data?.baseClaimStatsForTournament?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  const stats =
    data?.baseClaimStatsForTournament && 'stats' in data.baseClaimStatsForTournament
      ? data.baseClaimStatsForTournament.stats
      : null;

  return (
    <Row gutter={4}>
      <Col span={6}>
        <Statistic
          title="Ticket Claims"
          loading={loading}
          value={stats?.completedClaimCount}
          suffix="Total"
        />
      </Col>

      <Col span={6}>
        <Statistic title="Incomplete Claims" loading={loading} value={stats?.pendingClaimCount} />
      </Col>

      <Col span={6}>
        <Statistic
          title="Participation Rewards"
          loading={loading}
          value={stats?.oneTimeClaimCount}
        />
      </Col>

      <Col span={6}>
        <Statistic
          title="Referral Rewards"
          loading={loading}
          value={stats?.bonusRewardClaimCount}
        />
      </Col>
    </Row>
  );
};

export default BaseStats;
