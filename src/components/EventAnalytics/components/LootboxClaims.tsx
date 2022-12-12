import { QueryLootboxCompletedClaimsForTournamentArgs } from '@/api/graphql/generated/types';
import { convertFilenameToThumbnail } from '@/lib/storage';
import { Bar, BarConfig, Liquid, LiquidConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Button, Col, Result, Row, Space, Statistic, Tooltip, Typography } from 'antd';
import { useMemo, useRef } from 'react';
import {
  LootboxCompletedClaimRowFE,
  LootboxCompletedClaimsForTournamentResponseFE,
  LOOTBOX_CLAIM_STATS,
} from '../api.gql';

const XDataLabel = 'ticketsClaimed';
const YDataLabel = 'lootbox';

interface LootboxClaimsProps {
  eventID: TournamentID;
  onInviteFanModalToggle: () => void;
}

interface DataRow {
  lootbox: string;
  ticketsClaimed: number;
  lootboxImg: string;
  maxTickets: number;
  lootboxID: string;
}

const LootboxClaims: React.FC<LootboxClaimsProps> = ({ eventID, onInviteFanModalToggle }) => {
  const dataMapping = useRef<{ [key: string]: number }>({}); // needed to de-dupe the lootbox names :(
  const { data, loading, error } = useQuery<
    LootboxCompletedClaimsForTournamentResponseFE,
    QueryLootboxCompletedClaimsForTournamentArgs
  >(LOOTBOX_CLAIM_STATS, {
    variables: {
      tournamentID: eventID,
    },
  });

  const convertDataRowFE = (row: LootboxCompletedClaimRowFE): DataRow => {
    let lootboxName = row.lootboxName;
    if (row.lootboxName in dataMapping.current) {
      lootboxName = `${row.lootboxName} (${dataMapping.current[row.lootboxName]})`;
      dataMapping.current[row.lootboxName]++;
    } else {
      dataMapping.current[row.lootboxName] = 1;
    }

    return {
      [YDataLabel]: lootboxName,
      [XDataLabel]: row.claimCount,
      lootboxImg: row.lootboxImg,
      maxTickets: row.maxTickets,
      lootboxID: row.lootboxID,
    };
  };

  const { parsedData, nLootboxes, sumClaims, sumMaxTickets } = useMemo(() => {
    const _parsedData =
      data?.lootboxCompletedClaimsForTournament &&
      'data' in data?.lootboxCompletedClaimsForTournament
        ? data.lootboxCompletedClaimsForTournament.data.map(convertDataRowFE)
        : [];

    const nLootboxes = _parsedData.length;

    const sumClaims = _parsedData.reduce((acc, cur) => acc + cur[XDataLabel], 0);
    const sumMaxTickets = _parsedData.reduce((acc, cur) => acc + cur.maxTickets, 0);

    return {
      parsedData: _parsedData,
      nLootboxes,
      sumClaims,
      sumMaxTickets,
    };
  }, [data]);

  if (error || data?.lootboxCompletedClaimsForTournament?.__typename === 'ResponseError') {
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
    scrollbar: {
      type: 'vertical' as 'vertical',
    },
    barBackground: {
      style: {
        fill: 'rgba(0,0,0,0.1)',
      },
    },
    xAxis: {
      title: { text: '# Tickets Claimed' },
    },
    tooltip: {
      customContent: (title: any, data: any) => {
        if (!data || !data[0]) {
          return;
        }
        const parsedData: DataRow = data[0]?.data || {};
        const { lootbox, ticketsClaimed, lootboxImg, maxTickets, lootboxID } = parsedData;
        return (
          <Space direction="vertical">
            <br />
            <Typography.Title level={5}>{lootbox}</Typography.Title>
            <Typography.Text>
              <b>{ticketsClaimed}</b> of <b>{maxTickets}</b> tickets claimed
            </Typography.Text>
            <br />
            <img
              src={lootboxImg ? convertFilenameToThumbnail(lootboxImg, 'sm') : undefined}
              alt={lootbox}
              style={{ height: '120px', margin: 'auto' }}
            />
            <br />
          </Space>
        );
      },
    },
  };

  // const liquidConfig: LiquidConfig = {
  //   height: 200,
  //   width: 200,
  //   percent: 0.25,
  //   outline: {
  //     border: 4,
  //     distance: 8,
  //   },
  //   wave: {
  //     length: 128,
  //   },
  // };

  return (
    <div>
      <br />
      <Typography.Title level={3}>{`Lootbox Ticket Claims`}</Typography.Title>
      <Row gutter={8}>
        {/* <Col span={6}>
          <Liquid {...liquidConfig} />
        </Col> */}
        <Col span={6}>
          <Tooltip
            placement="top"
            title="Number of Lootboxes in your event (including disabled & sold out)."
          >
            <Statistic loading={loading} title="# Lootbox" value={nLootboxes}></Statistic>
          </Tooltip>
        </Col>
        <Col span={6}>
          <Tooltip
            placement="top"
            title="Number of distributed tickets for all Lootboxes in your event."
          >
            <Statistic
              loading={loading}
              title="Tickets Distributed"
              value={sumClaims}
              suffix={
                <Typography.Text type="secondary">
                  ({Math.round((10000 * sumClaims) / sumMaxTickets) / 100}%)
                </Typography.Text>
              }
            />
          </Tooltip>
        </Col>
        <Col span={6}>
          <Tooltip
            placement="top"
            title="Total number of tickets available for distribution in your event."
          >
            <Statistic loading={loading} title="Ticket Capacity" value={sumMaxTickets}></Statistic>
          </Tooltip>
        </Col>
      </Row>
      <br />
      <Bar {...config} />
    </div>
  );
};

export default LootboxClaims;
