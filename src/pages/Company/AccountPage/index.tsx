import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button } from 'antd';
import { history, useModel } from '@umijs/max';

import React from 'react';

import styles from './index.less';
import { useAuth } from '@/api/firebase/useAuth';
import { stringify } from 'querystring';

const AccountPage: React.FC = () => {
  const { logout } = useAuth();

  const loginOut = async () => {
    await logout();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };
  // return (
  //   <PageContainer>
  //     <Link to="/user/logout">
  //       <Button type="primary">Logout</Button>
  //     </Link>
  //   </PageContainer>
  // );
  return (
    <PageContainer>
      <Button onClick={() => loginOut()} type="primary">
        Logout
      </Button>
    </PageContainer>
  );
};

export default AccountPage;
