import { Tabs } from 'antd';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import ReferrerClaims from './components/ReferrerClaims';
import CampaignDistribution from './components/CampaignDistribution';
import FansReached from './components/FansReached';
import FansListTableLootbox from './components/FansListTableLootbox';

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
      label: 'List of Fans',
      key: 'fans-list',
      children: <FansListTableLootbox lootboxID={lootboxID} />,
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
      <Tabs items={chartItems} />
    </>
  );
};

export default LootboxAnalytics;
