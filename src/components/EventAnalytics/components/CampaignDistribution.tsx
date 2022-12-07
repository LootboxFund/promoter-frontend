import { QueryCampaignClaimsForTournamentArgs } from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Button, Result } from 'antd';
import { useMemo, useRef } from 'react';
import {
  CampaignClaimsRowFE,
  CampaignClaimsForTournamentResponseFE,
  CAMPAIGN_CLAIM_STATS,
} from '../api.gql';

interface CampaignDistributionProps {
  eventID: TournamentID;
  onInviteFanModalToggle: () => void;
}

const YDataLabel = 'campaignName';
const XDataLabel = 'ticketsClaimed';

const CampaignDistribution: React.FC<CampaignDistributionProps> = ({
  eventID,
  onInviteFanModalToggle,
}) => {
  const dataMapping = useRef<{ [key: string]: number }>({}); // needed to de-dupe the campaign names :(
  const { data, loading, error } = useQuery<
    CampaignClaimsForTournamentResponseFE,
    QueryCampaignClaimsForTournamentArgs
  >(CAMPAIGN_CLAIM_STATS, {
    variables: {
      tournamentID: eventID,
    },
  });

  const convertDataRowFE = (
    row: CampaignClaimsRowFE,
  ): { [YDataLabel]: string; [XDataLabel]: number } => {
    let campaignName = row.referralCampaignName;
    if (row.referralCampaignName in dataMapping.current) {
      campaignName = `${row.referralCampaignName} (${
        dataMapping.current[row.referralCampaignName]
      })`;
      dataMapping.current[row.referralCampaignName]++;
    } else {
      dataMapping.current[row.referralCampaignName] = 1;
    }

    return {
      [YDataLabel]: campaignName,
      [XDataLabel]: row.claimCount,
    };
  };

  const parsedData = useMemo(() => {
    return data?.campaignClaimsForTournament && 'data' in data?.campaignClaimsForTournament
      ? data.campaignClaimsForTournament.data.map(convertDataRowFE)
      : [];
  }, [data]);

  if (error || data?.campaignClaimsForTournament?.__typename === 'ResponseError') {
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
      <h2>Tickets Distributed by Campaign</h2>
      <Bar {...config} />
    </div>
  );
};

export default CampaignDistribution;
