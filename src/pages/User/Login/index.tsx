import Footer from '@/components/Footer';
import LoginAccount from '@/components/LoginAccount';
import React from 'react';
import styles from './index.less';
import { $Vertical } from '@/components/generics';

const Login: React.FC = () => {
  return (
    <div className={styles.container}>
      <div
        style={{
          flex: 1,
          backgroundImage: `url("https://cdn1.dotesports.com/wp-content/uploads/2018/08/11131224/fd54f8f0-590c-426a-9419-f4fa90b1b105.jpg")`,
          backgroundPosition: 'center top',
        }}
      />
      <$Vertical style={{ flex: 1 }}>
        <div
          style={{
            margin: 'auto',
            height: '100%',
            paddingTop: '15%',
          }}
        >
          <LoginAccount />
        </div>
        <Footer />
      </$Vertical>
    </div>
  );
};

export default Login;
