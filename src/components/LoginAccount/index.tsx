import { useAuth } from '@/api/firebase/useAuth';
import Footer from '@/components/Footer';
import client from '@/api/graphql/client';

import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { ApolloProvider } from '@apollo/client';
import { FormattedMessage, history, SelectLang } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, { ChangeEvent, useState } from 'react';
import styles from './index.less';
import { auth } from '@/api/firebase/app';
import { CookiesProvider } from 'react-cookie';
import RegisterAccount from '@/components/RegisterAccount';
import ForgotPassword from '../ForgotPassword';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

type BullshitAntProAuthType = {
  username?: string;
  password?: string;
  captcha: string;
  mobile: string;
};

const LoginAccount: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<any>({});
  const [type, setType] = useState<string>('account');
  const persistence: 'session' | 'local' = (localStorage.getItem('auth.persistence') || 'local') as
    | 'local'
    | 'session';
  const [persistenceChecked, setPersistenceChecked] = useState(persistence === 'local');
  const [registrationModal, setRegistrationModal] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const { signInWithEmailAndPassword, sendPhoneVerification, signInPhoneWithCode } = useAuth();

  const [hackyBugFixPhoneInput, setHackyBugFixPhoneInput] = useState<string>('');

  const handleVerificationRequest = async (phone: string) => {
    try {
      await sendPhoneVerification(`+1${phone}`);
      message.success('SMS verification sent to phone. May take up to 30 seconds to arrive');
    } catch (err: any) {
      message.error(err?.message);
    }
  };

  const handleSubmit = async (values: BullshitAntProAuthType) => {
    console.log(values);
    if (values.mobile && values.captcha) {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const user = await signInPhoneWithCode(values.captcha);
        message.success('Phone login successful');
        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = `${window.location.origin}/dashboard/getting-started`;
        return;
      } catch (err: any) {
        message.error(err?.message || 'Phone LoginAccount has failed');
      }
    } else if (values.username && values.password) {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(values.username, values.password);
        message.success('Email login successful');
        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = `${window.location.origin}/dashboard/getting-started`;
        return;
      } catch (err: any) {
        message.error(err?.message || 'Email LoginAccount has failed');
      }
    } else {
      message.error('Please fill in login details');
    }
  };

  const clickRememberMe = (e: ChangeEvent<HTMLInputElement>) => {
    const newPersistenceChecked = e.target.checked;
    setPersistenceChecked(newPersistenceChecked);
    if (newPersistenceChecked) {
      setPersistence(auth, browserLocalPersistence);
      localStorage.setItem('auth.persistence', 'local');
      return;
    } else {
      setPersistence(auth, browserSessionPersistence);
      localStorage.setItem('auth.persistence', 'session');
      return;
    }
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div>
      <div className={styles.content}>
        <LoginForm
          // @ts-ignore
          title={
            <h1 style={{ fontWeight: 900, color: '#26A6EF', fontSize: '2rem' }}>🎁 LOOTBOX</h1>
          }
          subTitle={'Promoter Dashboard'}
          initialValues={{
            autoLogin: true,
          }}
          onChange={(e: any) => {
            if (e.target.id === 'mobile') {
              setHackyBugFixPhoneInput(e.target.value);
            }
          }}
          onFinish={async (values: BullshitAntProAuthType) => {
            await handleSubmit(values);
          }}
        >
          {/* <Tabs activeKey={type} onChange={setType} centered>
            <Tabs.TabPane key="account" tab={'Email LoginAccount'} />
            <Tabs.TabPane key="mobile" tab={'Phone LoginAccount'} />
          </Tabs> */}

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'Email or password was incorrect'} />
          )}

          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder={'Email'}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.username.required"
                      defaultMessage="Email is required"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
              }}
              placeholder={'Password'}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="Password is required"
                    />
                  ),
                },
              ]}
            />
          </>

          {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
          {/* {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="mobile"
                placeholder={'Phone Number'}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'SMS Code'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'sec'}`;
                  }
                  return 'Get Code';
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="Enter verification code"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  console.log(`phone = ${hackyBugFixPhoneInput}`);
                  await handleVerificationRequest(hackyBugFixPhoneInput);
                }}
              />
            </>
          )} */}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="Remember Me" />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
              onClick={() => setForgotPasswordModal(true)}
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="Forgot Password" />
            </a>
          </div>
          <a onClick={() => setRegistrationModal(true)} style={{ marginBottom: '20px' }}>
            Register
          </a>
        </LoginForm>
      </div>
      <div id="recaptcha-container" />
      <RegisterAccount isModalOpen={registrationModal} setIsModalOpen={setRegistrationModal} />
      <ForgotPassword isModalOpen={forgotPasswordModal} setIsModalOpen={setForgotPasswordModal} />
    </div>
  );
};

export default LoginAccount;
