import { Address, ChainIDHex, chainIdHexToName, LootboxID } from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import ERC20ABI from '../../api/abi/erc20.json';
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Result,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { $Horizontal, $Vertical, $ColumnGap } from '@/components/generics';
import ConnectWalletButton from '../ConnectWalletButton';
import { useWeb3 } from '@/hooks/useWeb3';
import { ContractTransaction, ethers } from 'ethers';
import { chainIdToHex, getBlockExplorerUrl } from '@/lib/chain';
import { isValidEVMAddress, shortenAddress } from '@/lib/address';
import styles from './index.less';
import useERC20 from '@/hooks/useERC20';
import { Deposit, DepositTypeFE, DepositWeb3 } from '@/hooks/useLootbox';
import { InfoCircleTwoTone, NotificationOutlined } from '@ant-design/icons';
import { LootboxFE } from '@/pages/Dashboard/LootboxPage/api.gql';
import { useAuth } from '@/api/firebase/useAuth';
import { useMutation, useQuery } from '@apollo/client';
import { DEPOSIT_VOUCHER_REWARDS, GET_EXISTING_LOOTBOX_DEPOSITS } from './api.gql';
import {
  DepositVoucherRewardsResponse,
  GetLootboxDepositsResponse,
  MutationDepositVoucherRewardsArgs,
  QueryGetLootboxDepositsArgs,
  ResponseError,
} from '@/api/graphql/generated/types';
import moment from 'moment';

export interface RewardSponsorsPayload {
  rewardType: RewardType;
  amount: ethers.BigNumber;
  tokenAddress?: Address; // undefined == native
}

export enum RewardType {
  Voucher = 'Voucher',
  Native = 'Native',
  Token = 'Token',
}

export interface CheckAllowancePayload {
  amount: ethers.BigNumber;
  tokenAddress: Address;
}

export type DepositRewardForm = {
  chainIDHex?: ChainIDHex;
  lootboxID: LootboxID;
  lootbox: LootboxFE;
  lootboxDeposits: DepositWeb3[];
  onSubmitReward: (payload: RewardSponsorsPayload) => Promise<ContractTransaction>;
  onTokenApprove: (payload: RewardSponsorsPayload) => Promise<ContractTransaction | null>;
  onCheckAllowance: (payload: CheckAllowancePayload) => Promise<boolean>;
  refetchDeposits: () => Promise<void>;
  sendEmails: () => Promise<void>;
  isLootboxFlushed?: boolean;
};

