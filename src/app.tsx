import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import { PageLoading, Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import { history, Link } from '@umijs/max';
import { ApolloProvider } from '@apollo/client';
import client from '@/api/graphql/client';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { GET_AFFILIATE_ADMIN_VIEW } from '@/components/LoginAccount/api.gql';
import { AffiliateAdminViewResponse } from './api/graphql/generated/types';
import { AdvertiserID, UserID } from '@wormgraph/helpers';
import AuthGuard from './components/AuthGuard';
import { CookiesProvider } from 'react-cookie';
import React from 'react';
import { Web3Provider } from './hooks/useWeb3';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

export interface UserAdvertiserFE {
  id: AdvertiserID;
  userID: UserID;
  name: string;
  description?: string;
  avatar: string;
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  // currentUser?: UserAdvertiserFE;
  // loading?: boolean;
  // fetchUserInfo?: () => Promise<UserAdvertiserFE | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const response = await client.query<any>({
        query: GET_AFFILIATE_ADMIN_VIEW,
      });

      if (response.data.__typename === 'AffiliateAdminViewResponseSuccess') {
        const userAffiliateFE = {
          id: response.data.affiliateAdminView.id,
          userID: response.data.affiliateAdminView.userID,
          name: response.data.affiliateAdminView.name,
          description: response.data.affiliateAdminView.description,
          avatar: response.data.affiliateAdminView.avatar,
        } as UserAdvertiserFE;
        return userAffiliateFE;
      }
      // console.log(response.data.affiliateAdminView);
      return response.data.affiliateAdminView;
    } catch (error) {
      history.push(loginPath);
      return undefined;
    }
  };
  const x = await fetchUserInfo();

  // 如果不是登录页面，执行
  // if (window.location.pathname !== loginPath) {
  //   const currentUser = await fetchUserInfo();
  //   console.log(`Current User...`);
  //   console.log(currentUser);
  //   return {
  //     fetchUserInfo,
  //     currentUser,
  //     settings: defaultSettings,
  //   };
  // }
  return {
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: any = ({
  initialState,
  setInitialState,
}: {
  initialState: any;
  setInitialState: any;
}) => {
  // console.log(initialState?.settings);
  return {
    rightContentRender: () => <RightContent />,
    waterMarkProps: {},
    footerRender: () => <Footer />,
    onPageChange: () => {
      // const { location } = history;
      // 如果没有登录，重定向到 login
      // if (!initialState?.currentUser && location.pathname !== loginPath) {
      // history.push(loginPath); // @debugnote comment this out if you want ease of dev
      // }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <a key="referral" href="https://lootbox.fyi/3S37QXT" target="_blank" rel="noreferrer">
            <LinkOutlined />
            <span>Referral Program</span>
          </a>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children: any, props: any) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState: any) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

const RootProvider = ({ children, routes }: any) => {
  const newChildren = React.cloneElement(children, {
    ...children.props,
    routes,
  });

  return (
    <ApolloProvider client={client}>
      <Web3Provider>
        <CookiesProvider>
          <AuthGuard>{newChildren}</AuthGuard>
        </CookiesProvider>
      </Web3Provider>
    </ApolloProvider>
  );
};

export function rootContainer(container: any) {
  return React.createElement(RootProvider, null, container);
}

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
