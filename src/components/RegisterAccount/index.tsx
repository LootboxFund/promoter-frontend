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
  const { signUpWithEmailAndPassword, upgradeToAffiliate, signInWithEmailAndPassword, logout } =
    useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUpWithEmailAndPassword = async () => {
    setLoading(true);
    try {
      await logout();
      await signUpWithEmailAndPassword(email, password, password);
      await signInWithEmailAndPassword(email, password);
      await upgradeToAffiliate();
      window.location.href = '/';
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const renderContent = () => {
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
          onPressEnter={() => handleSignUpWithEmailAndPassword()}
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
