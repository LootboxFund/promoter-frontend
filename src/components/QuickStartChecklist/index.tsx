import { Avatar, List, Switch } from 'antd';
import { $Horizontal, $Vertical, $ColumnGap } from '@/components/generics';
import styles from './index.less';
import { useEffect, useState } from 'react';
import {
  BorderOutlined,
  CheckCircleFilled,
  CheckOutlined,
  PlayCircleFilled,
  TrophyFilled,
} from '@ant-design/icons';
import { useAffiliateUser } from '../AuthGuard/affiliateUserInfo';

export type QuickStartChecklistProps = {};

const data = [
  {
    title: 'Watch the Getting Started Video',
    description: 'Get a quick overview of the platform and learn how to get started.',
    tutorial: 'https://lootbox.fund',
    action: '/dashboard/getting-started',
    isAdvanced: false,
    key: 'watch-getting-started-video',
  },
  {
    title: 'Fill Out Your Profile',
    description:
      'Customize your profile to help advertisers and partners find you and learn more about you.',
    tutorial: 'https://lootbox.fund',
    examples: 'https://google.com',
    action: '/dashboard/getting-started',
    isAdvanced: true,
    key: 'fill-out-profile',
  },
  {
    title: 'Connect Your Wallet',
    description:
      'Connect your wallet to start earning revenue from the Marketplace and withdraw your earnings.',
    tutorial: 'https://lootbox.fund',
    action: '/dashboard/getting-started',
    isAdvanced: true,
    key: 'connect-wallet',
  },
  {
    title: 'Host Your First Event',
    description: 'Import your existing tournaments or create a new event.',
    tutorial: 'https://lootbox.fund',
    examples: 'https://google.com',
    action: '/dashboard/getting-started',
    isAdvanced: false,
    key: 'host-first-event',
  },
  {
    title: 'Add Revenue Streams',
    description:
      'Add affiliate offers from the Marketplace to start earning from each Lootbox ticket distributed.',
    tutorial: 'https://lootbox.fund',
    examples: 'https://google.com',
    action: '/dashboard/getting-started',
    isAdvanced: true,
    key: 'add-revenue-streams',
  },
  {
    title: 'Recruit Promoters',
    description:
      'Recruit influencers & partners to help promote your events and share the revenue.',
    tutorial: 'https://lootbox.fund',
    examples: 'https://google.com',
    action: '/dashboard/getting-started',
    isAdvanced: true,
    key: 'recruit-promoters',
  },
  {
    title: 'Create Your First Lootbox',
    description: 'Customize a Lootbox using the branding of your favorite team.',
    tutorial: 'https://lootbox.fund',
    examples: 'https://google.com',
    action: '/dashboard/getting-started',
    isAdvanced: false,
    key: 'create-first-lootbox',
  },
  {
    title: 'Share Free Tickets',
    description:
      'Share 10 tickets of your Lootbox with your followers to start building your community.',
    tutorial: 'https://lootbox.fund',
    examples: 'https://google.com',
    action: '/dashboard/getting-started',
    isAdvanced: false,
    key: 'share-free-tickets',
  },
  {
    title: 'Reward Your Fans',
    description: 'Deposit rewards into the Lootbox for ticket holders to redeem their winnings.',
    tutorial: 'https://lootbox.fund',
    examples: 'https://google.com',
    action: '/dashboard/getting-started',
    isAdvanced: true,
    key: 'reward-fans',
  },
  {
    title: 'View Your Earnings',
    description:
      'View the affiliate revenue earned from ticket distribution and withdraw to your wallet.',
    tutorial: 'https://lootbox.fund',
    action: '/dashboard/getting-started',
    isAdvanced: true,
    key: 'view-earnings',
  },
  {
    title: 'Meet the LOOTBOX Team',
    description: 'Schedule a call with the LOOTBOX team to get bonus perks.',
    action: '/dashboard/getting-started',
    isAdvanced: true,
    key: 'meet-lootbox-team',
  },
];

