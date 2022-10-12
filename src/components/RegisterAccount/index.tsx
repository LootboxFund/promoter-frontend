import { useAuth } from '@/api/firebase/useAuth';
import { Button, Input, message, Modal, Result } from 'antd';
import { useState } from 'react';
import { $Vertical } from '@/components/generics';
import { UserID } from '@wormgraph/helpers';

export type RegisterAccountProps = {
  isModalOpen: boolean;
  setIsModalOpen: (bool: boolean) => void;
  initialView: 'initial_registration' | 'confirm_upgrade';
};

const RegisterAccount: React.FC<RegisterAccountProps> = ({
  isModalOpen,
  setIsModalOpen,
  initialView,
}) => {
  const { signUpWithEmailAndPassword, upgradeToAffiliate, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState<
    'confirm_upgrade' | 'successful_upgrade' | 'initial_registration' | 'can_login_now'
  >(initialView);

  const handleSignUpWithEmailAndPassword = async () => {
    setLoading(true);
    try {
      await logout();
      await signUpWithEmailAndPassword(email, password, password);
      setUpgradeStatus('can_login_now');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const renderContent = () => {
    if (upgradeStatus === 'can_login_now') {
      return (
        <Result
          title="Successfully Registered"
          subTitle="You can login now"
          status="success"
          extra={[
            <Button
              onClick={() => setIsModalOpen(false)}
              type="primary"
              loading={loading}
              key="close"
            >
              Proceed to Login
            </Button>,
          ]}
        />
      );
    } else if (upgradeStatus === 'confirm_upgrade') {
      return (
        <Result
          title="Upgrade Your Account"
          subTitle="Get access to the Revenue Features of LOOTBOX by upgrading to an Affiliate Account"
          extra={[
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  await upgradeToAffiliate();
                  setUpgradeStatus('successful_upgrade');
                  setLoading(false);
                } catch (e) {
                  console.log(e);
                  message.error('You do not have permission to do this');
                  setLoading(false);
                }
              }}
              type="primary"
              loading={loading}
              key="console"
            >
              CONFIRM UPGRADE
            </Button>,
          ]}
        />
      );
    } else if (upgradeStatus === 'successful_upgrade') {
      return (
        <Result
          status="success"
          title="Congratulations!"
          subTitle="You have upgraded to an Affiliate Account and can now start earning with LOOTBOX!"
          extra={[
            <Button
              onClick={async () => {
                window.location.reload();
              }}
              type="primary"
              key="closemodal"
            >
              Proceed to Dashboard
            </Button>,
          ]}
        />
      );
    }
    return (
      <$Vertical>
        <label>Email</label>
        <Input
          value={email}
          type="email"
          size="large"
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '5px' }}
        />

        <label>Password</label>
        <Input
          value={password}
          size="large"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '10px' }}
        />

        <Button
          onClick={() => handleSignUpWithEmailAndPassword()}
          loading={loading}
          type="primary"
          size="large"
        >
          Register
        </Button>
      </$Vertical>
    );
  };
  return (
    <Modal
      title="Register for Lootbox"
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={false}
    >
      {renderContent()}
    </Modal>
  );
};

export default RegisterAccount;
