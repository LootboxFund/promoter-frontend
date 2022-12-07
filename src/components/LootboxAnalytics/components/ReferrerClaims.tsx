import { QueryReferrerClaimsForLootboxArgs } from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import { Button, Result } from 'antd';
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
  ): { [YDataLabel]: string; [XDataLabel]: number } => {
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
    };
  };

  const parsedData = useMemo(() => {
    return data?.referrerClaimsForLootbox && 'data' in data?.referrerClaimsForLootbox
      ? data.referrerClaimsForLootbox.data.map(convertDataRowFE)
      : [];
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
      <h2>Tickets Distributed by Promoter</h2>
      <Bar {...config} />
    </div>
  );
};

export default ReferrerClaims;
