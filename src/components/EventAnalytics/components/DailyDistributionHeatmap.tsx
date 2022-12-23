import React, { useState, useMemo, useEffect } from 'react';
import { Heatmap, HeatmapConfig } from '@ant-design/plots';
import { TournamentID } from '@wormgraph/helpers';
import { DAILY_EVENT_CLAIMS, DailyEventClaimsResponseFE } from '../api.gql';
import { useQuery } from '@apollo/client';
import { Button, Col, DatePicker, Result, Row, Space, Statistic, Typography } from 'antd';
import { QueryDailyClaimStatisticsForTournamentArgs } from '@/api/graphql/generated/types';
import moment from 'moment';
import { $InfoDescription } from '@/components/generics';

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
  const seedStartDate = props.eventCreatedAt
    ? moment(props.eventCreatedAt).subtract(2, 'day').valueOf()
    : moment().subtract(100, 'day').valueOf();
  const seedEndDate = props.eventScheduledAt
    ? moment(props.eventScheduledAt).add(2, 'day').valueOf()
    : moment(seedStartDate).add(90, 'day').valueOf();

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

  useEffect(() => {
    moment.locale('en');
  }, []);

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
          console.log(
            parsedData.date,
            props.eventScheduledAt,
            moment(parsedData.date).isSame(props.eventScheduledAt, 'day'),
          );
          return (
            <div
              style={{
                padding: '8px 16px',
              }}
            >
              {parsedData?.date &&
                props.eventCreatedAt &&
                moment(parsedData.date).isSame(props.eventCreatedAt, 'day') && (
                  <p>
                    <br />
                    <b>🏰 Event Created 🏰</b>
                  </p>
                )}

              {parsedData?.date &&
                props.eventScheduledAt &&
                moment(parsedData.date).isSame(props.eventScheduledAt, 'day') && (
                  <p>
                    <br />
                    <b>⚔️ Event Scheduled ⚔️</b>
                  </p>
                )}

              {parsedData?.date &&
                props.eventScheduledAt &&
                moment(parsedData.date).isSame(moment(), 'day') && (
                  <p>
                    <br />
                    <b>Today 📅</b>
                  </p>
                )}

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
    label: {
      content: (data: any) => {
        const dateStr = data?.date;
        if (!dateStr) {
          return '';
        }
        if (moment(dateStr).isSame(moment(), 'day')) {
          return '📅';
        }
        if (props.eventCreatedAt) {
          if (moment(dateStr).isSame(props.eventCreatedAt, 'day')) {
            return '🏰';
          }
        }

        if (props.eventScheduledAt) {
          if (moment(dateStr).isSame(props.eventScheduledAt, 'day')) {
            return '⚔️';
          }
        }

        return '';
      },
    },
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
          // if (val === '2') {
          //   return 'MAY';
          // } else if (val === '6') {
          //   return 'JUN';
          // } else if (val === '10') {
          //   return 'JUL';
          // } else if (val === '15') {
          //   return 'AUG';
          // } else if (val === '19') {
          //   return 'SEP';
          // } else if (val === '24') {
          //   return 'OCT';
          // }

          return '';
        },
      },
    },
  };

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

  return (
    <div id="daily-distribution-container" style={{ width: '100%' }}>
      <h2>Tickets Distributed Per Day</h2>
      <$InfoDescription>
        This is a calendar heatmap showing the number of tickets distributed per day. The darker the
        color, the more tickets were distributed on that day. The brighter the color, the fewer
        tickets were distributed on that day.
      </$InfoDescription>
      <Row justify="space-between">
        <Col span={12}>
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
    </div>
  );
};

export default DailyDistributionHeatmap;
