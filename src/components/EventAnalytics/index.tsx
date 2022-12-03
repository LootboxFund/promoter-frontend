import { Col, Row, Statistic, Tabs, Divider } from 'antd';
import { TournamentID } from '@wormgraph/helpers';
import BaseStats from './components/BaseStatistics';
import LootboxDistributionBarChart from './components/LootboxDistributionBarChart';
import DailyDistributionHeatmap from './components/DailyDistributionHeatmap';

export interface EventAnalyticsProps {
  eventID: TournamentID;
}

const EventAnalytics: React.FC<EventAnalyticsProps> = ({ eventID }) => {
  const chartItems = [
    {
      label: 'Team Distribution',
      key: 'team-distribution',
      children: <LootboxDistributionBarChart eventID={eventID} />,
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
