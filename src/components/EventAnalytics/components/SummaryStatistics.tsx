import { QueryBaseClaimStatsForTournamentArgs } from '@/api/graphql/generated/types';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Col, Result, Row, Statistic, Tooltip, Typography } from 'antd';
import {
  BaseEventClaimStatsResponseFE,
  BASE_EVENT_CLAIM_STATS,
  BaseEventClaimStatsFE,
} from '../api.gql';
import { Pie, PieConfig, measureTextWidth } from '@ant-design/plots';
import { blue, green, grey, red, gold, magenta } from '@ant-design/colors';

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
    legend: {
      position: 'bottom',
    },
    color: ({ type }) => {
      switch (type) {
        case 'Original Claim':
          return blue[5];
        case 'Viral Claims':
          return green[5];
        case 'Referral Bonus':
          return magenta[5];
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
    data: stats ? processUserPieChart(stats) : [],
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.64,
    color: ({ type }) => {
      switch (type) {
        case 'Original Fans':
          return blue[5];
        case 'Viral Fans':
          return green[5];
        case 'Participation Fans':
          return gold[5];
        case 'Anonymous Fans':
          return red[5];
        default:
          return grey[5];
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

  //   const gaugeConfig = {
  //     percent: 0.75,
  //     type: 'meter',
  //     innerRadius: 0.75,
  //     height: 200,
  //     width: 200,
  //     range: {
  //       ticks: [0, 1 / 3, 2 / 3, 1],
  //       color: ['#F4664A', '#FAAD14', '#30BF78'],
  //     },
  //     indicator: {
  //       pointer: {
  //         style: {
  //           stroke: '#D0D0D0',
  //         },
  //       },
  //       pin: {
  //         style: {
  //           stroke: '#D0D0D0',
  //         },
  //       },
  //     },
  //     statistic: {
  //       content: {
  //         style: {
  //           fontSize: '36px',
  //           lineHeight: '36px',
  //         },
  //       },
  //     },
  //   };

  const anonymousFans =
    stats?.allFans != null &&
    stats?.originalFans != null &&
    stats?.viralFans != null &&
    stats?.participationFans != null
      ? stats.allFans - stats.originalFans - stats.viralFans - stats.participationFans
      : 0;
  return (
    <div className="mainbody">
      <br />
      <Row wrap={true}>
        <Col sm={24} md={12} style={{ width: '100%' }}>
          <Typography.Title level={3}>{`${stats?.allFans || 0} People Reached`}</Typography.Title>
          {/* <Card title={`${stats?.allFans || 0} People Reached`} bordered={false}> */}
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
          {/* <Row gutter={8} wrap={true}>
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
                title='Fans generated by your own marketing campaigns. These fans come from "Regular" invite links, which do not reward bonus rewards for sign ups.'
              >
                <Statistic
                  title="Original Fans"
                  loading={loading}
                  value={stats?.originalFans || 0}
                />
              </Tooltip>
            </Col>
          </Row> */}
        </Col>

        <Col sm={24} md={12} style={{ width: '100%' }}>
          <Typography.Title level={3}>{`${
            stats?.completedClaimCount || 0
          } Ticket Claims`}</Typography.Title>
          {/* <Card title={`${stats?.totalClaimCount || 0} Ticket Claims`} bordered={false}> */}
          <Row gutter={8} wrap={true}>
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
        </Col>
      </Row>
    </div>
  );
};

export default SummaryStatistics;
