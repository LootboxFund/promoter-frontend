/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,title 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      {
        name: 'logout',
        path: '/user/logout',
        component: './User/Logout',
      },
    ],
  },
  {
    path: '/dashboard',
    icon: 'TrophyOutlined',
    name: 'Dashboard',
    routes: [
      {
        hideInMenu: true,
        path: '/dashboard',
        redirect: '/dashboard/getting-started',
      },
      {
        name: 'Getting Started',
        path: '/dashboard/getting-started',
        component: './Dashboard/GettingStarted',
      },
      {
        name: 'Events',
        path: '/dashboard/events',
        component: './Dashboard/EventsPage',
      },
      {
        name: 'Event',
        path: '/dashboard/events/id/:eventID',
        hideInMenu: true,
        component: './Dashboard/EventPage',
      },
      {
        name: 'Create Event',
        hideInMenu: true,
        path: '/dashboard/events/create',
        component: './Dashboard/EventCreatePage',
      },
      {
        name: 'Offers',
        path: '/dashboard/offers',
        component: './Dashboard/OffersPage',
      },
      {
        name: 'Offer',
        path: '/dashboard/offers/id/:offerID',
        hideInMenu: true,
        component: './Dashboard/OfferPage',
      },
      {
        name: 'Partners',
        path: '/dashboard/partners',
        component: './Welcome',
        hideInMenu: true,
      },
      {
        name: 'Partner',
        path: '/dashboard/partners/id/:partnerID',
        hideInMenu: true,
        component: './Welcome',
      },
      {
        name: 'Create Lootbox',
        path: '/dashboard/lootbox/create',
        hideInMenu: true,
        component: './Dashboard/LootboxCreatePage',
      },
    ],
  },
  {
    path: '/marketplace',
    icon: 'ShoppingOutlined',
    name: 'Marketplace',
    routes: [
      {
        hideInMenu: true,
        path: '/marketplace',
        redirect: '/marketplace/welcome',
      },
      {
        name: 'Welcome',
        path: '/marketplace/welcome',
        component: './Marketplace/Welcome',
      },
      {
        name: 'Browse',
        path: '/marketplace/browse',
        component: './Marketplace/BrowseOffersPage',
      },
      {
        name: 'Offer',
        path: '/marketplace/offers/id/:offerID',
        component: './Marketplace/PreviewOfferPage',
        hideInMenu: true,
      },
      {
        name: 'Recruit',
        path: '/marketplace/recruit',
        component: './Marketplace/RecruitPromotersPage',
      },
    ],
  },

  {
    path: '/company',
    icon: 'ShopOutlined',
    name: 'Company',
    routes: [
      {
        hideInMenu: true,
        path: '/company',
        redirect: '/company/account',
      },
      {
        name: 'Account',
        path: '/company/account',
        component: './Company/AccountPage',
      },
      {
        name: 'Payouts',
        path: '/company/payouts',
        component: './Company/PayoutsPage',
      },
      {
        name: 'Tiers',
        path: '/company/tiers',
        component: './Company/TierRankPage',
      },
    ],
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin',
        redirect: '/admin/sub-page',
      },
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        component: './Admin',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard/getting-started',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
