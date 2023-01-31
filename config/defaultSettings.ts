import { Settings as LayoutSettings } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'LOOTBOX',
  pwa: false,
  // logo: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/apple/118/wrapped-present_1f381.png',
  logo: 'https://storage.googleapis.com/frontend-promoter-dashboard/favicon.ico',
  iconfontUrl: '',
};

export default Settings;
