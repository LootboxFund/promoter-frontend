import {
  Address,
  AffiliateID,
  ChainIDHex,
  chainIdHexToName,
  LootboxID,
  TournamentID,
} from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import {
  Affix,
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Modal,
  notification,
  Spin,
  Steps,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AntColorPicker, AntUploadFile } from '../AntFormBuilder';
import { $Horizontal, $ColumnGap, $Vertical } from '@/components/generics';
import { placeholderBackground, placeholderImage } from '../generics';
import ConnectWalletButton from '../ConnectWalletButton';
import { SelectChain } from './SelectChain';
import { useAffiliateUser } from '../AuthGuard/affiliateUserInfo';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import { useWeb3 } from '@/hooks/useWeb3';
import LootboxPreview from '../LootboxPreview';
import { chainIdToHex, getBlockExplorerUrl } from '@/lib/chain';
import { LootboxStatus } from '@/api/graphql/generated/types';
import { shortenAddress } from '@/lib/address';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { ContractTransaction } from 'ethers';
import InputMaxTickets, { TargetMaxTicketsWidgetProps } from './InputMaxTickets';

// const DEFAULT_THEME_COLOR = '#00B0FB'
const DEFAULT_THEME_COLOR = '#000000';

interface LootboxBody {
  description: string;
  backgroundImage: string;
  logoImage: string;
  themeColor: string;
  nftBountyValue: string;
  joinCommunityUrl: string;
  name: string;
  maxTickets: number;
  tag: string; // AKA symbol
  tournamentID?: TournamentID;
  address?: Address | null;
  status: LootboxStatus;
  creatorAddress?: Address | null;
  chainIDHex?: ChainIDHex | null;
  runningCompletedClaims: number;
}

export interface CreateLootboxRequest {
  payload: Omit<
    LootboxBody,
    'address' | 'status' | 'chainIDHex' | 'creatorAddress' | 'runningCompletedClaims'
  >;
}

export interface EditLootboxRequest {
  payload: Partial<Omit<LootboxBody, 'address' | 'tag' | 'chainIDHex' | 'creatorAddress'>>;
}

export interface CreateLootboxWeb3Request {
  chainIDHex: ChainIDHex;
  name: string;
  maxTickets: number;
}

export interface MagicLinkParams {
  tournamentID?: TournamentID;
}

interface OnSubmitCreateResponse {
  lootboxID: LootboxID;
}

interface OnCreateLootboxWeb3Response {
  tx: ContractTransaction;
  lootboxID: LootboxID;
}

export type CreateLootboxFormProps = {
  lootbox?: LootboxBody;
  magicLinkParams?: MagicLinkParams;
  onSubmitCreate?: (payload: CreateLootboxRequest) => Promise<OnSubmitCreateResponse>;
  onSubmitEdit?: (payload: EditLootboxRequest) => Promise<void>;
  onCreateWeb3?: (payload: CreateLootboxWeb3Request) => Promise<OnCreateLootboxWeb3Response>;
  mode: 'create' | 'create-web3' | 'edit-only' | 'view-edit' | 'view-only';
};

