import { QueryCampaignClaimsForLootboxArgs } from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import { Button, Col, Divider, Result, Row, Statistic, Tooltip, Typography } from 'antd';
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

  const { parsedData, nCampaigns, avgClaims, nClaims } = useMemo(() => {
    const parsedData =
      data?.campaignClaimsForLootbox && 'data' in data?.campaignClaimsForLootbox
        ? data.campaignClaimsForLootbox.data.map(convertDataRowFE)
        : [];
    const nCampaigns = parsedData.filter((a) => a[XDataLabel] > 0).length;
    const nClaims = parsedData.reduce((acc, curr) => acc + curr[XDataLabel], 0);
    const avgClaims = Math.round(nClaims / nCampaigns);
    return {
      parsedData,
      nCampaigns,
      avgClaims,
      nClaims,
    };
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
    height: 520,
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
      <br />
      <Typography.Title level={3}>Tickets Distributed by Campaign</Typography.Title>
      <br />
      <Row gutter={8} wrap>
        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title="Number of distributed tickets for all Campaigns for this Lootbox."
          >
            <Statistic loading={loading} title="Tickets Distributed" value={nClaims} />
          </Tooltip>
        </Col>
        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title='Average number of tickets distributed per Campaign. Defined as "Tickets Distributed" / "# Campaigns".'
          >
            <Statistic loading={loading} title="Average Distribution" value={avgClaims}></Statistic>
          </Tooltip>
        </Col>
        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title="Total number of campaigns that helped distribute tickets for this Lootbox."
          >
            <Statistic loading={loading} title="# Campaign" value={nCampaigns}></Statistic>
          </Tooltip>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={24}>
          <Bar {...config} />
        </Col>
      </Row>
    </div>
  );
};

export default CampaignDistribution;
