import { Address, ChainIDHex, chainIdHexToName, LootboxID } from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Empty, Form, Modal, Spin, Tabs, Typography } from 'antd';
import { useCallback, useState } from 'react';
import { $Horizontal, $Vertical } from '@/components/generics';
import ConnectWalletButton from '../ConnectWalletButton';
import { useWeb3 } from '@/hooks/useWeb3';
import { ContractTransaction, ethers } from 'ethers';
import { chainIdToHex, getBlockExplorerUrl } from '@/lib/chain';
import { shortenAddress } from '@/lib/address';
import styles from './index.less';
import useERC20 from '@/hooks/useERC20';
import { manifest } from '@/manifest';

type RewardType = 'Native' | 'ERC20';

export interface RewardSponsorsPayload {
  rewardType: RewardType;
  amount: ethers.BigNumber;
  tokenAddress?: Address; // undefined == native
}

export interface CheckAllowancePayload {
  amount: ethers.BigNumber;
  tokenAddress: Address;
}

export type DepositRewardForm = {
  chainIDHex: ChainIDHex;
  lootboxID: LootboxID;
  onSubmitReward: (payload: RewardSponsorsPayload) => Promise<ContractTransaction>;
  onTokenApprove: (payload: RewardSponsorsPayload) => Promise<ContractTransaction | null>;
  onCheckAllowance: (payload: CheckAllowancePayload) => Promise<boolean>;
};

