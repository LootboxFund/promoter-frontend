import { Address, ChainIDHex, chainIdHexToName } from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Empty, Form, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { $Horizontal } from '@/components/generics';
import ConnectWalletButton from '../ConnectWalletButton';
import { useWeb3 } from '@/hooks/useWeb3';
import { ethers } from 'ethers';
import { chainIdToHex } from '@/lib/chain';

export interface RewardSponsorsPayload {
  amount: ethers.BigNumber;
  tokenAddress?: Address; // undefined == native
}

export type DepositRewardForm = {
  chainIDHex: ChainIDHex;
  onSubmitReward?: (payload: RewardSponsorsPayload) => Promise<void>;
  onTokenApprove?: (tokenAddress: Address) => Promise<void>;
};

const CreateLootboxForm: React.FC<DepositRewardForm> = ({
  chainIDHex,
  onSubmitReward,
  onTokenApprove,
}) => {
  const { library, network, switchNetwork } = useWeb3();
  const { currentAccount } = useWeb3();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();

  const userChainIDHex = network?.chainId ? chainIdToHex(network.chainId) : null;

  const handleTokenApproval = useCallback(async () => {
    if (!onTokenApprove) {
      return;
    }
    console.log('approve');
  }, [onTokenApprove]);

  const handleOnRewardSubmit = useCallback(
    async (values) => {
      if (!onSubmitReward) return;
      if (!library) {
        console.error('no web3 library available');
        return;
      }

      setLoading(true);
      try {
        // get decimals
        let decimals;
        if (values.rewardType === 'Native') {
          decimals = 18;
        } else {
          const erc20Contract = new ethers.Contract(
            values.tokenAddress,
            ['function decimals() view returns (uint8)'],
            library,
          );
          decimals = await erc20Contract.decimals();
        }
        const amount = ethers.utils.parseUnits(`${values.amount}`, decimals);
        console.log('amount', amount.toString());
        const payload: RewardSponsorsPayload = {
          amount,
          tokenAddress: values.tokenAddress,
        };

        await onSubmitReward(payload);
        Modal.success({
          title: 'Success',
          content: 'Deposit received',
        });
      } catch (e: any) {
        Modal.error({
          title: 'Failure',
          content: `${e.message}`,
        });
      } finally {
        setLoading(false);
      }
    },
    [onSubmitReward],
  );

  const getMeta = () => {
    const meta = {
      columns: 1,
      disabled: loading,
      initialValues: { amount: '0', tokenAddress: undefined },
      fields: [
        {
          key: 'rewardType',
          label: 'Pick a Reward Method',
          widget: 'radio-group',
          options: ['Native', 'ERC20'],
          initialValue: 'Native',
        },
        {
          key: 'amount',
          label: 'Amount',
          widget: 'number',
          required: true,
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

    if (!!form.getFieldValue('rewardType') && form.getFieldValue('rewardType') === 'ERC20') {
      meta.fields.push({
        key: 'address',
        label: 'ERC20 Contract Address',
        required: true,
        widget: 'input',
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

    return meta;
  };

  //   const needsApproval = form.getFieldValue('rewardType') !== 'Native';

  console.log(form.getFieldValue('rewardType'));

  return (
    <Card style={{ flex: 1 }}>
      <$Horizontal>
        {!currentAccount || !userChainIDHex ? (
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
              flex: 1,
              minWidth: '500px',
              borderRadius: '10px',
            }}
          >
            <ConnectWalletButton />
          </Empty>
        ) : chainIDHex !== userChainIDHex ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{
              height: 60,
            }}
            description={
              <span style={{ maxWidth: '200px' }}>
                {`Please switch networks to ${chainIdHexToName(chainIDHex)} to create a LOOTBOX`}
              </span>
            }
            style={{
              padding: '50px',
              flex: 1,
              minWidth: '500px',
              borderRadius: '10px',
            }}
          >
            <Button type="primary" onClick={() => switchNetwork(chainIDHex)}>
              Switch Network
            </Button>
          </Empty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '500px' }}>
            <Form
              layout="horizontal"
              form={form}
              onFinish={handleOnRewardSubmit}
              onValuesChange={forceUpdate}
            >
              <fieldset>
                <legend>{`Reward Sponsors`}</legend>
                <FormBuilder form={form} meta={getMeta()} />
              </fieldset>
              <fieldset>
                <$Horizontal justifyContent="flex-end">
                  <Form.Item className="form-footer" style={{ width: 'auto' }}>
                    {!currentAccount ? (
                      <ConnectWalletButton />
                    ) : (
                      // ) : needsApproval ? (
                      //   <Button type="primary" onClick={handleTokenApproval} disabled={loading}>
                      //     {loading ? 'Approving...' : 'Approve Transfer'}
                      //   </Button>
                      <Button htmlType="submit" type="primary" disabled={loading}>
                        {loading ? 'Depositing...' : 'Deposit'}
                      </Button>
                    )}
                  </Form.Item>
                </$Horizontal>
              </fieldset>
            </Form>
          </div>
        )}
      </$Horizontal>
    </Card>
  );
};

export default CreateLootboxForm;
