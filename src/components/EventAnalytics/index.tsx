import { Tabs, Divider } from 'antd';
import { TournamentID } from '@wormgraph/helpers';
import BaseStats from './components/BaseStatistics';
import LootboxClaims from './components/LootboxClaims';
import DailyDistributionHeatmap from './components/DailyDistributionHeatmap';
import ReferrerClaims from './components/ReferrerClaims';
import CampaignDistribution from './components/CampaignDistribution';
import FansReached from './components/FansReached';
import FansListTable from './components/FansListTable';

export interface EventAnalyticsProps {
  eventID: TournamentID;
  onInviteFanModalToggle: () => void;
}

const EventAnalytics: React.FC<EventAnalyticsProps> = ({ eventID, onInviteFanModalToggle }) => {
  const chartItems = [
    {
      label: 'Lootbox Claims',
      key: 'lootbox-claims',
      children: <LootboxClaims eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />,
    },
    {
      label: 'List of Fans',
      key: 'fans-list',
      children: <FansListTable eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />,
    },
    {
      label: 'Fans Reached',
      key: 'fans-distribution',
      children: <FansReached eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />,
    },
    {
      label: 'Promoter Distribution',
      key: 'promoter-distribution',
      children: (
        <ReferrerClaims eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />
      ),
    },
    {
      label: 'Campaign Distribution',
      key: 'campaign-distribution',
      children: (
        <CampaignDistribution eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />
      ),
    },
    {
      label: 'Daily Distribution',
      key: 'daily-distribution',
      children: (
        <DailyDistributionHeatmap
          eventID={eventID}
          onInviteFanModalToggle={onInviteFanModalToggle}
        />
      ),
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
