import { QueryClaimerStatsForTournamentArgs } from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID, UserID } from '@wormgraph/helpers';
import { Button, Result } from 'antd';
import { ClaimerStatsRowFE, ClaimerStatsForTournamentFE, CLAIMER_STATS } from '../api.gql';
import { truncateUID } from '@/lib/string';
import { convertClaimTypeForLegend } from '@/lib/graph';
import { useMemo } from 'react';

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
  ): { [YDataKey]: string; [XDataKey]: number; [SeriesKey]: string } => {
    return {
      [YDataKey]: `${row.username ? row.username + '\n' : ''}${truncateUID(
        row.claimerUserID as UserID,
      )}`,
      [XDataKey]: row.claimCount,
      [SeriesKey]: convertClaimTypeForLegend(row.claimType, row.referralType),
    };
  };

  const { parsedData, allClaims, nFans } = useMemo(() => {
    const _parsedData =
      data?.claimerStatsForTournament && 'data' in data?.claimerStatsForTournament
        ? data.claimerStatsForTournament.data.map(convertDataRowFE)
        : [];

    const _allClaims = _parsedData.reduce((acc, cur) => acc + cur.ticketsClaimed, 0);
    const _nFans = new Set(_parsedData.map((row) => row[YDataKey])).size;

    return {
      parsedData: _parsedData,
      allClaims: _allClaims,
      nFans: _nFans,
    };
  }, [data]);

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

  const config: BarConfig = {
    loading,
    data: parsedData,
    xField: XDataKey,
    yField: YDataKey,
    seriesField: SeriesKey,
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

  return (
    <div>
      <h2>
        {allClaims} Tickets Owned by {nFans} Fans
      </h2>
      <Bar {...config} />
    </div>
  );
};

export default FansReached;
