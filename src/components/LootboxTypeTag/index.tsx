import { ConsoleSqlOutlined } from '@ant-design/icons';
import { LootboxType } from '@wormgraph/helpers';
import { Tooltip, Tag } from 'antd';
import { FunctionComponent } from 'react';

export interface LootboxTypeTagProps {
  type: LootboxType;
}
const LootboxTypeTag: FunctionComponent<LootboxTypeTagProps> = (props) => {
  if (props.type === LootboxType.Promoter) {
    return (
      <Tooltip title="Promoter Lootboxes do NOT represent a team. They are created when you share your promoter invite link of your event with streamers and KOLs. Use these to boost event marketing and engagement without having to pay out via the fan prize pool.">
        <Tag color="gold">Promoter</Tag>
      </Tooltip>
    );
  }
  if (props.type === LootboxType.Airdrop) {
    return (
      <Tooltip title="Airdrop Lootboxes do NOT represent a team and are NOT publically visible. Use Airdrops to send rewards directly to a group of fans.">
        <Tag color="processing">Airdrop</Tag>
      </Tooltip>
    );
  }

  if (props.type === LootboxType.Compete) {
    // I dont even think compete type is used at all
    return <Tag color="gray">Compete</Tag>;
  }

  // default is player
  return (
    <Tooltip title="Team lootbox competing in your event. These represent your teams & it is expected to yield prizes from the fan prize pool in your event. These are created by default & you can get teams to make their own by sharing the team invite link for your event.">
      <Tag color="cyan">Team</Tag>
    </Tooltip>
  );
};

export default LootboxTypeTag;
