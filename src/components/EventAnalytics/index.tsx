import { Tabs, Divider, Tooltip } from 'antd';
import { TournamentID } from '@wormgraph/helpers';
import LootboxClaims from './components/LootboxClaims';
import DailyDistributionHeatmap from './components/DailyDistributionHeatmap';
import ReferrerClaims from './components/ReferrerClaims';
import CampaignDistribution from './components/CampaignDistribution';
import FansReached from './components/FansReached';
import SummaryStatistics from './components/SummaryStatistics';

export interface EventAnalyticsProps {
  eventID: TournamentID;
  onInviteFanModalToggle: () => void;
  eventCreatedAt?: number;
  eventScheduledAt?: number;
}

const EventAnalytics: React.FC<EventAnalyticsProps> = ({
  eventID,
  onInviteFanModalToggle,
  eventCreatedAt,
  eventScheduledAt,
}) => {
  const chartItems = [
    {
      label: 'Summary',
      key: 'summary-statistics',
      tab: (
        <Tooltip title="Your hint that appears after user's mouse will be over the tab title">
          <span>tab title</span>
        </Tooltip>
      ),
      children: (
        <SummaryStatistics eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />
      ),
    },
    {
      label: 'By Lootbox',
      key: 'lootbox-claims',
      children: <LootboxClaims eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />,
    },
    {
      label: 'By Fan',
      key: 'fans-distribution',
      children: <FansReached eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />,
    },
    {
      label: 'By Promoter',
      key: 'promoter-distribution',
      children: (
        <ReferrerClaims eventID={eventID} onInviteFanModalToggle={onInviteFanModalToggle} />
      ),
    },
    {
      label: 'By Campaign',
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
          eventCreatedAt={eventCreatedAt}
          eventScheduledAt={eventScheduledAt}
        />
      ),
    },
  ];
  return (
    <>
      <Tabs items={chartItems} />
    </>
  );
};

export default EventAnalytics;