const DepositRewardForm: React.FC<DepositRewardForm> = ({
  lootboxID,
  chainIDHex,
  lootboxDeposits,
  lootbox,
  onSubmitReward,
  onTokenApprove,
  onCheckAllowance,
  refetchDeposits,
  sendEmails,
  isLootboxFlushed,
}) => {
  const { user } = useAuth();
  const { currentAccount, library, network, switchNetwork } = useWeb3();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tokenAddress, _setTokenAddress] = useState<Address>();
  const [tokenName, setTokenName] = useState<string>();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const { getBalance, getNativeBalance, parseAmount } = useERC20({
    chainIDHex,
  });
  const [activeTabKey, setActiveTabKey] = useState('deposit-form');
  const [loadingEmails, setLoadingEmails] = useState(false);

  // query deposits
  const {
    data: existingDepositsData,
    loading: existingDepositsLoading,
    error: existingDepositsError,
  } = useQuery<
    { getLootboxDeposits: GetLootboxDepositsResponse | ResponseError },
    QueryGetLootboxDepositsArgs
  >(GET_EXISTING_LOOTBOX_DEPOSITS, {
    variables: {
      lootboxID: lootboxID,
    },
  });

  // deposit vouchers
  const [depositVoucherRewards, { loading: loadingDepositVoucherRewards }] = useMutation<
    { depositVoucherRewards: DepositVoucherRewardsResponse | ResponseError },
    MutationDepositVoucherRewardsArgs
  >(DEPOSIT_VOUCHER_REWARDS, {
    refetchQueries: [
      {
        query: GET_EXISTING_LOOTBOX_DEPOSITS,
        variables: { lootboxID: lootboxID },
      },
    ],
  });

  const userChainIDHex = network?.chainId ? chainIdToHex(network.chainId) : null;

  const oneTimeVoucherTextRef = useRef<string>('');
  const oneTimeVoucherText = form.getFieldValue('oneTimeVouchers');
  useEffect(() => {
    oneTimeVoucherTextRef.current = oneTimeVoucherText;
  }, [oneTimeVoucherText]);

  const updateTokenSymbol = async (addr: Address) => {
    if (isValidEVMAddress(addr) && library) {
      const signer = await library.getSigner();
      const erc20 = new ethers.Contract(addr, ERC20ABI, signer);
      const name = await erc20.symbol();
      setTokenName(name);
    } else {
      setTokenName('');
    }
  };
  const setTokenAddress = (addr: Address) => {
    _setTokenAddress(addr);
    updateTokenSymbol(addr);
    form.setFieldsValue({ tokenAddress: addr });
  };

  const handleNotifyVictors = async () => {
    setLoadingEmails(true);
    try {
      if (lootboxDeposits.length === 0) {
        throw new Error(
          'Lootbox has no deposits. You should deposit first, before notifying fans.',
        );
      }

      notification.info({
        key: 'sending-email',
        icon: <Spin />,
        message: 'Sending emails...',
        duration: 0,
        placement: 'top',
      });

      await sendEmails();
      Modal.success({
        title: 'Emails sent!',
        content: 'Emails have been sent to all victors.',
      });
    } catch (err) {
      Modal.error({
        title: 'Failure',
        content: `${(err as any | undefined)?.message || 'An error occured'}`,
      });
    } finally {
      notification.close('sending-email');
      setLoadingEmails(false);
    }
  };

  const existingVoucherDeposits = useMemo(() => {
    if (
      existingDepositsData?.getLootboxDeposits &&
      existingDepositsData?.getLootboxDeposits.__typename === 'GetLootboxDepositsResponseSuccess'
    ) {
      const existingDeposits = existingDepositsData?.getLootboxDeposits.deposits;
      return existingDeposits;
    }
    return [];
  }, [existingDepositsData?.getLootboxDeposits]);

  const combinedDeposits = useMemo(() => {
    const convertedLootboxDeposits = lootboxDeposits.map((deposit, i): Deposit => {
      // const timestamp = moment().format('YYYY-MM-DD HH:mm:ss'),
      return {
        id: `${deposit.tokenSymbol}_${i}`,
        title: deposit.tokenSymbol,
        quantity: ethers.utils.formatUnits(deposit.tokenAmount, deposit.decimal),
        type:
          deposit.tokenAddress === ethers.constants.AddressZero
            ? DepositTypeFE.Native
            : DepositTypeFE.Token,
        date: '',
        tokenAddress: deposit?.tokenAddress,
      };
    });
    const convertedVoucherDeposits = existingVoucherDeposits.map((deposit): Deposit => {
      return {
        id: deposit.id,
        title: deposit.title,
        quantity: `${deposit.oneTimeVouchersCount} one-time vouchers${
          deposit.hasReuseableVoucher ? ' & 1 reuseable voucher' : ''
        }`,
        type: DepositTypeFE.Voucher,
        date: moment(deposit.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      };
    });
    const combinedDeposits = [...convertedLootboxDeposits, ...convertedVoucherDeposits];
    const combinedDepositsSorted = combinedDeposits
      .slice()
      .sort((a, b) => (a.date > b.date ? -1 : 1));
    return combinedDepositsSorted;
  }, [lootboxDeposits, existingVoucherDeposits]);

  const resetForm = () => {
    form.resetFields();
  };
  const handleOnRewardSubmit = useCallback(
    async (values) => {
      if (
        !library &&
        (values.rewardType === RewardType.Token || values.rewardType === RewardType.Native)
      ) {
        console.error('no web3 library available');
        return;
      }

      setLoading(true);
      let controlledModal = undefined;
      if (
        chainIDHex &&
        (values.rewardType === RewardType.Token || values.rewardType === RewardType.Native)
      ) {
        try {
          const amount = await parseAmount(
            values.amount,
            (values.rewardType as RewardType) === RewardType.Native
              ? undefined
              : values.tokenAddress,
          );

          let balance: ethers.BigNumber;
          // Make sure user has enough tokens
          if (values.rewardType === RewardType.Token) {
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
              (values.rewardType as RewardType) === RewardType.Token
                ? values.tokenAddress
                : undefined,
          };

          if ((values.rewardType as RewardType) === RewardType.Token) {
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
                      There is a one-time cost associated to this transaction to pay for gas.
                      Lootbox does not receive or control this fee.
                    </i>
                  </span>
                ),
                okButtonProps: { style: { display: 'none' } },
                okCancel: true,
              });

              try {
                // We approve MaxUint256 so that we only need to do it once
                const tx = await onTokenApprove({
                  ...payload,
                  amount: ethers.constants.MaxUint256,
                });

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
                  controlledModal = Modal.warning({
                    maskClosable: false,
                    title: 'Almost done...',
                    content: (
                      <span>Please open your MetaMask wallet and complete the transaction.</span>
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
            type: 'info' as 'info',
            title: 'Depositing Rewards',
            content: (
              <$Vertical spacing={4}>
                <span>
                  Depositing your funds...&nbsp;
                  <b>Please wait while we confirm your transaction.</b>
                </span>
                <br />
                <Spin className={styles.spin} />
                <br />
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

          refetchDeposits();

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
            onOk: resetForm,
          });

          setActiveTabKey('notifyFans');
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
      }
      if (values.rewardType === RewardType.Voucher) {
        const { data } = await depositVoucherRewards({
          variables: {
            payload: {
              lootboxID,
              oneTimeVouchers: values.oneTimeVouchers,
              reuseableVoucher: values.reuseableVoucher,
              title: values.voucherTitle,
            },
          },
        });
        if (!data) {
          setLoading(false);
          throw new Error(`An error occurred!`);
        } else if (data?.depositVoucherRewards?.__typename === 'ResponseError') {
          setLoading(false);
          throw new Error(
            data?.depositVoucherRewards.error?.message ||
              'An error occurred when depositing the voucher rewards',
          );
        }
        setLoading(false);
        Modal.info({
          type: 'success',
          title: 'Success',
          content: (
            <$Vertical spacing={4}>Deposit received! Notify fans with an email blast.</$Vertical>
          ),
          okButtonProps: { style: { display: 'initial' } },
          okCancel: false,
          onOk: () => {
            resetForm();
            setActiveTabKey('deposit-history');
          },
        });
      }
    },
    [onSubmitReward, onTokenApprove],
  );

  const getMeta = () => {
    const infoMeta = {
      columns: 1,
      initialValues: {
        rewardType: RewardType.Voucher,
        amount: '0',
        tokenAddress: undefined,
        voucherTitle: '',
        reuseableVoucher: '',
        oneTimeVouchers: '',
      },
      onChange: (evt: any) => {
        console.log(evt);
      },
      fields: [
        {
          key: 'rewardType',
          label: 'Pick a Reward Method',
          widget: 'select',
          tooltip: `
Voucher is a link or coupon code that fans can redeem as a reward. Fans do not need any blockchain.

The other options require blockchain deployment. Fans will need Metamask to redeem.
Native is the native currency of a chosen blockchain.
Token is an ERC20/BEP20/etc token on a chosen blockchain.
          `,
          required: true,
          options: [RewardType.Voucher, RewardType.Native, RewardType.Token] as RewardType[],
          initialValue: RewardType.Voucher,
          widgetProps: { style: { width: '180px' } },
          preserving: true,
          onChange: () => form.setFieldValue('amount', 0),
        },
      ],
    };

    const rewardType = form.getFieldValue('rewardType') as RewardType;

    if (!!rewardType && rewardType === RewardType.Voucher) {
      infoMeta.fields.push({
        key: 'voucherTitle',
        label: 'Reward Title',
        required: true,
        tooltip: 'The title of the voucher shown to fans. It should be descriptive.',
        // @ts-ignore
        placeholder: 'Reward Title',
        preserving: true,
        rules: [
          {
            max: 30,
            message: 'Title should be less than 30 characters',
          },
        ],
      });
      infoMeta.fields.push({
        key: 'reuseableVoucher',
        label: 'Reuseable Voucher',
        tooltip:
          'All users will be shown this same voucher. Enter a link and/or coupon code that fans can redeem. Be sure to follow the recommended input format.',
        // @ts-ignore
        placeholder: 'url, code',
        preserving: true,
      });
      // @ts-ignore
      infoMeta.fields.push({
        key: 'oneTimeVouchers',
        label: 'One-Time Use Vouchers',
        widget: 'textarea',
        // @ts-ignore
        placeholder: `url1, code1
url2, code2
url3, code3
        `,
        tooltip:
          'Enter a line by line list of coupon codes and/or links that fans can redeem. Each fan will be given one voucher, so they ideally should be one-time use vouchers that expire after redemption. Be sure to follow the recommended input format.',
      });
      infoMeta.fields.push({
        key: 'oneTimeVouchersPreview',
        // @ts-ignore
        widget: () => (
          <fieldset>
            <Form.Item
              wrapperCol={{ span: 16, offset: 8 }}
              className="form-footer"
              style={{ textAlign: 'right' }}
            >
              <span style={{ color: 'gray', margin: '0px 0px 10px 0px' }}>{`${
                !oneTimeVoucherTextRef.current
                  ? 0
                  : (`${oneTimeVoucherTextRef.current} ` || '').split(/[\n\r]/).length
              } Vouchers for ${lootbox.runningCompletedClaims} of ${
                lootbox.maxTickets
              } max tickets`}</span>
            </Form.Item>
          </fieldset>
        ),
      });
      infoMeta.fields.push({
        key: 'submitButton',
        label: '',
        // @ts-ignore
        widget: () => (
          <fieldset>
            <Form.Item
              wrapperCol={{ span: 16, offset: 8 }}
              className="form-footer"
              style={{ textAlign: 'right' }}
            >
              <$Horizontal justifyContent="flex-start">
                <Button htmlType="submit" type="primary" disabled={loading}>
                  {loading ? 'Loading...' : 'Deposit'}
                </Button>
                <Button type="text" onClick={resetForm}>
                  Clear
                </Button>
              </$Horizontal>
            </Form.Item>
          </fieldset>
        ),
      });
    }
    if (
      (rewardType === RewardType.Native || rewardType === RewardType.Token) &&
      (!currentAccount || !userChainIDHex || chainIDHex !== userChainIDHex) &&
      lootbox.address
    ) {
      infoMeta.fields.push({
        key: 'infoTip',
        label: '',
        // @ts-ignore
        widget: () => (
          <fieldset>
            <Form.Item
              wrapperCol={{ span: 18, offset: 4 }}
              className="form-footer"
              style={{ textAlign: 'right' }}
            >
              {!currentAccount || !userChainIDHex ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  imageStyle={{
                    height: 60,
                  }}
                  description={
                    <Typography.Text style={{ maxWidth: '200px' }}>
                      {`You must connect your Metamask wallet before you can deposit rewards`}
                    </Typography.Text>
                  }
                  style={{
                    padding: '50px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    flex: 1,
                  }}
                >
                  <ConnectWalletButton type="default" />
                </Empty>
              ) : chainIDHex && chainIDHex !== userChainIDHex ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  imageStyle={{
                    height: 60,
                  }}
                  description={
                    <Typography.Text style={{ maxWidth: '200px' }}>
                      {`Please switch networks to ${chainIdHexToName(
                        chainIDHex,
                      )} to deposit rewards`}
                    </Typography.Text>
                  }
                  style={{
                    padding: '50px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    flex: 1,
                  }}
                >
                  <Button type="default" onClick={() => switchNetwork(chainIDHex)}>
                    Switch Network
                  </Button>
                </Empty>
              ) : null}
            </Form.Item>
          </fieldset>
        ),
      });

      return infoMeta;
    }
    if (
      (rewardType === RewardType.Native || rewardType === RewardType.Token) &&
      (!lootbox.address || !lootbox.chainIdHex)
    ) {
      infoMeta.fields.push({
        key: 'deployBlockchain',
        label: '',
        // @ts-ignore
        widget: () => (
          <fieldset>
            <Form.Item
              wrapperCol={{ span: 18, offset: 4 }}
              className="form-footer"
              style={{ textAlign: 'right' }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{
                  height: 60,
                }}
                description={
                  <span style={{ maxWidth: '200px' }}>
                    {`This LOOTBOX has not been deployed to the blockchain yet`}
                    &nbsp;
                    <Tooltip
                      title={
                        <span>
                          This Lootbox can not pay out rewards to fans until it is deployed on the
                          Blockchain. To deploy this Lootbox, you must install MetaMask and connect
                          your wallet by clicking below.{' '}
                          <a href="https://lootbox.fyi/3VFzk80" target="_blank" rel="noreferrer">
                            View Tutorial
                          </a>
                        </span>
                      }
                    >
                      <InfoCircleTwoTone />
                    </Tooltip>
                  </span>
                }
                style={{
                  flex: 1,
                  padding: '100px',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <Button type="ghost" href="#create-lootbox-form">
                  Get Started
                </Button>
              </Empty>
            </Form.Item>
          </fieldset>
        ),
      });

      return infoMeta;
    }

    if (!!rewardType && rewardType === RewardType.Token) {
      infoMeta.fields.push({
        key: 'tokenAddress',
        label: 'Token Contract Address',
        required: true,
        // @ts-ignore
        disabled: isLootboxFlushed,
        tooltip:
          'You can find the contract address for the token on CoinMarketCap or a Blockchain Explorer. Make sure you find the contract address for the right blockchain.',
        widget: 'input',
        // @ts-ignore
        onChange: (e: any) => setTokenAddress(e.target.value as Address),
        // @ts-ignore
        // widget: () => {
        //   return (
        //     <$Horizontal verticalCenter>
        //       <Input
        //         value={tokenAddress}
        //         onChange={(e) => setTokenAddress(e.target.value as Address)}
        //         style={{ maxWidth: '300px' }}
        //       />{' '}
        //       <$ColumnGap /> <span style={{ color: 'gray' }}>{tokenName}</span>
        //     </$Horizontal>
        //   );
        // },
        preserving: true,
        widgetProps: { style: { width: '100%', maxWidth: '300px' } } as any,
        // @ts-ignore
        rules: [
          {
            validator: (_rule: any, _value: any, _callback: any) => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
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

    if (!!rewardType && (rewardType === RewardType.Native || rewardType === RewardType.Token)) {
      infoMeta.fields.push({
        key: 'amount',
        label: 'Amount',
        widget: 'number',
        required: true,
        preserving: true,
        // @ts-ignore
        disabled: isLootboxFlushed,
        tooltip: 'Enter the amount that you want to deposit, being mindful of the tokens decimals.',
        widgetProps: { style: { width: '180px' } },
        // @ts-ignore
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
      });
      infoMeta.fields.push({
        key: 'submitButton',
        label: '',
        // @ts-ignore
        widget: () => (
          <fieldset>
            <Form.Item
              wrapperCol={{ span: 16, offset: 8 }}
              className="form-footer"
              style={{ textAlign: 'right' }}
            >
              {currentAccount ? (
                <>
                  <$Horizontal justifyContent="flex-start">
                    <Typography.Text copyable>
                      <span>💳</span>&nbsp;
                      <Tooltip title={`Your connected wallet: ${currentAccount}`}>
                        {shortenAddress(currentAccount)}
                      </Tooltip>
                    </Typography.Text>
                  </$Horizontal>
                  <br />
                </>
              ) : null}
              {!currentAccount ? (
                <ConnectWalletButton />
              ) : (
                <$Horizontal justifyContent="flex-start">
                  <Button htmlType="submit" type="primary" disabled={loading || isLootboxFlushed}>
                    {loading ? 'Loading...' : 'Deposit'}
                  </Button>
                  <Button type="text" onClick={resetForm}>
                    Clear
                  </Button>
                </$Horizontal>
              )}
            </Form.Item>
          </fieldset>
        ),
      });
    }

    return infoMeta;
  };

  const meta = getMeta();
  // Determines if user can send deposit email out
  const isUserTournamentHost =
    user?.id && lootbox?.tournamentSnapshot && user.id === lootbox.tournamentSnapshot.creatorID;

  const tabItems = [
    {
      label: 'Reward Fans',
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
            {isLootboxFlushed &&
              (form.getFieldValue('rewardType') === RewardType.Token ||
                form.getFieldValue('rewardType') === RewardType.Native) && [
                <Alert
                  key="alert1"
                  message="This Lootbox has been FLUSHED. You can no longer deposit on-chain rewards."
                  type="error"
                  showIcon
                  style={{ maxWidth: '560px', margin: 'auto' }}
                />,
                <br key="br2" />,
              ]}
            {/* <legend style={{ textAlign: 'center' }}>Deposit Rewards to Fans</legend> */}
            <FormBuilder form={form} meta={meta} />
          </fieldset>
        </Form>
      ),
    }, // remember to pass the key prop

    {
      label: 'Deposit History',
      key: 'deposit-history',
      children:
        lootboxDeposits.length > 0 || existingVoucherDeposits.length > 0 ? (
          <div>
            <Table
              dataSource={combinedDeposits}
              columns={[
                {
                  title: 'Title',
                  dataIndex: 'title',
                  key: 'title',
                  render: (_, record: Deposit) => {
                    return (
                      <Typography.Text
                        copyable={record.tokenAddress ? { text: record.tokenAddress } : undefined}
                      >
                        {record.title}
                        {record.tokenAddress ? (
                          <Typography.Text>
                            &nbsp;{shortenAddress(record.tokenAddress, 3)}
                          </Typography.Text>
                        ) : null}
                      </Typography.Text>
                    );
                  },
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  render: (_, record: Deposit) => {
                    return record.quantity;
                  },
                },
                {
                  title: 'Type',
                  key: 'type',
                  render: (_value: any, record: Deposit) => {
                    if (record.type === DepositTypeFE.Native) {
                      return <Tag color="purple">Native</Tag>;
                    } else if (record.type === DepositTypeFE.Token) {
                      return <Tag color="gold">Token</Tag>;
                    } else if (record.type === DepositTypeFE.Voucher) {
                      return <Tag color="green">Voucher</Tag>;
                    }
                    return null;
                  },
                },
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                },
              ]}
            />
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Typography.Text>No deposits have been made yet</Typography.Text>}
            style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
          />
        ),
    },
    ...(isUserTournamentHost
      ? [
          {
            label: 'Notify Fans',
            key: 'notifyFans',
            children: lootbox?.tournamentSnapshot?.timestamps?.depositEmailSentAt ? (
              <Result
                status="success"
                title="Fans have been notified!"
                subTitle={`Emails have been sent to fans on ${new Date(
                  lootbox.tournamentSnapshot.timestamps.depositEmailSentAt,
                )}`}
              />
            ) : (
              <Result
                icon={<NotificationOutlined />}
                title="Notify ticket holders to claim their rewards"
                subTitle="This will send an email to all ticket holders with a valid email address"
                extra={
                  <Space direction="vertical" size="large">
                    <Alert
                      showIcon
                      type="warning"
                      message={'You can only do this once per Lootbox'}
                    />
                    <Popconfirm
                      title={`Are you sure? This will send an email to all ticket holders with a valid email address. You can only do this once.`}
                      disabled={loadingEmails}
                      onConfirm={handleNotifyVictors}
                    >
                      <Button type="primary" loading={loadingEmails} disabled={loadingEmails}>
                        Notify Fans
                      </Button>
                    </Popconfirm>
                  </Space>
                }
              />
            ),
          },
        ]
      : []),
  ];

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
        <Tabs
          activeKey={activeTabKey}
          onChange={(key) => setActiveTabKey(key)}
          items={tabItems}
          centered
        />
      </div>
    </Card>
  );
};

export default DepositRewardForm;
