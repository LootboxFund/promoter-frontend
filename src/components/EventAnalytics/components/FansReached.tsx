import { QueryClaimerStatsForTournamentArgs } from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID, UserID } from '@wormgraph/helpers';
import { Button, Col, Divider, Result, Row, Statistic, Tooltip, Typography } from 'antd';
import { ClaimerStatsRowFE, ClaimerStatsForTournamentFE, CLAIMER_STATS } from '../api.gql';
import { truncateUID } from '@/lib/string';
import { convertClaimTypeForLegend } from '@/lib/graph';
import { useMemo } from 'react';
import { manifest } from '@/manifest';
import { $InfoDescription } from '@/components/generics';

interface FansReachedProps {
  eventID: TournamentID;
  onInviteFanModalToggle: () => void;
}

const YDataKey = 'username';
const XDataKey = 'ticketsClaimed';
const SeriesKey = 'claimType';

const FansReached: React.FC<FansReachedProps> = ({ eventID, onInviteFanModalToggle }) => {
  const { data, loading, error } = useQuery<
    ClaimerStatsForTournamentFE,
    QueryClaimerStatsForTournamentArgs
  >(CLAIMER_STATS, {
    variables: {
      eventID: eventID,
    },
  });

  const convertDataRowFE = (
    row: ClaimerStatsRowFE,
  ): { [YDataKey]: string; [XDataKey]: number; [SeriesKey]: string; userID: string } => {
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
      data?.claimerStatsForTournament && 'data' in data?.claimerStatsForTournament
        ? data.claimerStatsForTournament.data.map(convertDataRowFE)
        : [];

    const _allClaims = _parsedData.reduce((acc, cur) => acc + cur.ticketsClaimed, 0);
    const _nFans = new Set(_parsedData.map((row) => row[YDataKey])).size;
    const _avgTickets = _nFans > 0 ? Math.round(_allClaims / _nFans) : 0;

    return {
      parsedData: _parsedData,
      allClaims: _allClaims,
      nFans: _nFans,
      avgTickets: _avgTickets,
    };
  }, [data]);

  const config: BarConfig = {
    loading,
    data: parsedData,
    xField: XDataKey,
    yField: YDataKey,
    seriesField: SeriesKey,
    height: 520,
    isStack: true,
    label: {
      position: 'middle' as 'middle',
    },
    legend: {
      position: 'top-left' as 'top-left',
    },
    yAxis: {
      label: {
        autoRotate: false,
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

  if (error || data?.claimerStatsForTournament?.__typename === 'ResponseError') {
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

  return (
    <div>
      <h2>Tickets Owned by Fans</h2>
      <$InfoDescription>
        Track ticket distribution and see which fans have claimed the most tickets for your event.
        This shows your fans & the number of valid tickets that they own.
      </$InfoDescription>
      <Row gutter={8} wrap>
        <Col sm={24} md={5}>
          <Tooltip placement="top" title="Average number of tickets owned for each fan.">
            <Statistic
              loading={loading}
              title="Average Tickets per Fan"
              value={avgTickets}
            ></Statistic>
          </Tooltip>
        </Col>
        <Col sm={24} md={5}>
          <Tooltip placement="top" title="The total number of claims owned by all fans">
            <Statistic
              loading={loading}
              title="Tickets Owned by Fans"
              value={allClaims}
            ></Statistic>
          </Tooltip>
        </Col>
        <Col sm={24} md={5}>
          <Tooltip placement="top" title="The total number of fans that own tickets for your event">
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
