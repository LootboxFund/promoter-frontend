import { Tabs, Divider } from 'antd';
import { TournamentID } from '@wormgraph/helpers';
import BaseStats from './components/BaseStatistics';
import LootboxClaims from './components/LootboxClaims';
import DailyDistributionHeatmap from './components/DailyDistributionHeatmap';
import ReferrerClaims from './components/ReferrerClaims';
import CampaignDistribution from './components/CampaignDistribution';

export interface EventAnalyticsProps {
  eventID: TournamentID;
}

const EventAnalytics: React.FC<EventAnalyticsProps> = ({ eventID }) => {
  const chartItems = [
    {
      label: 'Lootbox Claims',
      key: 'lootbox-claims',
      children: <LootboxClaims eventID={eventID} />,
    },
    {
      label: 'Promoter Distribution',
      key: 'promoter-distribution',
      children: <ReferrerClaims eventID={eventID} />,
    },
    {
      label: 'Campaign Distribution',
      key: 'campaign-distribution',
      children: <CampaignDistribution eventID={eventID} />,
    },
    {
      label: 'Daily Distribution',
      key: 'daily-distribution',
      children: <DailyDistributionHeatmap eventID={eventID} />,
    },
  ];
  return (
    <>
      <BaseStats eventID={eventID} />
      <Divider />
      <Tabs items={chartItems} />
    </>
  );
};

export default EventAnalytics;
