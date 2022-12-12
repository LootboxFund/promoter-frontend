import { QueryBaseClaimStatsForTournamentArgs } from '@/api/graphql/generated/types';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Col, Result, Row, Statistic, Tooltip, Typography } from 'antd';
import {
  BaseEventClaimStatsResponseFE,
  BASE_EVENT_CLAIM_STATS,
  BaseEventClaimStatsFE,
} from '../api.gql';
import {
  Pie,
  PieConfig,
  measureTextWidth,
  Gauge,
  GaugeConfig,
  Liquid,
  LiquidConfig,
} from '@ant-design/plots';
import { green, grey, gold, magenta, cyan, geekblue } from '@ant-design/colors';
import { useMemo } from 'react';
import '../index.css';

interface EventSummaryStatisticsProps {
  eventID: TournamentID;
  onInviteFanModalToggle: () => void;
}

interface DataRowUserFE {
  type: string;
  value: number;
}
const processUserPieChart = (row: BaseEventClaimStatsFE): DataRowUserFE[] => {
  const originalFans = row.originalFans;
  const viralFans = row.viralFans;
  const participationFans = row.participationFans;
  const anonymousFans = row.allFans - row.originalFans - row.viralFans - row.participationFans;
  const res = [
    ...(originalFans > 0 ? [{ type: 'Original Fans', value: originalFans }] : []),
    ...(viralFans > 0 ? [{ type: 'Viral Fans', value: viralFans }] : []),
    ...(participationFans > 0 ? [{ type: 'Participation Fans', value: participationFans }] : []),
    ...(anonymousFans > 0
      ? [
          {
            type: 'Anonymous Fans',
            value: anonymousFans,
          },
        ]
      : []),
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
    { type: 'Original Claim', value: row.originalClaims },
    { type: 'Viral Claims', value: row.viralClaimCount },
    { type: 'Referral Bonus', value: row.referralBonusClaimCount },
    { type: 'Participation Rewards', value: row.participationRewardCount },
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

  const { parsedClaimData, parsedUserData, anonymousFans, stats, viralityCoef } = useMemo(() => {
    const stats =
      data?.baseClaimStatsForTournament && 'stats' in data.baseClaimStatsForTournament
        ? data.baseClaimStatsForTournament.stats
        : null;
    const parsedClaimData = stats ? processClaimPieChart(stats) : [];
    const parsedUserData = stats ? processUserPieChart(stats) : [];
    const anonymousFans =
      stats?.allFans != null &&
      stats?.originalFans != null &&
      stats?.viralFans != null &&
      stats?.participationFans != null
        ? stats.allFans - stats.originalFans - stats.viralFans - stats.participationFans
        : 0;
    const validClaimsInCalculation =
      (stats?.totalClaimCount || 0) -
      (stats?.referralBonusClaimCount || 0) -
      (stats?.airdropClaimCount || 0);
    const viralityCoef = (validClaimsInCalculation * (stats?.completionRate || 0)) / 100;
    return { parsedClaimData, parsedUserData, anonymousFans, stats, viralityCoef };
  }, [data]);

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
    data: parsedClaimData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.64,
    legend: {
      position: 'bottom',
    },
    color: ({ type }) => {
      switch (type) {
        case 'Original Claim':
          return cyan[7];
        case 'Viral Claims':
          return green[6];
        case 'Referral Bonus':
          // return magenta[6];
          return geekblue[7];
        case 'Participation Rewards':
          return gold[5];
        default:
          return grey[5];
      }
    },
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
          const text = datum ? datum.type : 'All Claims';
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
        type: 'pie-legend-active',
      },
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
    data: parsedUserData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.64,
    color: ({ type }) => {
      switch (type) {
        case 'Original Fans':
          return cyan[7];
        case 'Viral Fans':
          return green[6];
        case 'Participation Fans':
          return gold[5];
        case 'Anonymous Fans':
          return magenta[7];
        default:
          return grey[6];
      }
    },
    legend: {
      position: 'bottom',
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
    interactions: [
      {
        type: 'pie-legend-active',
      },
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
    statistic: {
      title: {
        offsetY: -4,
        customHtml: (container, view, datum) => {
          const { width, height } = container.getBoundingClientRect();
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          const text = datum ? datum.type : 'All Fans';
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
          const text = datum ? ` ${datum.value}` : `👤 ${data?.reduce((r, d) => r + d.value, 0)}`;
          return renderStatistic(width, text, {
            fontSize: 32,
          });
        },
      },
    },
  };

  const gaugeConfig: GaugeConfig = {
    // percent: viralityCoef,
    percent: 0.76,
    loading: loading,
    // type: 'meter',
    innerRadius: 0.75,
    width: 180,
    height: 180,
    range: {
      ticks: [0, 1 / 3, 2 / 3, 1],
      color: ['#F4664A', '#FAAD14', '#30BF78'],
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    // statistic: {
    //   content: {
    //     style: {
    //       fontSize: '36px',
    //       lineHeight: '36px',
    //     },
    //   },
    // },
  };

  const liquidConfig: LiquidConfig = {
    percent: (stats?.completionRate || 0) / 100,
    width: 200,
    height: 200,
    loading: loading,
    // outline: {
    //   border: 4,
    //   distance: 8,
    // },
    wave: {
      length: 128,
    },
  };

  const remainingTix = (stats?.totalMaxTickets || 0) - (stats?.completedClaimCount || 0);

  return (
    <div className="mainbody">
      <br />
      <Row className="scrollrow" wrap={false}>
        <Col sm={24} md={12} style={{ width: '100%' }}>
          <Typography.Title level={3}>{`${stats?.allFans || 0} People Reached`}</Typography.Title>
          <Row gutter={8} wrap={true}>
            <Col sm={24} md={16}>
              <Pie {...userPieConfig} />
            </Col>

            <Col
              md={8}
              sm={24}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <Tooltip
                placement="right"
                title='Fans generated by your own marketing campaigns. These fans come from "Regular" invite links, which do not reward bonus rewards for sign ups.'
              >
                <Statistic
                  title="Original Fans"
                  loading={loading}
                  value={stats?.originalFans || 0}
                />
              </Tooltip>
              <Tooltip
                placement="right"
                title='Fans generated by your community via invite links. These fans come from "Viral" invite links which creates bonus rewards for sign ups. '
              >
                <Statistic title="Viral Fans" loading={loading} value={stats?.viralFans || 0} />
              </Tooltip>
              <Tooltip
                placement="right"
                title="Fans coming from a invite link that does not make bonus rewards. Usually used by event organisers."
              >
                <Statistic
                  title="Participation Fans"
                  loading={loading}
                  value={stats?.participationFans || 0}
                />
              </Tooltip>
              <Tooltip placement="right" title="Fans that did not complete a claim.">
                <Statistic
                  title="Anonymous Fans"
                  loading={loading}
                  value={anonymousFans < 0 ? 0 : anonymousFans}
                />
              </Tooltip>
            </Col>
          </Row>
          <br />
          <br />
          <Row gutter={8} wrap={true}>
            <Col sm={24} md={16}>
              <Gauge {...gaugeConfig} />
            </Col>

            <Col
              md={8}
              sm={24}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <Tooltip
                placement="right"
                title={`Calculated "Virality Coefficient" for your event. It is a measure of how many people shared an invite link for your event. The higher the coefficient, the more people shared your event. The most viral events have viral coefficients higher than 2.`}
              >
                <Statistic title="Virality" loading={loading} value={viralityCoef} />
              </Tooltip>
            </Col>
          </Row>
        </Col>

        <Col sm={24} md={12} style={{ width: '100%' }}>
          <Typography.Title level={3}>{`${
            stats?.completedClaimCount || 0
          } Ticket Claims`}</Typography.Title>
          <Row gutter={8} wrap>
            <Col sm={24} md={16}>
              <Pie {...claimPieConfig} />
            </Col>

            <Col
              md={8}
              sm={24}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <Tooltip
                placement="right"
                title='Claims from your own marketing campaigns. These claims come from fans via the "Regular" invite links, which do not reward bonus rewards for sign ups.'
              >
                <Statistic
                  title="Original Claims"
                  loading={loading}
                  value={stats?.originalClaims || 0}
                />
              </Tooltip>
              <Tooltip
                placement="right"
                title='Claims from your community. These claims come from fans via the "Viral" invite links which creates bonus rewards for sign ups. '
              >
                <Statistic
                  title="Viral Claims"
                  loading={loading}
                  value={stats?.viralClaimCount || 0}
                />
              </Tooltip>
              <Tooltip
                placement="right"
                title='These are reward claims awarded to your community for inviting new fans to your event. These claims come from fans via the "Viral" invite links which creates bonus rewards for sign ups. '
              >
                <Statistic
                  title="Referral Bonus"
                  loading={loading}
                  value={stats?.referralBonusClaimCount || 0}
                />
              </Tooltip>
              <Tooltip
                placement="right"
                title="These are participation rewards which you can distribute to be redeemed only ONCE. "
              >
                <Statistic
                  title="Participation Rewards"
                  loading={loading}
                  value={stats?.participationRewardCount || 0}
                />
              </Tooltip>
            </Col>
          </Row>
          <br />
          <br />
          <Row gutter={8} wrap>
            <Col sm={24} md={16}>
              <Liquid {...liquidConfig} />
            </Col>

            <Col
              md={8}
              sm={24}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <Tooltip
                placement="right"
                title={`Percentage of how many tickets have been distributed for your event. Calculated as ${
                  stats?.completedClaimCount || 0
                } completed claims divided by ${stats?.totalMaxTickets || 0} total max tickets.`}
              >
                <Statistic
                  title="Distribution Progress"
                  loading={loading}
                  value={
                    stats?.completedClaimCount && stats?.totalMaxTickets > 0
                      ? Math.round((10000 * stats.completedClaimCount) / stats.totalMaxTickets) /
                        100
                      : 0
                  }
                  suffix="%"
                />
              </Tooltip>

              <Tooltip
                placement="right"
                title="The number of unclaimed tickets left for your event."
              >
                <Statistic
                  title="# Tickets Remaining"
                  loading={loading}
                  value={remainingTix < 0 ? 0 : remainingTix}
                />
              </Tooltip>

              <Tooltip
                placement="right"
                title="Percentage of all completed claims versus the total number of abandoned claims (completed & abandoned) for all Lootboxes in this event."
              >
                <Statistic
                  title="Claim Completion Rate"
                  loading={loading}
                  value={stats?.completionRate || 0}
                  suffix="%"
                />
              </Tooltip>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default SummaryStatistics;