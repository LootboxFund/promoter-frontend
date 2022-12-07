import { Tabs, Divider } from 'antd';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import BaseStats from './components/BaseStatistics';
// import LootboxClaims from './components/LootboxClaims';
// import DailyDistributionHeatmap from './components/DailyDistributionHeatmap';
import ReferrerClaims from './components/ReferrerClaims';
import CampaignDistribution from './components/CampaignDistribution';
import FansReached from './components/FansReached';
// import CampaignDistribution from './components/CampaignDistribution';

export interface EventAnalyticsProps {
  eventID: TournamentID;
  lootboxID: LootboxID;
  onInviteFanModalToggle: () => void;
}

const LootboxAnalytics: React.FC<EventAnalyticsProps> = ({
  eventID,
  lootboxID,
  onInviteFanModalToggle,
}) => {
  const chartItems = [
    //   {
    //     label: 'Lootbox Claims',
    //     key: 'lootbox-claims',
    //     children: <LootboxClaims eventID={eventID} />,
    //   },
    {
      label: 'Fans Reached',
      key: 'fans-distribution',
      children: (
        <FansReached
          eventID={eventID}
          lootboxID={lootboxID}
          onInviteFanModalToggle={onInviteFanModalToggle}
        />
      ),
    },
    {
      label: 'Promoter Distribution',
      key: 'promoter-distribution',
      children: (
        <ReferrerClaims
          eventID={eventID}
          lootboxID={lootboxID}
          onInviteFanModalToggle={onInviteFanModalToggle}
        />
      ),
    },
    {
      label: 'Campaign Distribution',
      key: 'campaign-distribution',
      children: (
        <CampaignDistribution
          eventID={eventID}
          lootboxID={lootboxID}
          onInviteFanModalToggle={onInviteFanModalToggle}
        />
      ),
    },
    //   {
    //     label: 'Daily Distribution',
    //     key: 'daily-distribution',
    //     children: <DailyDistributionHeatmap eventID={eventID} />,
    //   },
  ];
  return (
    <>
      <BaseStats eventID={eventID} lootboxID={lootboxID} />
      <Divider />
      <Tabs items={chartItems} />
    </>
  );
};

export default LootboxAnalytics;
