import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import { QueryBaseClaimStatsForLootboxArgs } from '@/api/graphql/generated/types';
import { Col, Result, Row, Statistic, Typography } from 'antd';
import { BaseLootboxStatsResponseFE, GET_LOOTBOX_BASE_STATS } from '../api.gql';

export interface BaseStatsProps {
  eventID: TournamentID;
  lootboxID: LootboxID;
}
const BaseStats: React.FC<BaseStatsProps> = ({ eventID, lootboxID }) => {
  const { data, loading, error } = useQuery<
    BaseLootboxStatsResponseFE,
    QueryBaseClaimStatsForLootboxArgs
  >(GET_LOOTBOX_BASE_STATS, {
    variables: {
      tournamentID: eventID,
      lootboxID: lootboxID,
    },
  });

  if (error || data?.baseClaimStatsForLootbox?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  const stats =
    data?.baseClaimStatsForLootbox && 'stats' in data.baseClaimStatsForLootbox
      ? data.baseClaimStatsForLootbox.stats
      : null;

  return (
    <Row gutter={8}>
      <Col span={6}>
        <Statistic
          title="Ticket Claims"
          loading={loading}
          value={stats?.completedClaimCount || 0}
          suffix={
            stats?.maxTickets ? (
              <Typography.Text type="secondary"> / {stats.maxTickets}</Typography.Text>
            ) : undefined
          }
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

      <Col span={6}>
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
      </Col>
    </Row>
  );
};

export default BaseStats;
