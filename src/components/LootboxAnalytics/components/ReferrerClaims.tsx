import { QueryReferrerClaimsForLootboxArgs } from '@/api/graphql/generated/types';
import { manifest } from '@/manifest';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import { Button, Col, Divider, Result, Row, Statistic, Tooltip, Typography } from 'antd';
import { useMemo, useRef } from 'react';
import {
  GET_REFERRER_CLAIM_STATS,
  GetReferrerClaimStatsResponseFE,
  ReferrerLootboxClaimRowFE,
} from '../api.gql';

const XDataLabel = 'ticketsClaimed';
const YDataLabel = 'userName';

interface ReferrerClaimsProps {
  eventID: TournamentID;
  lootboxID: LootboxID;
  onInviteFanModalToggle: () => void;
}

const ReferrerClaims: React.FC<ReferrerClaimsProps> = ({
  eventID,
  lootboxID,
  onInviteFanModalToggle,
}) => {
  const dataMapping = useRef<{ [key: string]: number }>({}); // needed to de-dupe the user names :(
  const { data, loading, error } = useQuery<
    GetReferrerClaimStatsResponseFE,
    QueryReferrerClaimsForLootboxArgs
  >(GET_REFERRER_CLAIM_STATS, {
    variables: {
      tournamentID: eventID,
      lootboxID: lootboxID,
    },
  });

  const convertDataRowFE = (
    row: ReferrerLootboxClaimRowFE,
  ): { [YDataLabel]: string; [XDataLabel]: number; userID: string } => {
    let userName = row.userName;
    if (row.userName in dataMapping.current) {
      userName = `${row.userName} (${dataMapping.current[row.userName]})`;
      dataMapping.current[row.userName]++;
    } else {
      dataMapping.current[row.userName] = 1;
    }
    return {
      [YDataLabel]: userName,
      [XDataLabel]: row.claimCount,
      userID: row.userID,
    };
  };

  const { parsedData, sumClaims, avgDistribution, nPromoters } = useMemo(() => {
    const _parsedData =
      data?.referrerClaimsForLootbox && 'data' in data?.referrerClaimsForLootbox
        ? data.referrerClaimsForLootbox.data.map(convertDataRowFE)
        : [];
    const _nPromoters = _parsedData.filter((row) => row.ticketsClaimed > 0).length;
    const _sumClaims = _parsedData.reduce((acc, cur) => acc + cur.ticketsClaimed, 0);
    return {
      parsedData: _parsedData,
      sumClaims: _sumClaims,
      avgDistribution:
        _nPromoters > 0
          ? Math.round(
              (100 * _parsedData.reduce((acc, cur) => acc + cur.ticketsClaimed, 0)) / _nPromoters,
            ) / 100
          : 0,
      nPromoters: _nPromoters,
    };
  }, [data]);

  if (error || data?.referrerClaimsForLootbox?.__typename === 'ResponseError') {
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
        subTitle="View detailed analytics for your LOOTBOX by inviting fans to claim their LOOTBOX reward."
        extra={[
          <Button onClick={onInviteFanModalToggle} type="primary">
            Invite Fans
          </Button>,
        ]}
      />
    );
  }

  const config: BarConfig = {
    loading,
    data: parsedData,
    xField: XDataLabel,
    yField: YDataLabel,
    seriesField: XDataLabel,
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
    xAxis: {
      title: { text: '# Tickets Distributed' },
    },
    scrollbar: {
      type: 'vertical' as 'vertical',
    },
    barBackground: {
      style: {
        fill: 'rgba(0,0,0,0.1)',
      },
    },
  };
  return (
    <div>
      <br />
      <Typography.Title level={3}>Tickets Distributed by Promoter</Typography.Title>
      <br />
      <Row gutter={8} wrap>
        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title="Number of distributed tickets for this Lootbox for all Promoters."
          >
            <Statistic loading={loading} title="Tickets Distributed" value={sumClaims} />
          </Tooltip>
        </Col>
        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title='Average number of tickets distributed per Promoter for this Lootbox. Defined as "Tickets Distributed" / "# Promoters".'
          >
            <Statistic
              loading={loading}
              title="Average Distribution"
              value={avgDistribution}
            ></Statistic>
          </Tooltip>
        </Col>
        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title="Total number of promoters that helped distribute this Lootbox's tickets."
          >
            <Statistic loading={loading} title="# Promoters" value={nPromoters}></Statistic>
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

export default ReferrerClaims;
