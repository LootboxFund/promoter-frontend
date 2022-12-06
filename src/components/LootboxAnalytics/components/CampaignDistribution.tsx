import { QueryCampaignClaimsForLootboxArgs } from '@/api/graphql/generated/types';
import { Bar } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import { Result } from 'antd';
import {
  CampaignClaimRowFE,
  CampaignClaimsForLootboxResponseFE,
  CAMPAIGN_CLAIMS_FOR_LOOTBOX,
} from '../api.gql';

interface CampaignDistributionProps {
  eventID: TournamentID;
  lootboxID: LootboxID;
}

const CampaignDistribution: React.FC<CampaignDistributionProps> = ({ eventID, lootboxID }) => {
  const { data, loading, error } = useQuery<
    CampaignClaimsForLootboxResponseFE,
    QueryCampaignClaimsForLootboxArgs
  >(CAMPAIGN_CLAIMS_FOR_LOOTBOX, {
    variables: {
      tournamentID: eventID,
      lootboxID: lootboxID,
    },
  });

  if (error || data?.campaignClaimsForLootbox?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  const convertDataRowFE = (
    row: CampaignClaimRowFE,
  ): { campaignName: string; ticketsClaimed: number } => {
    return {
      campaignName: row.referralCampaignName,
      ticketsClaimed: row.claimCount,
    };
  };

  const parsedData =
    data?.campaignClaimsForLootbox && 'data' in data?.campaignClaimsForLootbox
      ? data.campaignClaimsForLootbox.data.map(convertDataRowFE)
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
