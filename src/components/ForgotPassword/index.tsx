import { auth } from '@/api/firebase/app';
import { Button, Input, Modal } from 'antd';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { $Vertical } from '../generics';

export type ForgotPasswordComponentProps = {
  isModalOpen: boolean;
  setIsModalOpen: (bool: boolean) => void;
};

const ForgotPassword: React.FC<ForgotPasswordComponentProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'ready' | 'loading' | 'check_email'>('ready');
  const handleSendPasswordResetEmail = async () => {
    setStatus('loading');
    await sendPasswordResetEmail(auth, email);
    setStatus('check_email');
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
          style={{ marginBottom: '10px' }}
          onPressEnter={handleSendPasswordResetEmail}
        />

        {status === 'check_email' ? (
          <b style={{ marginTop: '10px', color: 'green' }}>
            ✅ Check your email for password reset link
          </b>
        ) : (
          <Button
            onClick={handleSendPasswordResetEmail}
            loading={status === 'loading'}
            type="primary"
            size="large"
          >
            Reset Password
          </Button>
        )}
      </$Vertical>
    );
  };
  return (
    <Modal
      title="Forgot Password"
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={false}
    >
      {renderContent()}
    </Modal>
  );
};

export default ForgotPassword;
