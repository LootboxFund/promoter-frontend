import { QueryReferrerClaimsForTournamentArgs } from '@/api/graphql/generated/types';
import { Bar } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Button, Result } from 'antd';
import { useMemo } from 'react';
import {
  ReferrerClaimsForTournamentResponseFE,
  REFERRER_CLAIM_STATS,
  ReferrerClaimsForTournamentRow,
} from '../api.gql';

interface ReferrerClaimsProps {
  eventID: TournamentID;
  onInviteFanModalToggle: () => void;
}

const ReferrerClaims: React.FC<ReferrerClaimsProps> = ({ eventID, onInviteFanModalToggle }) => {
  const { data, loading, error } = useQuery<
    ReferrerClaimsForTournamentResponseFE,
    QueryReferrerClaimsForTournamentArgs
  >(REFERRER_CLAIM_STATS, {
    variables: {
      tournamentID: eventID,
    },
  });

  const convertDataRowFE = (
    row: ReferrerClaimsForTournamentRow,
  ): { userName: string; ticketsClaimed: number } => {
    return {
      userName: row.userName,
      ticketsClaimed: row.claimCount,
    };
  };

  const parsedData = useMemo(() => {
    return data?.referrerClaimsForTournament && 'data' in data?.referrerClaimsForTournament
      ? data.referrerClaimsForTournament.data.map(convertDataRowFE)
      : [];
  }, [data]);

  if (error || data?.referrerClaimsForTournament?.__typename === 'ResponseError') {
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

  const config = {
    loading,
    data: parsedData,
    xField: 'ticketsClaimed',
    yField: 'userName',
    seriesField: 'ticketsClaimed',
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
      <h2>Tickets Distributed by Promoter</h2>
      <Bar {...config} />
    </div>
  );
};

export default ReferrerClaims;
