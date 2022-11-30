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
    <Row>
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
          suffix={
            stats?.completedClaimCount && stats.completedClaimCount > 0
              ? `/ ${stats.completedClaimCount}`
              : undefined
          }
        />
      </Col>

      <Col span={6}>
        <Statistic
          title="Referral Rewards"
          loading={loading}
          value={stats?.bonusRewardClaimCount}
          suffix={
            stats?.completedClaimCount && stats.completedClaimCount > 0
              ? `/ ${stats.completedClaimCount}`
              : undefined
          }
        />
      </Col>

      {/* <Row gutter={16}>
      <Col span={12}>
        <Statistic title="Feedback" value={1128} prefix={<LikeOutlined />} />
      </Col>
      <Col span={12}>
        <Statistic title="Unmerged" value={93} suffix="/ 100" />
      </Col>
    </Row> */}
    </Row>
  );
};

export default BaseStats;
