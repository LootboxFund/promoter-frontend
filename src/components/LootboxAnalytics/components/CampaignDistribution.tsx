import { QueryCampaignClaimsForLootboxArgs } from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import { Button, Result } from 'antd';
import { useMemo, useRef } from 'react';
import {
  CampaignClaimRowFE,
  CampaignClaimsForLootboxResponseFE,
  CAMPAIGN_CLAIMS_FOR_LOOTBOX,
} from '../api.gql';

interface CampaignDistributionProps {
  eventID: TournamentID;
  lootboxID: LootboxID;
  onInviteFanModalToggle: () => void;
}

const YDataLabel = 'campaignName';
const XDataLabel = 'ticketsClaimed';

const CampaignDistribution: React.FC<CampaignDistributionProps> = ({
  eventID,
  lootboxID,
  onInviteFanModalToggle,
}) => {
  const dataMapping = useRef<{ [key: string]: number }>({}); // needed to de-dupe the campaign names :(
  const { data, loading, error } = useQuery<
    CampaignClaimsForLootboxResponseFE,
    QueryCampaignClaimsForLootboxArgs
  >(CAMPAIGN_CLAIMS_FOR_LOOTBOX, {
    variables: {
      tournamentID: eventID,
      lootboxID: lootboxID,
    },
  });

  const convertDataRowFE = (
    row: CampaignClaimRowFE,
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
    return data?.campaignClaimsForLootbox && 'data' in data?.campaignClaimsForLootbox
      ? data.campaignClaimsForLootbox.data.map(convertDataRowFE)
      : [];
  }, [data]);

  if (error || data?.campaignClaimsForLootbox?.__typename === 'ResponseError') {
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
