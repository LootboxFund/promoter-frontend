import { QuestionCircleOutlined } from '@ant-design/icons';
import { ApolloProvider } from '@apollo/client';
import { SelectLang, useModel } from '@umijs/max';
import { Space, Switch } from 'antd';
import React from 'react';
import client from '@/api/graphql/client';
import HeaderSearch from '../HeaderSearch';
import Avatar from './AvatarDropdown';
import styles from './index.less';
import AuthGuard from '../AuthGuard';
import { CookiesProvider, useCookies } from 'react-cookie';
import { THEME_COLOR_BRIGHTNESS } from '@/api/constants';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState, setInitialState }: any = useModel('@@initialState');
  const [cookies, setCookie] = useCookies([THEME_COLOR_BRIGHTNESS]);
  const STORED_THEME_COLOR = cookies[THEME_COLOR_BRIGHTNESS];
  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;

  if (STORED_THEME_COLOR !== navTheme) {
    const updatedSettings = {
      ...initialState,
      settings: {
        ...initialState.settings,
        navTheme: STORED_THEME_COLOR,
      },
    };
    setInitialState(updatedSettings);
  }

  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="站内搜索"
        defaultValue="umi ui"
        options={[
          {
            label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>,
            value: 'umi ui',
          },
          {
            label: <a href="next.ant.design">LOOTBOX</a>,
            value: 'LOOTBOX',
          },
          {
            label: <a href="https://protable.ant.design/">Pro Table</a>,
            value: 'Pro Table',
          },
          {
            label: <a href="https://prolayout.ant.design/">Pro Layout</a>,
            value: 'Pro Layout',
          },
        ]}
        // onSearch={value => {
        //   console.log('input', value);
        // }}
      />
      <span
        className={styles.action}
        onClick={() => {
          window.open('https://pro.ant.design/docs/getting-started');
        }}
      >
        <QuestionCircleOutlined />
      </span>
      <Avatar />
      {/* <SelectLang className={styles.action} /> */}
      <Switch
        checked={navTheme === 'realDark'}
        onChange={() => {
          const newTheme = navTheme === 'realDark' ? 'light' : 'realDark';
          setCookie(THEME_COLOR_BRIGHTNESS, newTheme, { path: '/' });
          const updatedSettings = {
            ...initialState,
            settings: {
              ...initialState.settings,
              navTheme: newTheme,
            },
          };
          setInitialState(updatedSettings);
        }}
        checkedChildren={<span style={{ fontSize: '1.2rem' }}>🌚</span>}
        unCheckedChildren={<span style={{ fontSize: '1.2rem' }}>🌞</span>}
      />
    </Space>
  );
};
export default GlobalHeaderRight;