const emptyToDoList: Record<string, boolean> = data.reduce(
  (acc, curr) => {
    return {
      ...acc,
      [curr.key]: false,
    };
  },
  { isAdvancedMode: false },
);

const QuickStartChecklist: React.FC<QuickStartChecklistProps> = ({}) => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const TODO_LIST = `todo-list-promoter-${affiliateID}`;
  const [todoStatuses, setTodoStatuses] = useState(emptyToDoList);
  useEffect(() => {
    // @ts-ignore
    const todo = JSON.parse(localStorage.getItem(TODO_LIST));
    if (todo) {
      setTodoStatuses(todo);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(TODO_LIST, JSON.stringify(todoStatuses));
  }, [todoStatuses]);
  return (
    <section>
      <$Horizontal>
        <$Vertical style={{ flex: 2 }}>
          <$Horizontal justifyContent="space-between">
            <h1
              style={{
                fontSize: '1.5rem',
                color: '#1A1A1A',
                fontWeight: 'bold',
              }}
            >
              {`Getting Started with LOOTBOX`}
            </h1>
            <$Horizontal>
              <span
                style={{
                  color: 'gray',
                  marginRight: '10px',
                  fontWeight: 600,
                }}
              >
                {todoStatuses.isAdvancedMode ? 'Advanced' : 'Simple'}
              </span>
              <Switch
                checked={todoStatuses.isAdvancedMode}
                onChange={() => {
                  setTodoStatuses({
                    ...todoStatuses,
                    isAdvancedMode: !todoStatuses.isAdvancedMode,
                  });
                }}
              />
            </$Horizontal>
          </$Horizontal>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(0,0,0,0.65)',
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '70%',
            }}
          >
            {todoStatuses.isAdvancedMode
              ? `Supercharge your gaming competitions with LOOTBOX fan tickets, which rewards viewers
            with a share of the prize money if their favorite gamer wins. Each free ticket shared can generate affiliate revenue for the event organizer & promoters. We recommend that you watch the below tutorial videos to get started.`
              : `Supercharge your gaming competitions with LOOTBOX fan tickets, which rewards viewers
              with a share of the prize money if their favorite gamer wins. Watch the below tutorial videos to get started.`}
          </p>
        </$Vertical>
        {/* <$Vertical style={{ flex: 1 }}>
          <iframe
            className={styles.video}
            width="100%"
            src="https://www.youtube.com/embed/MxQ0Z6CF91g"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </$Vertical> */}
      </$Horizontal>
      <br />
      <List
        itemLayout="horizontal"
        dataSource={data.filter((d) => (todoStatuses.isAdvancedMode ? true : !d.isAdvanced))}
        renderItem={(item, i) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                todoStatuses[item.key] ? (
                  <CheckCircleFilled
                    onClick={() =>
                      setTodoStatuses({
                        ...todoStatuses,
                        [item.key]: !todoStatuses[item.key],
                      })
                    }
                    style={{ color: 'green', fontSize: '2rem', cursor: 'pointer' }}
                  />
                ) : (
                  <CheckCircleFilled
                    onClick={() =>
                      setTodoStatuses({
                        ...todoStatuses,
                        [item.key]: !todoStatuses[item.key],
                      })
                    }
                    style={{ color: 'rgba(0,0,0,0.1)', fontSize: '2rem', cursor: 'pointer' }}
                  />
                )
              }
              title={<a href={item.action}>{item.title}</a>}
              description={item.description}
            />
            <$Horizontal style={{ width: '250px' }}>
              <a href={item.tutorial} target="_blank" rel="noreferrer">
                <PlayCircleFilled />
                {` Watch Tutorial`}
              </a>
              <$ColumnGap width="30px" />
              {item.examples && (
                <a href={item.examples} target="_blank" rel="noreferrer">
                  <TrophyFilled />
                  {` See Examples`}
                </a>
              )}
            </$Horizontal>
          </List.Item>
        )}
      />
    </section>
  );
};

export default QuickStartChecklist;
