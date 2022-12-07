import React, { useState, useMemo } from 'react';
import { Heatmap, HeatmapConfig } from '@ant-design/plots';
import { TournamentID } from '@wormgraph/helpers';
import { DAILY_EVENT_CLAIMS, DailyEventClaimsResponseFE } from '../api.gql';
import { useQuery } from '@apollo/client';
import { Button, Col, DatePicker, Result, Row, Space, Statistic, Typography } from 'antd';
import { QueryDailyClaimStatisticsForTournamentArgs } from '@/api/graphql/generated/types';
import moment from 'moment';

const { RangePicker } = DatePicker;

interface DailyDistributionHeatmapProps {
  eventID: TournamentID;
  eventCreatedAt?: number; // milliseconds when the event was made
  eventScheduledAt?: number; // milliseconds when the event is scheduled to start
  onInviteFanModalToggle: () => void;
}
const DailyDistributionHeatmap: React.FC<DailyDistributionHeatmapProps> = (
  props: DailyDistributionHeatmapProps,
) => {
  //   const seedStartDate = props.eventCreatedAt || moment().valueOf();
  const seedStartDate = props.eventCreatedAt || moment().subtract(100, 'day').valueOf();
  const seedEndDate = props.eventScheduledAt || moment(seedStartDate).add(90, 'day').valueOf();
  // Miliseconds
  const [startDate, setStartDate] = useState<number>(seedStartDate);
  const [endDate, setEndDate] = useState(seedEndDate);

  const { loading, error, data } = useQuery<
    DailyEventClaimsResponseFE,
    QueryDailyClaimStatisticsForTournamentArgs
  >(DAILY_EVENT_CLAIMS, {
    variables: {
      payload: {
        tournamentID: props.eventID,
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
      },
    },
  });

  const { claimsInRange } = useMemo(() => {
    let value = 0;
    if (
      data?.dailyClaimStatisticsForTournament &&
      'data' in data.dailyClaimStatisticsForTournament
    ) {
      value = data?.dailyClaimStatisticsForTournament.data.reduce((a, b) => {
        return a + b.claimCount;
      }, 0);
    }
    return {
      claimsInRange: value,
    };
  }, [data]);

  const parsedData = useMemo(() => {
    return data?.dailyClaimStatisticsForTournament &&
      'data' in data?.dailyClaimStatisticsForTournament
      ? data?.dailyClaimStatisticsForTournament.data.map((d) => {
          return {
            date: d.date,
            week: d.weekNormalized,
            day: d.day - 1, // Index 0 - 6 (instead of 1 - 7)
            claimCount: d.claimCount,
          };
        })
      : [];
  }, [data]);

  if (error || data?.dailyClaimStatisticsForTournament?.__typename === 'ResponseError') {
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
          <Button onClick={props.onInviteFanModalToggle} type="primary">
            Invite Fans
          </Button>,
        ]}
      />
    );
  }

  const config: HeatmapConfig = {
    data: parsedData,
    loading,
    autoFit: false,
    xField: 'week',
    yField: 'day',
    colorField: 'claimCount',
    reflect: 'y' as 'y',
    shape: 'boundary-polygon',
    meta: {
      day: {
        type: 'cat',
        values: ['Sunday', 'Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday', 'Saturday'],
      },
      week: {
        type: 'cat',
      },
      claimCount: {
        sync: true,
      },
      date: {
        type: 'cat',
      },
    },
    heatmapStyle: {
      stroke: '#fff',
    },
    yAxis: {
      grid: null,
    },
    tooltip: {
      title: 'date',
      showMarkers: false,
      customContent: (title: any, data: any) => {
        try {
          const parsedData = data[0]?.data;
          return (
            <div
              style={{
                padding: '8px 16px',
              }}
            >
              <p>{moment(title).format('LL')}</p>
              <p>
                Ticket Claims: <b>{parsedData?.claimCount}</b>
              </p>
            </div>
          );
        } catch (err) {
          return undefined;
        }
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    xAxis: {
      position: 'top' as 'top',
      tickLine: null,
      line: null,
      label: {
        offset: 12,
        style: {
          fontSize: 12,
          fill: '#666',
          textBaseline: 'top' as 'top',
        },
        formatter: (val: any) => {
          // TODO fix this shit

          if (val === '2') {
            return 'MAY';
          } else if (val === '6') {
            return 'JUN';
          } else if (val === '10') {
            return 'JUL';
          } else if (val === '15') {
            return 'AUG';
          } else if (val === '19') {
            return 'SEP';
          } else if (val === '24') {
            return 'OCT';
          }

          return '';
        },
      },
    },
  };

  return (
    <Space direction="vertical" id="daily-distribution-container" style={{ width: '100%' }}>
      <Row justify="space-between">
        <Col span={12}>
          <h2>Tickets Distributed Per Day</h2>
          <RangePicker
            value={[moment(startDate), moment(endDate)]}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setStartDate(dates[0].valueOf());
                setEndDate(dates[1].valueOf());
              }
            }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Ticket Claims"
            loading={loading}
            value={claimsInRange}
            suffix={<Typography.Text type="secondary">in range</Typography.Text>}
          />
        </Col>
      </Row>
      <br />
      <Heatmap {...config} />
    </Space>
  );
};

export default DailyDistributionHeatmap;