const LOOTBOX_INFO: LootboxBody = {
  description: '',
  backgroundImage: placeholderBackground,
  logoImage: placeholderImage,
  themeColor: DEFAULT_THEME_COLOR,
  nftBountyValue: '',
  joinCommunityUrl: '',
  name: '',
  maxTickets: 100,
  tag: '',
  status: LootboxStatus.Active,
  runningCompletedClaims: 0,
};
const CreateLootboxForm: React.FC<CreateLootboxFormProps> = ({
  lootbox,
  magicLinkParams,
  onSubmitCreate,
  onSubmitEdit,
  onCreateWeb3,
  mode,
}) => {
  const {
    affiliateUser: { id: affiliateUserID },
  } = useAffiliateUser();
  const { currentAccount, network } = useWeb3();
  const newMediaDestinationLogo = useRef('');
  const newMediaDestinationBackground = useRef('');
  const newThemeColor = useRef<string>();
  const [currentStep, setCurrentStep] = useState(0);

  const [previewMediasLogo, setPreviewMediasLogo] = useState<string[]>([]);
  const [previewMediasBackground, setPreviewMediasBackground] = useState<string[]>([]);
  const [form] = Form.useForm();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [lootboxInfo, setLootboxInfo] = useState<LootboxBody>(LOOTBOX_INFO);
  const [showDeploySuccess, setShowDeploySuccess] = useState(false);
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  const lockedToView = mode === 'view-only';
  const isLootboxDeployed = !!lootboxInfo.address;
  const isOnBlockChain = currentStep === 1;

  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);

  useEffect(() => {
    if (lootbox && mode !== 'create') {
      setLootboxInfo({
        description: lootbox.description,
        backgroundImage: lootbox.backgroundImage,
        logoImage: lootbox.logoImage,
        themeColor: lootbox.themeColor,
        nftBountyValue: lootbox.nftBountyValue,
        joinCommunityUrl: lootbox.joinCommunityUrl,
        name: lootbox.name,
        maxTickets: lootbox.maxTickets,
        tag: lootbox.tag,
        address: lootbox.address,
        status: lootbox.status,
        creatorAddress: lootbox.creatorAddress,
        chainIDHex: lootbox.chainIDHex,
        tournamentID: lootbox.tournamentID,
        runningCompletedClaims: lootbox.runningCompletedClaims,
      });
      newMediaDestinationLogo.current = lootbox.logoImage;
      newMediaDestinationBackground.current = lootbox.backgroundImage;
    }
  }, [lootbox]);

  const resetForm = () => {
    form.resetFields();
    if (!lockedToEdit) {
      setViewMode(true);
    }
    newMediaDestinationLogo.current = lootboxInfo.logoImage;
    newMediaDestinationBackground.current = lootboxInfo.backgroundImage;
    setCurrentStep(0);
    if (mode === 'create') {
      history.back();
    }
  };

  const handleCreateFinish = useCallback(
    async (values) => {
      if (!onSubmitCreate) return;

      const payload: CreateLootboxRequest = {
        payload: {
          name: values.name,
          description: values.description,
          backgroundImage: newMediaDestinationBackground.current,
          logoImage: newMediaDestinationLogo.current,
          themeColor: newThemeColor.current || DEFAULT_THEME_COLOR,
          nftBountyValue: values.nftBountyValue,
          joinCommunityUrl: values.joinCommunityUrl,
          maxTickets: values.maxTickets,
          tag: values.symbol,
          tournamentID: lootbox?.tournamentID,
        },
      };

      setPending(true);
      notification.info({
        key: 'loading-create-lootbox',
        icon: <Spin />,
        message: 'Creating Lootbox',
        description: 'Please wait while we create your lootbox',
        duration: 0,
      });
      try {
        const { lootboxID: createdLootboxID } = await onSubmitCreate(payload);

        if (!lockedToEdit) {
          setViewMode(true);
        }

        Modal.success({
          title: 'Success',
          content: (
            <$Vertical>
              <Typography.Text>
                {mode === 'create' ? 'Lootbox created' : 'Lootbox updated'}
              </Typography.Text>
            </$Vertical>
          ),
          okText: 'Go to Lootbox',
          onOk: () => {
            window.location.href = `/dashboard/lootbox/id/${createdLootboxID}${
              magicLinkParams?.tournamentID ? `?tid=${magicLinkParams.tournamentID}` : ''
            }`;
          },
        });
      } catch (e: any) {
        if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
          return;
        }
        Modal.error({
          title: 'Failure',
          content: `${e.message}`,
        });
      } finally {
        notification.close('loading-create-lootbox');
        setPending(false);
      }
    },
    [onSubmitCreate],
  );

  const handleCreateWeb3 = useCallback(
    async (values) => {
      const targetMaxTickets = values?._max_tickets_widget?.targetMaxTickets as number | undefined;
      if (!onCreateWeb3) return;
      if (!network) return;

      setPending(true);
      try {
        if (!targetMaxTickets) {
          throw new Error('Please enter Max Tickets');
        }

        if (targetMaxTickets % 1 != 0) {
          throw new Error('Max Tickets must be an integer');
        }

        const payload: CreateLootboxWeb3Request = {
          name: values.name,
          maxTickets: targetMaxTickets,
          chainIDHex: values.chain,
        };

        if (targetMaxTickets !== lootboxInfo.maxTickets) {
          if (!onSubmitEdit) return;
          console.log('change max tickets...');

          // CHANGE MAX TICKETS IN WEB2
          await onSubmitEdit({
            payload: {
              maxTickets: targetMaxTickets,
            },
          });
        }

        const { tx } = await onCreateWeb3(payload);

        if (!lockedToEdit) {
          setViewMode(true);
        }
        const chainIDHex = chainIdToHex(network.chainId);
        const explorerURL = getBlockExplorerUrl(chainIDHex);

        resetForm();
        setShowDeploySuccess(true);

        Modal.success({
          title: 'Success',
          content: (
            <$Vertical>
              <Typography.Text>Lootbox deployed</Typography.Text>
              <br />
              <Typography.Text>
                <a href={`${explorerURL}/tx/${tx.hash}`} target="_blank" rel="noreferrer">
                  View transaction on Block Explorer
                </a>
              </Typography.Text>
              <br />
              <Typography.Text>Transaction Hash:</Typography.Text>
              <Typography.Text copyable>{tx.hash}</Typography.Text>
            </$Vertical>
          ),
          okText: 'Finish',
        });
      } catch (e: any) {
        if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
          return;
        }
        Modal.error({
          title: 'Failure',
          content: `${e.message}`,
        });
      } finally {
        setPending(false);
      }
    },
    [onCreateWeb3],
  );

  const handleEditFinish = useCallback(
    async (values) => {
      if (!onSubmitEdit) return;
      const request = { payload: {} } as EditLootboxRequest;

      if (values.name && values.name !== lootboxInfo.name) {
        request.payload.name = values.name;
      }
      if (values.description && values.description !== lootboxInfo.description) {
        request.payload.description = values.description;
      }
      if (
        newMediaDestinationBackground.current &&
        newMediaDestinationBackground.current !== lootboxInfo.backgroundImage
      ) {
        request.payload.backgroundImage = newMediaDestinationBackground.current;
      }
      if (
        newMediaDestinationLogo.current &&
        newMediaDestinationLogo.current !== lootboxInfo.logoImage
      ) {
        request.payload.logoImage = newMediaDestinationLogo.current;
      }
      if (values.logoImage && values.logoImage !== lootboxInfo.logoImage) {
        request.payload.logoImage = newMediaDestinationLogo.current;
      }
      if (newThemeColor.current && newThemeColor.current !== lootboxInfo.themeColor) {
        request.payload.themeColor = newThemeColor.current;
      }
      if (values.nftBountyValue && values.nftBountyValue !== lootboxInfo.nftBountyValue) {
        request.payload.nftBountyValue = values.nftBountyValue;
      }
      if (values.joinCommunityUrl && values.joinCommunityUrl !== lootboxInfo.joinCommunityUrl) {
        request.payload.joinCommunityUrl = values.joinCommunityUrl;
      }
      if (values.status && values.status !== lootboxInfo.status) {
        request.payload.status = values.status;
      }
      if (values.maxTickets && values.maxTickets !== lootboxInfo.maxTickets) {
        request.payload.maxTickets = values.maxTickets;
      }

      setPending(true);
      try {
        if (Object.keys(request.payload).length === 0) {
          throw new Error('Nothing to change');
        }
        await onSubmitEdit(request);
        setPending(false);
        if (!lockedToEdit) {
          setViewMode(true);
        }
        Modal.success({
          title: 'Success',
          content: 'Lootbox updated',
        });
      } catch (e: any) {
        if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
          return;
        }
        console.error(e);
        Modal.error({
          title: 'Failure',
          content: e?.message,
        });
      } finally {
        setPending(false);
      }
    },
    [lootboxInfo, onSubmitEdit],
  );

  const metaPublic = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        {
          key: 'name',
          label: 'Team Name',
          required: true,
          rules: [
            {
              max: 30,
              message: 'Name should be less than 30 characters',
            },
          ],
          tooltip:
            'The display name of the Lootbox. Typically this is the Team name or a variation, since a Lootbox is only used for a single event.',
        },
        {
          key: 'description',
          label: 'Description',
          widget: 'textarea',
          tooltip:
            'Additional information shown publically on your Lootbox. We recommend linking your socials.',
        },
        {
          key: 'nftBountyValue',
          label: 'Max Ticket Value',
          required: true,
          widget: 'input',
          placeholder: 'e.g. $20 USD',
          tooltip:
            'The advertised max value of the Lootbox fan ticket. Calculate this by taking the largest 1st place prize and divide it by the number of tickets in this Lootbox. You can change this field at any time.',
        },
        {
          key: 'maxTickets',
          label: 'Max Tickets',
          required: true,
          widget: 'number',
          tooltip:
            'The maximum number of tickets available for distribution. This determines the payout percentage of your Lootbox. For example, if you set this to 100 tickets, then depositing $100 USD into the LOOTBOX will reward $1 USD per ticket.',
        },
        ...(viewMode
          ? [
              {
                key: 'runningCompletedClaims',
                label: '# Tickets Claimed',
                tooltip:
                  'The number of tickets claimed by fans. When this reaches the max tickets, the LOOTBOX will automatically become sold out.',
                viewWidget: () => {
                  return (
                    <Typography.Text>
                      {lootboxInfo?.runningCompletedClaims || 0} /{' '}
                      {lootboxInfo?.maxTickets || 'N/A'}
                    </Typography.Text>
                  );
                },
              },
            ]
          : []),
        {
          key: 'joinCommunityUrl',
          label: 'Community URL',
          required: false,
          widget: 'input',
          type: 'url',
          tooltip:
            'Link to where you want to funnel your fans who claim these Lootbox tickets. This could be to grow your social media accounts, Discord community, YouTube channel or email mailing list.',
        },
        ...(mode === 'view-edit' || mode === 'view-only'
          ? [
              {
                key: 'status',
                label: 'Status',
                widget: 'select',
                // options: Object.values(LootboxStatus).map((statusOption) => ({
                //   name: _.lowerCase,
                //   value: statusOption,
                // })),
                options: Object.values(LootboxStatus),
                tooltip:
                  "The Lootbox's current status. Sold out Lootboxes still appear on the Viral Onboarding loop, but cannot be claimed. Disbaled Lootboxes will not be visible.",
                viewWidget: () => {
                  if (lootboxInfo?.status === LootboxStatus.SoldOut) {
                    return (
                      <Tooltip title="Disabled Lootboxes are not visible or redeemable for any Tournament">
                        <Tag color="warning">Sold Out</Tag>
                      </Tooltip>
                    );
                  }

                  if (lootboxInfo?.status === LootboxStatus.Disabled) {
                    return (
                      <Tooltip title="Disabled Lootboxes are not visible or redeemable for any Tournament">
                        <Tag color="error">Disabled</Tag>
                      </Tooltip>
                    );
                  }

                  return (
                    <Tooltip title="Active Lootboxes are visible and redeemable by your audience">
                      <Tag color="success">Active</Tag>
                    </Tooltip>
                  );
                },
              },
            ]
          : []),
      ],
    };

    return meta;
  };
  const metaCreative = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        {
          key: 'logoImage',
          label: 'Team Logo',
          required: true,
          rules: [
            {
              validator: (rule: any, value: any, callback: any) => {
                return new Promise((resolve, reject) => {
                  if (mode === 'create' && !newMediaDestinationLogo.current) {
                    reject(new Error(`Upload a Logo`));
                  } else {
                    resolve(newMediaDestinationLogo.current);
                  }
                });
              },
            },
          ],
          widget: () => (
            <AntUploadFile
              affiliateID={affiliateUserID as AffiliateID}
              folderName={AffiliateStorageFolder.LOOTBOX}
              newMediaDestination={newMediaDestinationLogo}
              forceRefresh={() => setPreviewMediasLogo([newMediaDestinationLogo.current])}
              acceptedFileTypes={'image/*'}
            />
          ),
          tooltip:
            'A square image that will be cropped to a circle. Used as your Lootbox centerpiece. Avoid transparent backgrounds.',
        },
        {
          key: 'backgroundImage',
          label: 'Background Image',
          required: true,
          rules: [
            {
              validator: (rule: any, value: any, callback: any) => {
                return new Promise((resolve, reject) => {
                  if (mode === 'create' && !newMediaDestinationBackground.current) {
                    reject(new Error(`Upload a Background Image`));
                  } else {
                    resolve(newMediaDestinationBackground.current);
                  }
                });
              },
            },
          ],
          widget: () => (
            <AntUploadFile
              affiliateID={affiliateUserID as AffiliateID}
              folderName={AffiliateStorageFolder.LOOTBOX}
              newMediaDestination={newMediaDestinationBackground}
              forceRefresh={() =>
                setPreviewMediasBackground([newMediaDestinationBackground.current])
              }
              acceptedFileTypes={'image/*'}
            />
          ),
          tooltip:
            "A portrait image that will be used as your Lootbox's background. Avoid transparent backgrounds.",
        },
        {
          key: 'themeColor',
          label: 'Theme Color',
          required: true,
          widget: () => (
            <AntColorPicker
              initialColor={lootboxInfo.themeColor}
              updateColor={(hex: string) => {
                newThemeColor.current = hex;
                setLootboxInfo({
                  ...lootboxInfo,
                  themeColor: hex,
                });
              }}
            />
          ),
          tooltip:
            "The color that will radiate from your Lootbox's logo and also act as an accent color on generated stamp graphics.",
        },
      ],
    };

    return meta;
  };
  const metaBlockchain = () => {
    const explorerURL = lootboxInfo.chainIDHex ? getBlockExplorerUrl(lootboxInfo.chainIDHex) : null;
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: viewMode
        ? [
            {
              key: 'network',
              label: 'Network',
              viewWidget: () => (
                <Typography.Text>
                  {lootboxInfo.chainIDHex ? chainIdHexToName(lootboxInfo.chainIDHex) : 'Unknown'}
                </Typography.Text>
              ),
            },
            {
              key: 'blockchainExplorer',
              label: 'Lootbox Address',
              // @ts-ignore
              viewWidget: () => (
                <Typography.Link
                  href={`${explorerURL}/address/${lootboxInfo.address}`}
                  target="_blank"
                  rel="noreferrer"
                  copyable
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <Tooltip title={lootboxInfo.address}>
                    {shortenAddress(lootboxInfo.address || '')}
                  </Tooltip>
                </Typography.Link>
              ),
            },
            {
              key: 'lootboxOwner',
              label: 'Owner Address',
              // @ts-ignore
              viewWidget: () => (
                <Typography.Link
                  href={`${explorerURL}/address/${lootboxInfo.creatorAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  copyable
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <Tooltip title={lootboxInfo.creatorAddress}>
                    {shortenAddress(lootboxInfo.creatorAddress || '')}
                  </Tooltip>
                </Typography.Link>
              ),
            },
          ]
        : [
            {
              key: 'chain',
              label: 'Choose a Network',
              widget: SelectChain,
              required: true,
              tooltip:
                'The blockchain network that this Lootbox lives on. The fan prize money must also be distributed on this same blockchain network. Pro Tip: Polygon hos low gas fees.',
            },
            {
              key: 'name',
              label: 'Team Name',
              disabled: true,
              rules: [
                {
                  max: 30,
                  message: 'Name should be less than 30 characters',
                },
              ],
              tooltip:
                'The display name of the Lootbox. Typically this is the Team name or a variation, since a Lootbox is only used for a single event.',
            },
            {
              key: '_max_tickets_widget',
              label: 'Max Tickets',
              required: true,
              forwardeRef: true,
              initialValue: {
                targetMaxTickets: lootboxInfo.runningCompletedClaims,
                _maxTickets: lootboxInfo.maxTickets,
                _runningClaims: lootboxInfo.runningCompletedClaims,
              } as TargetMaxTicketsWidgetProps,
              tooltip:
                'The maximum number of tickets available for distribution. This determines the payout percentage of your Lootbox. For example, if you set this to 100 tickets, then depositing $100 USD into the LOOTBOX will reward $1 USD per ticket.',
              widget: InputMaxTickets,
            },
          ],
    };

    return meta;
  };

  const getWizardMeta = () => {
    const result = {
      steps: [
        {
          title: 'Lootbox Details',
          subSteps: [
            {
              title: 'Public Details',
              meta: metaPublic() as any,
            },
          ],
        },
      ],
    };

    if (!viewMode) {
      result.steps[0].subSteps.push({
        title: 'Lootbox Design',
        meta: metaCreative() as any,
      });
    }

    result.steps.push({
      title: 'Deploy to Blockchain',
      subSteps: [
        {
          title: 'Blockchain Details',
          meta: metaBlockchain() as any,
        },
      ],
    });

    return result;
  };

  const wizardMeta = getWizardMeta();

  const onStepChange = (value: number) => {
    form.resetFields();
    setCurrentStep(value);
  };

  const openBlockChainDeployer = () => {
    setCurrentStep(1);
    setViewMode(false);
  };

  const showConnectButton =
    !viewMode &&
    !!lootboxInfo.address &&
    !!form.getFieldValue('maxTickets') &&
    lootboxInfo.maxTickets !== form.getFieldValue('maxTickets') &&
    !currentAccount;

  return (
    <Card style={{ flex: 1 }}>
      <$Horizontal>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '500px' }}>
          {viewMode && !lockedToEdit && !lockedToView && (
            <Button
              type="link"
              onClick={() => setViewMode(false)}
              style={{ alignSelf: 'flex-end' }}
            >
              Edit
            </Button>
          )}
          <Form
            layout="horizontal"
            form={form}
            onFinish={
              mode === 'create'
                ? handleCreateFinish
                : isOnBlockChain
                ? handleCreateWeb3
                : handleEditFinish
            }
            onValuesChange={forceUpdate}
          >
            {!viewMode && mode !== 'create' && !isLootboxDeployed && (
              <div>
                <Steps current={currentStep} onChange={onStepChange}>
                  {wizardMeta.steps.map((s) => (
                    <Steps.Step key={s.title} title={s.title} />
                  ))}
                </Steps>
                <br />
              </div>
            )}

            {wizardMeta.steps[currentStep].subSteps.map((s, idx) => {
              if (isLootboxDeployed && isOnBlockChain) {
                return null;
              }

              if (!currentAccount && isOnBlockChain) {
                return (
                  <Empty
                    key="connect-wallet-empty"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{
                      height: 60,
                    }}
                    description={
                      <span style={{ maxWidth: '200px' }}>
                        {`You must connect your Metamask wallet before you can create a LOOTBOX`}
                      </span>
                    }
                    style={{
                      padding: '50px',
                      flex: 1,
                      minWidth: '500px',
                      borderRadius: '10px',
                    }}
                  >
                    <ConnectWalletButton ghost />
                  </Empty>
                );
              }

              return (
                <fieldset key={`step-${currentStep}-${idx}`}>
                  <legend>{s.title}</legend>
                  {isOnBlockChain && !isLootboxDeployed && (
                    <>
                      <Alert
                        type="success"
                        message={
                          <span>
                            {
                              'Ready to launch your LOOTBOX? There will a one-time gas fee that LOOTBOX does not control or receive. '
                            }
                            <a>View Tutorial</a>
                          </span>
                        }
                      />
                      <br />
                    </>
                  )}
                  <FormBuilder form={form} meta={s.meta} viewMode={viewMode} />
                </fieldset>
              );
            })}

            {viewMode && (
              <fieldset>
                <legend>{`Blockchain Details`}</legend>
                {showDeploySuccess && (
                  <>
                    <Alert
                      type="success"
                      message="Lootbox deployed successfully"
                      showIcon
                      closable
                      onClose={() => setShowDeploySuccess(false)}
                    />
                    <br />
                  </>
                )}
                {!!lootboxInfo?.address ? (
                  <FormBuilder form={form} meta={metaBlockchain()} viewMode={viewMode} />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{
                      height: 60,
                    }}
                    description={
                      <span style={{ maxWidth: '200px' }}>
                        {`This LOOTBOX has not been deployed to the blockchain yet`}
                        &nbsp;
                        <Tooltip title="This Lootbox can not pay out rewards to fans until it is deployed on the Blockchain. To deploy this Lootbox, you must install MetaMask and connect your wallet by clicking below.">
                          <InfoCircleTwoTone />
                        </Tooltip>
                      </span>
                    }
                    style={{
                      padding: '20px',
                      margin: '0px',
                      flex: 1,
                      minWidth: '500px',
                      borderRadius: '10px',
                    }}
                  >
                    <Button onClick={openBlockChainDeployer}>Deploy to Blockchain</Button>
                  </Empty>
                )}
              </fieldset>
            )}
            {!viewMode && (
              <fieldset>
                {!isOnBlockChain && !isLootboxDeployed && <legend>{`Submit`}</legend>}
                <$Horizontal justifyContent="flex-end">
                  <Form.Item className="form-footer" style={{ width: 'auto' }}>
                    <Button onClick={resetForm} style={{ marginRight: '15px' }}>
                      Cancel
                    </Button>

                    {showConnectButton ? (
                      <ConnectWalletButton style={{ display: 'inline' }} />
                    ) : mode === 'create' ? (
                      <Button htmlType="submit" type="primary" disabled={pending}>
                        {pending ? 'Creating...' : 'Create'}
                      </Button>
                    ) : isOnBlockChain && !isLootboxDeployed && !currentAccount ? (
                      <ConnectWalletButton style={{ display: 'inline' }} />
                    ) : isOnBlockChain && !isLootboxDeployed && currentAccount ? (
                      <Button
                        htmlType="submit"
                        type="primary"
                        disabled={pending || !currentAccount}
                      >
                        {pending ? 'Deploying' : 'Deploy'}
                      </Button>
                    ) : !isOnBlockChain ? (
                      <Button htmlType="submit" type="primary" disabled={pending}>
                        {pending ? 'Updating...' : 'Update'}
                      </Button>
                    ) : null}
                  </Form.Item>
                </$Horizontal>
              </fieldset>
            )}
          </Form>
        </div>
        <$ColumnGap width="50px" />
        {viewMode ? (
          <LootboxPreview
            name={form.getFieldValue('name') || lootboxInfo.name}
            logoImage={newMediaDestinationLogo.current || lootboxInfo.logoImage || placeholderImage}
            backgroundImage={
              newMediaDestinationBackground.current ||
              lootboxInfo.backgroundImage ||
              placeholderBackground
            }
            themeColor={newThemeColor.current || lootboxInfo.themeColor || lootboxInfo.themeColor}
          />
        ) : (
          <Affix offsetTop={70} style={{ pointerEvents: 'none' }}>
            <LootboxPreview
              name={form.getFieldValue('name') || lootboxInfo.name}
              logoImage={newMediaDestinationLogo.current || placeholderImage}
              backgroundImage={newMediaDestinationBackground.current || placeholderBackground}
              themeColor={newThemeColor.current || lootboxInfo.themeColor}
            />
          </Affix>
        )}
      </$Horizontal>
    </Card>
  );
};

export default CreateLootboxForm;
