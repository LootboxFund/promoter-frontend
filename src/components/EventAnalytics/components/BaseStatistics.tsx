import { BaseEventClaimStatsResponseFE, BASE_EVENT_CLAIM_STATS } from '../api.gql';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { QueryBaseClaimStatsForTournamentArgs } from '@/api/graphql/generated/types';
import { Col, Result, Row, Statistic, Typography } from 'antd';

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
          suffix={<Typography.Text type="secondary">Total</Typography.Text>}
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
          suffix={
            stats?.completedClaimCount && stats.completedClaimCount > 0 ? (
              <Typography.Text type="secondary"> / {stats.completedClaimCount}</Typography.Text>
            ) : undefined
          }
        />
      </Col>

      <Col span={6}>
        <Statistic
          title="Referral Rewards"
          loading={loading}
          value={stats?.bonusRewardClaimCount}
          suffix={
            stats?.completedClaimCount && stats.completedClaimCount > 0 ? (
              <Typography.Text type="secondary"> / {stats.completedClaimCount}</Typography.Text>
            ) : undefined
          }
        />
      </Col>
    </Row>
  );
};

export default BaseStats;