const CreateLootboxForm: React.FC<DepositRewardForm> = ({
  lootboxID,
  chainIDHex,
  onSubmitReward,
  onTokenApprove,
  onCheckAllowance,
}) => {
  const { currentAccount, library, network, switchNetwork } = useWeb3();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const { getBalance, getNativeBalance, parseAmount } = useERC20({
    chainIDHex,
  });

  const userChainIDHex = network?.chainId ? chainIdToHex(network.chainId) : null;

  const handleOnRewardSubmit = useCallback(
    async (values) => {
      if (!library) {
        console.error('no web3 library available');
        return;
      }

      setLoading(true);
      let controlledModal = undefined;
      try {
        const amount = await parseAmount(
          values.amount,
          (values.rewardType as RewardType) === 'Native' ? undefined : values.tokenAddress,
        );

        let balance: ethers.BigNumber;
        // Make sure user has enough tokens
        if (values.rewardType === 'ERC20') {
          // erc20
          balance = await getBalance(values.tokenAddress, currentAccount);
        } else {
          // native
          balance = await getNativeBalance(currentAccount);
        }

        if (amount.gt(balance)) {
          throw new Error('Insufficient balance');
        }

        const payload: RewardSponsorsPayload = {
          rewardType: values.rewardType as RewardType,
          amount,
          tokenAddress:
            (values.rewardType as RewardType) === 'ERC20' ? values.tokenAddress : undefined,
        };

        if ((values.rewardType as RewardType) === 'ERC20') {
          // Check if within allowance:
          const isWithinAllowance = await onCheckAllowance({
            amount,
            tokenAddress: values.tokenAddress,
          });

          if (!isWithinAllowance) {
            const closeLoadingModal = Modal.info({
              title: 'Approving Transaction',
              content: (
                <span>
                  You must give Lootbox permission to transfer your tokens.{' '}
                  <b>Please approve Lootbox in your wallet.</b>
                  <br />
                  <br />
                  <i>
                    There is a one-time cost associated to this transaction to pay for gas. Lootbox
                    does not receive or control this fee.
                  </i>
                </span>
              ),
              okButtonProps: { style: { display: 'none' } },
              okCancel: true,
            });

            try {
              // We approve MaxUint256 so that we only need to do it once
              const tx = await onTokenApprove({ ...payload, amount: ethers.constants.MaxUint256 });

              if (tx) {
                closeLoadingModal.update({
                  content: (
                    <$Vertical spacing={4}>
                      <span>Waiting for transaction confirmation...</span>
                      <br />
                      <br />
                      <Spin className={styles.spin} />
                    </$Vertical>
                  ),
                  okButtonProps: { style: { display: 'none' } },
                  okCancel: false,
                });

                await tx.wait();
                controlledModal = Modal.success({
                  maskClosable: false,
                  title: 'Deposit Approved',
                  content: (
                    <span>
                      Almost done...&nbsp;
                      <b>Please open your MetaMask wallet and complete the transaction.</b>
                    </span>
                  ),
                  okButtonProps: { style: { display: 'none' } },
                  okCancel: true,
                });
              }
            } catch (err) {
              throw err;
            } finally {
              closeLoadingModal?.destroy();
            }
          }
        }

        // Native
        const tx = await onSubmitReward(payload);
        const modalConfig = {
          title: 'Depositing Rewards',
          content: (
            <$Vertical spacing={4}>
              <span>
                Depositing your funds...&nbsp;
                <b>Please wait while we confirm your transaction.</b>
              </span>
              <br />
              <br />
              <Spin className={styles.spin} />
            </$Vertical>
          ),
          okButtonProps: { style: { display: 'none' } },
          okCancel: false,
        };
        if (controlledModal === undefined) {
          controlledModal = Modal.info(modalConfig);
        } else {
          controlledModal.update(modalConfig);
        }
        await tx.wait();

        console.log('tx', tx.hash);
        const explorerURL = getBlockExplorerUrl(chainIDHex);
        controlledModal.update({
          type: 'success',
          title: 'Success',
          content: (
            <$Vertical spacing={4}>
              Deposit received! View it in explorer:
              <Typography.Link
                href={`${explorerURL}/tx/${tx.hash}`}
                copyable
                target="_blank"
                rel="noreferrer"
              >
                {tx.hash}
              </Typography.Link>
            </$Vertical>
          ),
          okButtonProps: { style: { display: 'initial' } },
          okCancel: false,
        });
      } catch (e: any) {
        if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
          // code === 4001 = user denied signature
          return;
        }

        Modal.error({
          title: 'Failure',
          content: `${e.message}`,
        });
      } finally {
        setLoading(false);
      }
    },
    [onSubmitReward, onTokenApprove],
  );

  const getMeta = () => {
    const infoMeta = {
      columns: 1,
      disabled: loading,
      initialValues: { amount: '0', tokenAddress: undefined },
      fields: [
        {
          key: 'rewardType',
          label: 'Pick a Reward Method',
          widget: 'select',
          options: ['Native', 'ERC20'] as RewardType[],
          initialValue: 'Native',
          widgetProps: { style: { width: '120px' } },
          preserving: true,
          onChange: (evt: any) => {
            form.setFieldValue('amount', 0);
          },
        },
        {
          key: 'amount',
          label: 'Amount',
          widget: 'number',
          required: true,
          preserving: true,
          rules: [
            {
              validator: (_rule: any, value: any, _callback: any) => {
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    if (value <= 0) {
                      reject(new Error(`Must be greater than 0.`));
                    } else {
                      resolve(null);
                    }
                  }, 500);
                });
              },
            },
          ],
        },
      ],
    };

    const rewardType = form.getFieldValue('rewardType') as RewardType;

    if (!!form.getFieldValue('rewardType') && rewardType === 'ERC20') {
      infoMeta.fields.push({
        key: 'tokenAddress',
        label: 'ERC20 Contract Address',
        required: true,
        widget: 'input',
        preserving: true,
        widgetProps: { style: { width: '400px' } } as any,
        rules: [
          {
            validator: (_rule: any, value: any, _callback: any) => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  if (!ethers.utils.isAddress(value)) {
                    reject(new Error(`Invalid Address.`));
                  } else {
                    resolve(null);
                  }
                }, 500);
              });
            },
          },
        ],
      });
    }
    return infoMeta;
  };

  const meta = getMeta();

  const tabItems = [
    {
      label: 'Reward Sponsors',
      key: 'deposit-form',
      children: (
        <Form
          layout="horizontal"
          form={form}
          onFinish={handleOnRewardSubmit}
          onValuesChange={forceUpdate}
        >
          <fieldset>
            <br />
            <FormBuilder form={form} meta={meta} />
          </fieldset>
          <fieldset>
            <Form.Item
              wrapperCol={{ span: 16, offset: 8 }}
              className="form-footer"
              style={{ textAlign: 'right' }}
            >
              {!currentAccount ? (
                <ConnectWalletButton />
              ) : (
                <$Horizontal justifyContent="space-between">
                  {currentAccount ? (
                    <Typography.Text copyable>
                      <span style={{ fontStyle: 'italic' }}>You</span>{' '}
                      {shortenAddress(currentAccount)}
                    </Typography.Text>
                  ) : null}
                  <Button htmlType="submit" type="primary" disabled={loading}>
                    {loading ? 'Loading...' : 'Deposit'}
                  </Button>
                </$Horizontal>
              )}
            </Form.Item>
          </fieldset>
        </Form>
      ),
    }, // remember to pass the key prop
    {
      label: 'Deposit History',
      key: 'deposit-history',
      children: (
        <$Vertical spacing={4}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <$Vertical spacing={2}>
                <Typography.Link
                  href={`${manifest.microfrontends.webflow.cosmicLootboxPage}?lid=${lootboxID}`}
                  target="_blank"
                >
                  View Deposit History
                </Typography.Link>
              </$Vertical>
            }
            style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
          />
        </$Vertical>
      ),
    },
  ];

  if (!currentAccount || !userChainIDHex) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{
          height: 60,
        }}
        description={
          <span style={{ maxWidth: '200px' }}>
            {`You must connect your Metamask wallet before you can deposit rewards`}
          </span>
        }
        style={{
          padding: '50px',
          border: '1px solid rgba(0,0,0,0.1)',
          flex: 1,
        }}
      >
        <ConnectWalletButton />
      </Empty>
    );
  } else if (chainIDHex !== userChainIDHex) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{
          height: 60,
        }}
        description={
          <span style={{ maxWidth: '200px' }}>
            {`Please switch networks to ${chainIdHexToName(chainIDHex)} to deposit rewards`}
          </span>
        }
        style={{
          padding: '50px',
          border: '1px solid rgba(0,0,0,0.1)',
          flex: 1,
        }}
      >
        <Button type="primary" onClick={() => switchNetwork(chainIDHex)}>
          Switch Network
        </Button>
      </Empty>
    );
  }

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: '500px',
        }}
      >
        <Tabs items={tabItems} />
      </div>
    </Card>
  );
};

export default CreateLootboxForm;
