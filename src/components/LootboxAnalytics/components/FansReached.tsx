import { QueryClaimerStatisticsForLootboxTournamentArgs } from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID, UserID } from '@wormgraph/helpers';
import { Button, Result, Typography } from 'antd';
import {
  ClaimerStatsLootboxTournamentRowFE,
  ClaimerStatsForLootboxTournamentFE,
  CLAIMER_STATS_FOR_LOOTBOX_TOURNAMENT,
} from '../api.gql';
import { truncateUID } from '@/lib/string';
import { convertClaimTypeForLegend } from '@/lib/graph';

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

  const convertDataRowFE = (
    row: ClaimerStatsLootboxTournamentRowFE,
  ): { [YDataKey]: any; [XDataKey]: number; [SeriesKey]: string } => {
    return {
      [YDataKey]: `${row.username ? row.username + '\n' : ''}${truncateUID(
        row.claimerUserID as UserID,
      )}`,
      // [YDataKey]: (
      //   <Typography.Text>{`${row.username ? row.username + '\n' : ''}${
      //     row.claimerUserID
      //   }`}</Typography.Text>
      // ),
      [XDataKey]: row.claimCount,
      [SeriesKey]: convertClaimTypeForLegend(row.claimType, row.referralType),
    };
  };

  const parsedData =
    data?.claimerStatisticsForLootboxTournament &&
    'data' in data?.claimerStatisticsForLootboxTournament
      ? data.claimerStatisticsForLootboxTournament.data.map(convertDataRowFE)
      : [];

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

  const config: BarConfig = {
    loading,
    data: parsedData,
    xField: XDataKey,
    yField: YDataKey,
    seriesField: SeriesKey,
    isStack: true,
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
      <h2>Tickets Owed To Fans</h2>
      <Bar {...config} />
    </div>
  );
};

export default FansReached;
