import { QueryBaseClaimStatsForTournamentArgs } from '@/api/graphql/generated/types';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Col, Result, Row, Statistic, Typography } from 'antd';
import {
  BaseEventClaimStatsResponseFE,
  BASE_EVENT_CLAIM_STATS,
  BaseEventClaimStatsFE,
} from '../api.gql';
import { Pie, PieConfig, measureTextWidth } from '@ant-design/plots';

interface EventSummaryStatisticsProps {
  eventID: TournamentID;
  onInviteFanModalToggle: () => void;
}

interface DataRowUserFE {
  type: string;
  value: number;
}
const processUserPieChart = (row: BaseEventClaimStatsFE): DataRowUserFE[] => {
  const res = [
    ...(row.originalFans > 0 ? [{ type: 'Original Fans', value: row.originalFans }] : []),
    ...(row.viralFans > 0 ? [{ type: 'Viral Fans', value: row.viralFans }] : []),
  ];
  if (res.length === 0) {
    return [{ type: 'Fans', value: 0 }];
  } else {
    return res;
  }
};

interface DataRowClaimFE {
  type: string | 'Original Claim' | 'Viral Claims' | 'Referral Bonus' | 'Participation Rewards';
  value: number;
  customHtml?: any;
}

const processClaimPieChart = (row: BaseEventClaimStatsFE): DataRowClaimFE[] => {
  const res = [
    ...(row.originalClaims > 0 ? [{ type: 'Original Claim', value: row.originalClaims }] : []),
    ...(row.viralClaimCount > 0 ? [{ type: 'Viral Claims', value: row.viralClaimCount }] : []),
    ...(row.referralBonusClaimCount > 0
      ? [{ type: 'Referral Bonus', value: row.referralBonusClaimCount }]
      : []),
    ...(row.participationRewardCount > 0
      ? [{ type: 'Participation Rewards', value: row.participationRewardCount }]
      : []),
  ];

  if (res.length === 0) {
    return [{ type: 'Claims Distributed', value: 0 }];
  } else {
    return res;
  }
};

const SummaryStatistics: React.FC<EventSummaryStatisticsProps> = (props) => {
  const { data, loading, error } = useQuery<
    BaseEventClaimStatsResponseFE,
    QueryBaseClaimStatsForTournamentArgs
  >(BASE_EVENT_CLAIM_STATS, {
    variables: {
      tournamentID: props.eventID,
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

  const renderStatistic = (containerWidth: number, text: string, style: any): string => {
    const { width: textWidth, height: textHeight } = measureTextWidth(text, style);
    const R = containerWidth / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2

    let scale = 1;

    if (containerWidth < textWidth) {
      scale = Math.min(
        Math.sqrt(
          Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2))),
        ),
        1,
      );
    }

    const textStyleStr = `width:${containerWidth}px;`;
    return `<div style="${textStyleStr};font-size:${scale}em;line-height:${
      scale < 1 ? 1 : 'inherit'
    };">${text}</div>`;
  };

  const claimPieConfig: PieConfig = {
    appendPadding: 10,
    loading: loading,
    data: stats ? processClaimPieChart(stats) : [],
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.64,
    meta: {
      value: {
        formatter: (v) => `${v} Claims`,
      },
    },
    label: {
      type: 'inner',
      offset: '-50%',
      style: {
        textAlign: 'center',
      },
      autoRotate: false,
      content: '{value} ({percentage})',
    },
    // label: {
    //   type: 'outer',
    //   content: '{name} {percentage}',
    // },
    statistic: {
      title: {
        offsetY: -4,
        customHtml: (container, view, datum) => {
          const { width, height } = container.getBoundingClientRect();
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          const text = datum ? datum.type : 'Total';
          return renderStatistic(d, text, {
            fontSize: 28,
          });
        },
      },
      content: {
        offsetY: 4,
        style: {
          fontSize: '32px',
        },
        customHtml: (container, view, datum, data) => {
          const { width } = container.getBoundingClientRect();
          //   const text = datum ? `👤 ${datum.value}` : `👤 ${data?.reduce((r, d) => r + d.value, 0)}`;
          const text = datum ? `🎁 ${datum.value}` : `🎁 ${data?.reduce((r, d) => r + d.value, 0)}`;
          return renderStatistic(width, text, {
            fontSize: 32,
          });
        },
      },
    },
    // 添加 中心统计文本 交互
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
      {
        type: 'pie-statistic-active',
      },
    ],
  };

  const userPieConfig: PieConfig = {
    appendPadding: 10,
    loading: loading,
    data: stats ? processUserPieChart(stats) : [],
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.64,
    // label: {
    //   type: 'outer',
    //   content: '{name} {percentage}',
    // },
    label: {
      type: 'inner',
      offset: '-50%',
      style: {
        textAlign: 'center',
      },
      autoRotate: false,
      content: '{value} ({percentage})',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: {
        offsetY: -4,
        customHtml: (container, view, datum) => {
          const { width, height } = container.getBoundingClientRect();
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          const text = datum ? datum.type : 'Total';
          return renderStatistic(d, text, {
            fontSize: 28,
          });
        },
      },
      content: {
        offsetY: 4,
        style: {
          fontSize: '32px',
        },
        customHtml: (container, view, datum, data) => {
          const { width } = container.getBoundingClientRect();
          const text = datum ? `👤 ${datum.value}` : `👤 ${data?.reduce((r, d) => r + d.value, 0)}`;
          return renderStatistic(width, text, {
            fontSize: 32,
          });
        },
      },
    },
  };

  return (
    <Row gutter={8}>
      <Col span={10}>
        <Statistic
          title="Ticket Claims"
          loading={loading}
          value={stats?.completedClaimCount || 0}
          suffix={<Typography.Text type="secondary">Total</Typography.Text>}
        />
        <Pie {...userPieConfig} />
      </Col>

      <Col span={14}>
        <Statistic
          title="Completion Rate"
          loading={loading}
          value={stats?.completionRate || 0}
          suffix="%"
        />
        <Pie {...claimPieConfig}></Pie>
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

export default SummaryStatistics;
