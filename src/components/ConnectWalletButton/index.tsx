import { Button, Typography } from 'antd';
import { shortenAddress } from '@/lib/address';
import { useWeb3 } from '@/hooks/useWeb3';

const ConnectWalletButton = () => {
  const { currentAccount, connectWallet } = useWeb3();

  return (
    <div className="connect-wallet-button">
      {!currentAccount ? (
        <Button type="primary" onClick={connectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <Typography.Text>
          <i>You</i>&nbsp;{shortenAddress(currentAccount)}
        </Typography.Text>
      )}
    </div>
  );
};

export default ConnectWalletButton;
