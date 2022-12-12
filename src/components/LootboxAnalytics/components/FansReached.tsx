import {
  QueryBaseClaimStatsForLootboxArgs,
  QueryClaimerStatisticsForLootboxTournamentArgs,
} from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID, UserID } from '@wormgraph/helpers';
import { Button, Col, Divider, Result, Row, Statistic, Tooltip, Typography } from 'antd';
import {
  ClaimerStatsLootboxTournamentRowFE,
  ClaimerStatsForLootboxTournamentFE,
  CLAIMER_STATS_FOR_LOOTBOX_TOURNAMENT,
  GET_LOOTBOX_BASE_STATS,
  BaseLootboxStatsResponseFE,
} from '../api.gql';
import { truncateUID } from '@/lib/string';
import { convertClaimTypeForLegend } from '@/lib/graph';
import { useMemo } from 'react';
import { manifest } from '@/manifest';

interface FansReachedProps {
  eventID: TournamentID;
  lootboxID: LootboxID;
  onInviteFanModalToggle: () => void;
}

const YDataKey = 'username';
const XDataKey = 'claimCount';
const SeriesKey = 'claimType';

const FansReached: React.FC<FansReachedProps> = ({
  eventID,
  lootboxID,
  onInviteFanModalToggle,
}) => {
  const { data, loading, error } = useQuery<
    ClaimerStatsForLootboxTournamentFE,
    QueryClaimerStatisticsForLootboxTournamentArgs
  >(CLAIMER_STATS_FOR_LOOTBOX_TOURNAMENT, {
    variables: {
      tournamentID: eventID,
      lootboxID: lootboxID,
    },
  });

  const { data: baseData } = useQuery<
    BaseLootboxStatsResponseFE,
    QueryBaseClaimStatsForLootboxArgs
  >(GET_LOOTBOX_BASE_STATS, {
    variables: {
      tournamentID: eventID,
      lootboxID: lootboxID,
    },
  });

  const convertDataRowFE = (
    row: ClaimerStatsLootboxTournamentRowFE,
  ): { [YDataKey]: any; [XDataKey]: number; [SeriesKey]: string; userID: string } => {
    return {
      [YDataKey]: `${row.username ? row.username + '\n' : ''}${truncateUID(
        row.claimerUserID as UserID,
      )}`,
      [XDataKey]: row.claimCount,
      [SeriesKey]: convertClaimTypeForLegend(row.claimType, row.referralType),
      userID: row.claimerUserID,
    };
  };

  const { parsedData, allClaims, nFans, avgTickets } = useMemo(() => {
    const _parsedData =
      data?.claimerStatisticsForLootboxTournament &&
      'data' in data?.claimerStatisticsForLootboxTournament
        ? data.claimerStatisticsForLootboxTournament.data.map(convertDataRowFE)
        : [];

    const _allClaims = _parsedData.reduce((acc, cur) => acc + cur[XDataKey], 0);
    const _nFans = new Set(_parsedData.map((row) => row[YDataKey])).size;
    const _avgTickets = _nFans > 0 ? Math.round(_allClaims / _nFans) : 0;

    return {
      parsedData: _parsedData,
      allClaims: _allClaims,
      nFans: _nFans,
      avgTickets: _avgTickets,
    };
  }, [data]);

  if (error || data?.claimerStatisticsForLootboxTournament?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }
  if (!loading && parsedData.length === 0) {
    return (
      <Result
        status="info"
        title="Invite Fans"
        subTitle="View detailed analytics for your event by inviting fans to claim their LOOTBOX reward."
        extra={[
          <Button onClick={onInviteFanModalToggle} type="primary">
            Invite Fans
          </Button>,
        ]}
      />
    );
  }

  const stats =
    baseData?.baseClaimStatsForLootbox && 'stats' in baseData.baseClaimStatsForLootbox
      ? baseData.baseClaimStatsForLootbox.stats
      : null;

  const config: BarConfig = {
    loading,
    data: parsedData,
    xField: XDataKey,
    yField: YDataKey,
    seriesField: SeriesKey,
    isStack: true,
    height: 520,
    label: {
      position: 'middle' as 'middle',
      content: (data: any) => {
        console.log('data?', data);
        return data[XDataKey];
      },
    },
    legend: {
      position: 'top-left' as 'top-left',
    },
    yAxis: {
      label: {
        autoRotate: false,
        // formatter: (val: any, _: any, idx: number) => {
        //   return parsedData[idx].campaignName;
        // },
      },
    },
    scrollbar: {
      type: 'vertical' as 'vertical',
    },
    barBackground: {
      style: {
        fill: 'rgba(0,0,0,0.1)',
      },
    },
    xAxis: {
      title: { text: '# Tickets Distributed' },
    },
  };

  return (
    <div>
      <br />
      <Typography.Title level={3}>Tickets Owned by Fans</Typography.Title>
      <br />
      <Row gutter={8} wrap>
        <Col sm={24} md={5}>
          <Tooltip placement="top" title="Number of ticket claims for this Lootbox.">
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
          </Tooltip>
        </Col>

        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title="Percentage of completed claims over the total number of claim attempts per Lootbox."
          >
            <Statistic
              title="Completion Rate"
              loading={loading}
              value={stats?.completionRate || 0}
              suffix="%"
            />
          </Tooltip>
        </Col>

        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title="Average number of tickets owned for each fan for this Lootbox"
          >
            <Statistic
              loading={loading}
              title="Average Tickets per Fan"
              value={avgTickets}
            ></Statistic>
          </Tooltip>
        </Col>
        {/* <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title="The total number of claims owned by all fans for this Lootbox"
          >
            <Statistic
              loading={loading}
              title="Tickets Owned by Fans"
              value={allClaims}
            ></Statistic>
          </Tooltip>
        </Col> */}
        <Col span={5}>
          <Tooltip
            placement="top"
            title="The total number of fans that own tickets for this Lootbox"
          >
            <Statistic loading={loading} title="# Fans" value={nFans} />
          </Tooltip>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={24}>
          <Bar
            {...config}
            onReady={(plot) => {
              plot.on('plot:click', (evt: any) => {
                const { x, y } = evt;
                const tooltipData = plot.chart.getTooltipItems({ x, y });
                const userID = tooltipData[0]?.data?.userID;
                if (userID) {
                  window.open(
                    `${manifest.microfrontends.webflow.publicProfile}?uid=${userID}`,
                    '_blank',
                  );
                }
              });
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default FansReached;
