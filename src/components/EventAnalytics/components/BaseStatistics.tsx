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

  const stats =
    data?.baseClaimStatsForTournament && 'stats' in data.baseClaimStatsForTournament
      ? data.baseClaimStatsForTournament.stats
      : null;

  if (error || data?.baseClaimStatsForTournament?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  return (
    <Row gutter={8}>
      <Col span={6}>
        <Statistic
          title="Ticket Claims"
          loading={loading}
          value={stats?.completedClaimCount || 0}
          suffix={<Typography.Text type="secondary">Total</Typography.Text>}
        />
      </Col>

      <Col span={6}>
        <Statistic
          title="Completion Rate"
          loading={loading}
          value={stats?.completionRate || 0}
          suffix="%"
        />
      </Col>

      {/* <Col span={6}>
        <Statistic title="Incomplete Claims" loading={loading} value={stats?.pendingClaimCount} />
      </Col> */}

      {/* <Col span={6}>
        <Statistic
          title="Referral Rewards"
          loading={loading}
          value={stats?.bonusRewardClaimCount}
          suffix={
            stats?.completedClaimCount && stats.completedClaimCount > 0 ? (
              <Typography.Text type="secondary">
                (
                {Math.round(
                  (100 * (stats?.bonusRewardClaimCount || 0)) / stats.completedClaimCount,
                )}
                %)
              </Typography.Text>
            ) : undefined
          }
        />
      </Col>

      <Col span={6}>
        <Statistic
          title="Participation Rewards"
          loading={loading}
          value={stats?.oneTimeClaimCount}
          suffix={
            stats?.completedClaimCount && stats.completedClaimCount > 0 ? (
              <Typography.Text type="secondary">
                ({Math.round((100 * (stats?.oneTimeClaimCount || 0)) / stats.completedClaimCount)}
                %)
              </Typography.Text>
            ) : undefined
          }
        />
      </Col> */}
    </Row>
  );
};

export default BaseStats;
