import { QueryCampaignClaimsForTournamentArgs } from '@/api/graphql/generated/types';
import { Bar, BarConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { TournamentID } from '@wormgraph/helpers';
import { Button, Col, Divider, Result, Row, Statistic, Tooltip, Typography } from 'antd';
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

  const { parsedData, nCampaigns, avgClaims, nClaims } = useMemo(() => {
    const parsedData =
      data?.campaignClaimsForTournament && 'data' in data?.campaignClaimsForTournament
        ? data.campaignClaimsForTournament.data.map(convertDataRowFE)
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

  const config: BarConfig = {
    loading,
    data: parsedData,
    xField: XDataLabel,
    yField: YDataLabel,
    height: 520,
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

  return (
    <div>
      <br />
      <Typography.Title level={3}>Tickets Distributed by Campaign</Typography.Title>
      <br />
      <Row gutter={8} wrap>
        <Col sm={24} md={5}>
          <Tooltip
            placement="top"
            title="Number of distributed tickets for all Campaigns in your event."
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
            title="Total number of campaigns that helped distribute tickets."
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
