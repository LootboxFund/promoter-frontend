import { QueryCampaignClaimsForTournamentArgs } from '@/api/graphql/generated/types';
import { Bar } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Result } from 'antd';
import {
  CampaignClaimsRowFE,
  CampaignClaimsForTournamentResponseFE,
  CAMPAIGN_CLAIM_STATS,
} from '../api.gql';

interface CampaignDistributionProps {
  eventID: TournamentID;
}

const CampaignDistribution: React.FC<CampaignDistributionProps> = ({ eventID }) => {
  const { data, loading, error } = useQuery<
    CampaignClaimsForTournamentResponseFE,
    QueryCampaignClaimsForTournamentArgs
  >(CAMPAIGN_CLAIM_STATS, {
    variables: {
      tournamentID: eventID,
    },
  });

  if (error || data?.campaignClaimsForTournament?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  const convertDataRowFE = (
    row: CampaignClaimsRowFE,
  ): { campaignName: string; ticketsClaimed: number } => {
    return {
      campaignName: row.referralCampaignName,
      ticketsClaimed: row.claimCount,
    };
  };

  const parsedData =
    data?.campaignClaimsForTournament && 'data' in data?.campaignClaimsForTournament
      ? data.campaignClaimsForTournament.data.map(convertDataRowFE)
      : [];

  const config = {
    loading,
    data: parsedData,
    xField: 'ticketsClaimed',
    yField: 'campaignName',
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
