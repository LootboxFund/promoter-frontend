import { useAuth } from '@/api/firebase/useAuth';
import { Button, Input, message, Modal, Result } from 'antd';
import { useState } from 'react';
import { $Vertical } from '@/components/generics';
import { UserID } from '@wormgraph/helpers';

export type RegisterAccountProps = {
  isModalOpen: boolean;
  setIsModalOpen: (bool: boolean) => void;
};

const RegisterAccount: React.FC<RegisterAccountProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { signUpWithEmailAndPassword, upgradeToAffiliate } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [newUserID, setNewUserID] = useState<UserID>();
  const [upgradeStatus, setUpgradeStatus] = useState<
    'confirm_upgrade' | 'successful_upgrade' | 'initial_registration'
  >('initial_registration');

  const handleSignUpWithEmailAndPassword = async () => {
    setLoading(true);
    try {
      const userID = await signUpWithEmailAndPassword(email, password, password);
      message.success(
        'Registered account! You must now request to be upgraded to an advertiser or affiliate.',
      );
      setUpgradeStatus('confirm_upgrade');
      setNewUserID(userID as UserID);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const renderContent = () => {
    if (upgradeStatus === 'confirm_upgrade') {
      return (
        <Result
          title="Upgrade Your Account"
          subTitle="Get access to the Revenue Features of LOOTBOX by upgrading to an Affiliate Account"
          extra={[
            <Button
              onClick={async () => {
                if (newUserID) {
                  setLoading(true);
                  try {
                    await upgradeToAffiliate(newUserID);
                    setUpgradeStatus('successful_upgrade');
                    setLoading(false);
                  } catch (e) {
                    console.log(e);
                    message.error('You do not have permission to do this');
                    setLoading(false);
                  }
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
          subTitle="You have upgraded to an Affiliate Account and can now start running ads with offers. Login to get started!"
          extra={[
            <Button
              onClick={async () => {
                setIsModalOpen(false);
              }}
              type="primary"
              key="closemodal"
            >
              Login
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
