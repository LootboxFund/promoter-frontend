import {
  Address,
  AffiliateID,
  ChainIDHex,
  chainIdHexToName,
  LootboxID,
  TournamentID,
} from '@wormgraph/helpers';
import FormBuilder, { Meta } from 'antd-form-builder';
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
  Switch,
  Popconfirm,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AntColorPicker, AntUploadFile, AntUploadMultipleFiles } from '../AntFormBuilder';
import { $Horizontal, $ColumnGap, $Vertical } from '@/components/generics';
import { placeholderBackground, placeholderImage } from '../generics';
import ConnectWalletButton from '../ConnectWalletButton';
import { SelectChain } from './SelectChain';
import { useAffiliateUser } from '../AuthGuard/affiliateUserInfo';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import { useWeb3 } from '@/hooks/useWeb3';
import LootboxPreview from '../LootboxPreview';
import { chainIdToHex, getBlockExplorerUrl } from '@/lib/chain';
import { LootboxAirdropMetadata, LootboxStatus } from '@/api/graphql/generated/types';
import { shortenAddress } from '@/lib/address';
import { CheckCircleOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { ContractTransaction } from 'ethers';
import InputMaxTickets, { TargetMaxTicketsWidgetProps } from './InputMaxTickets';
import { Link } from '@umijs/max';
import SimpleTicket from '../TicketDesigns/SimpleTicket';

const PLACEHOLDER_HEADSHOT =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2F2x3_Placeholder_Headshot.png?alt=media';
const PLACEHOLDER_LOGO =
  'https://storage.googleapis.com/lootbox-constants-prod/assets/placeholder-logo.png';

const DEFAULT_THEME_COLOR = '#000001';

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
  id?: LootboxID;
  safetyFeatures: {
    maxTicketsPerUser?: number | null;
    isExclusiveLootbox?: boolean | null;
  } | null;
  // Web3 data
  flushed?: boolean;
  stampMetadata?: {
    logoURLs?: string[];
    playerHeadshot?: string;
  };
}

export interface CreateLootboxRequest {
  payload: {
    name: string;
    description: string;
    backgroundImage: string;
    logoImage: string;
    themeColor: string;
    nftBountyValue: string;
    joinCommunityUrl: string;
    maxTickets: number;
    tag: string;
    tournamentID?: TournamentID;
    isStampV2?: boolean;
    stampMetatada?: {
      logoURLs?: string[];
      playerHeadshot?: string;
    };
  };
}

export interface EditLootboxRequest {
  payload: {
    name?: string | null;
    description?: string | null;
    backgroundImage?: string | null;
    logoImage?: string | null;
    themeColor?: string | null;
    nftBountyValue?: string | null;
    joinCommunityUrl?: string | null;
    maxTickets?: number | null;
    status?: LootboxStatus | null;
    isExclusiveLootbox?: boolean | null;
    maxTicketsPerUser?: number | null;
    stampMetadata?: {
      logoURLs?: string[];
      playerHeadshot?: string | null;
    };
  };
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

interface OnFlushLootboxResponse {
  tx: ContractTransaction;
}

export type CreateLootboxFormProps = {
  lootbox?: LootboxBody;
  stampImage?: string;
  airdropMetadata?: LootboxAirdropMetadata;
  magicLinkParams?: MagicLinkParams;
  onSubmitCreate?: (payload: CreateLootboxRequest) => Promise<OnSubmitCreateResponse>;
  onSubmitEdit?: (payload: EditLootboxRequest) => Promise<void>;
  onCreateWeb3?: (payload: CreateLootboxWeb3Request) => Promise<OnCreateLootboxWeb3Response>;
  onFlushLootbox?: (targetFlushAddress?: Address) => Promise<OnFlushLootboxResponse>;
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
  maxTickets: 30,
  tag: '',
  status: LootboxStatus.Active,
  runningCompletedClaims: 0,
  safetyFeatures: null,
};
const CreateLootboxForm: React.FC<CreateLootboxFormProps> = ({
  lootbox,
  stampImage,
  magicLinkParams,
  onSubmitCreate,
  onSubmitEdit,
  onCreateWeb3,
  onFlushLootbox,
  airdropMetadata,
  mode,
}) => {
  const CREATE_LOOTBOX_TOURNAMENT_CONFIG = `create-lootbox-tournament-config-${magicLinkParams?.tournamentID}`;
  const [isAdvancedMode, setIsAdvancedMode] = useState(mode === 'create' ? false : true);
  const {
    affiliateUser: { id: affiliateUserID },
  } = useAffiliateUser();
  const { currentAccount, network } = useWeb3();
  const newMediaDestinationLogo = useRef('');
  const newMediaDestinationBackground = useRef('');
  const newMediaDestinationPlayerHeadshot = useRef('');
  const newMediaDestinationLogo_1 = useRef('');
  const newMediaDestinationLogo_2 = useRef('');
  const newMediaDestinationLogo_3 = useRef('');
  const newMediaDestinationLogo_4 = useRef('');
  const newThemeColor = useRef<string>();
  const [currentStep, setCurrentStep] = useState(0);

  const [previewMediasLogo, setPreviewMediasLogo] = useState<string[]>([]);
  const [previewMediasBackground, setPreviewMediasBackground] = useState<string[]>([]);
  const [previewMediasLogos, setPreviewMediasLogos] = useState<string[]>([]);
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
  const [isFlushMode, setIsFlushMode] = useState(false);

  const isStampV2 = !!lootboxInfo?.stampMetadata;

  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'create' && magicLinkParams?.tournamentID) {
      // preload lootbox creation settings based off local storage values
      const { nftBountyValue, maxTickets } = JSON.parse(
        localStorage.getItem(CREATE_LOOTBOX_TOURNAMENT_CONFIG) || '{}',
      );
      const fromMemoryConfig = {
        ...lootboxInfo,
      };
      if (!!nftBountyValue) {
        fromMemoryConfig.nftBountyValue = nftBountyValue;
      }
      if (!!maxTickets) {
        fromMemoryConfig.maxTickets = maxTickets;
      }

      setLootboxInfo(fromMemoryConfig);
    }
  }, [magicLinkParams?.tournamentID]);

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
        flushed: lootbox.flushed,
        safetyFeatures: lootbox.safetyFeatures,
        stampMetadata: lootbox.stampMetadata,
      });
      newMediaDestinationLogo.current = lootbox.logoImage;
      newMediaDestinationBackground.current = lootbox.backgroundImage;
      if (lootbox?.stampMetadata?.playerHeadshot) {
        newMediaDestinationPlayerHeadshot.current = lootbox.stampMetadata.playerHeadshot;
      }
      if (lootbox?.stampMetadata?.logoURLs?.[0]) {
        newMediaDestinationLogo_1.current = lootbox.stampMetadata.logoURLs[0];
      }

      if (lootbox?.stampMetadata?.logoURLs?.[1]) {
        newMediaDestinationLogo_2.current = lootbox.stampMetadata.logoURLs[1];
      }
      if (lootbox?.stampMetadata?.logoURLs?.[2]) {
        newMediaDestinationLogo_3.current = lootbox.stampMetadata.logoURLs[2];
      }
      if (lootbox?.stampMetadata?.logoURLs?.[3]) {
        newMediaDestinationLogo_4.current = lootbox.stampMetadata.logoURLs[3];
      }
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
    setIsFlushMode(false);
    if (mode === 'create') {
      history.back();
    }
  };

  const updateLocalStorageCreateLootboxConfig = ({
    nftBountyValue,
    maxTickets,
  }: {
    nftBountyValue: string;
    maxTickets: number;
  }) => {
    const config = JSON.parse(localStorage.getItem(CREATE_LOOTBOX_TOURNAMENT_CONFIG) || '{}');
    const newConfig = {
      ...config,
      nftBountyValue: nftBountyValue,
      maxTickets: maxTickets,
    };
    localStorage.setItem(CREATE_LOOTBOX_TOURNAMENT_CONFIG, JSON.stringify(newConfig));
    return newConfig;
  };

  const handleCreateFinish = useCallback(
    async (values) => {
      console.log('submit', values);
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
          isStampV2: true,
          stampMetatada: {
            playerHeadshot: newMediaDestinationPlayerHeadshot.current ?? undefined,
            logoURLs: [
              newMediaDestinationLogo_1.current,
              newMediaDestinationLogo_2.current,
              newMediaDestinationLogo_3.current,
              newMediaDestinationLogo_4.current,
            ].filter((a) => !!a),
          },
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
        const { nftBountyValue, maxTickets } = JSON.parse(
          localStorage.getItem(CREATE_LOOTBOX_TOURNAMENT_CONFIG) || '{}',
        );
        updateLocalStorageCreateLootboxConfig({
          nftBountyValue: values.nftBountyValue || nftBountyValue,
          maxTickets: values.maxTickets || maxTickets,
        });
        const { lootboxID: createdLootboxID } = await onSubmitCreate(payload);

        if (!lockedToEdit) {
          setViewMode(true);
        }

        Modal.confirm({
          title: 'Success',
          icon: <CheckCircleOutlined style={{ color: 'green' }} />,
          content: (
            <$Vertical>
              <Typography.Text>
                {mode === 'create' ? (
                  <span>
                    Lootbox created,{' '}
                    <a
                      href={`/dashboard/lootbox/id/${createdLootboxID}${
                        magicLinkParams?.tournamentID ? `?tid=${magicLinkParams.tournamentID}` : ''
                      }`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      view here.
                    </a>
                  </span>
                ) : (
                  'Lootbox updated'
                )}
              </Typography.Text>
            </$Vertical>
          ),
          okText: 'Create Another',
          cancelText: 'View All',
          onOk: () => {
            // refresh the page
            location.reload();
          },
          onCancel: () => {
            window.location.href = `/dashboard/events/id/${magicLinkParams?.tournamentID}#lootbox-gallery`;
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

  const handleFlush = useCallback(
    async (values) => {
      if (!onFlushLootbox) return;
      if (!network) return;

      const chainIDHex = chainIdToHex(network.chainId);
      const explorerURL = getBlockExplorerUrl(chainIDHex);

      setPending(true);
      try {
        // if (true) {
        //   throw new Error('Throw DEV ERROR');
        // }
        console.log('flushing...');

        notification.info({
          key: 'metamask-flush',
          message: 'Confirm the transaction in Metamask',
          description: 'Please confirm the transaction in your Metamask wallet',
          placement: 'top',
          duration: null,
        });

        const { tx } = await onFlushLootbox();

        notification.close('metamask-flush');

        notification.info({
          key: 'loading-flush-lootbox',
          icon: <Spin />,
          message: 'Flushing Lootbox',
          description: (
            <$Vertical>
              <Typography.Text>
                <a href={`${explorerURL}/tx/${tx.hash}`} target="_blank" rel="noreferrer">
                  View transaction on Block Explorer.
                </a>
                &nbsp; Please wait while we flush your Lootbox. This happens on the blockchain and
                it might take a minute.
              </Typography.Text>
            </$Vertical>
          ),
          duration: 0,
          placement: 'top',
        });

        await tx.wait();

        if (!lockedToEdit) {
          setViewMode(true);
        }
        setIsFlushMode(false);
        resetForm();

        Modal.success({
          title: 'Success',
          content: (
            <$Vertical>
              <Typography.Text>Lootbox Successfully Flushed</Typography.Text>
              <br />
              <Typography.Text>
                <a href={`${explorerURL}/tx/${tx.hash}`} target="_blank" rel="noreferrer">
                  View transaction on Block Explorer
                </a>
              </Typography.Text>
              <br />
              <Typography.Text>Transaction Hash:</Typography.Text>
              <Typography.Text copyable>{tx.hash}</Typography.Text>
              <br />
              <Alert
                type="info"
                message="This Lootbox has been flushed. Claimers will no longer be able to extract funds from it. This is irreversible."
              />
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
          content: `${e?.reason || e?.message}`,
        });
      } finally {
        notification.close('metamask-flush');
        notification.close('loading-flush-lootbox');
        setPending(false);
      }
    },
    [onFlushLootbox],
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
      const request: EditLootboxRequest = { payload: {} };

      if (values.name != undefined && values.name !== lootboxInfo.name) {
        request.payload.name = values.name;
      }
      if (values.description != undefined && values.description !== lootboxInfo.description) {
        request.payload.description = values.description;
      }
      if (
        newMediaDestinationBackground.current != undefined &&
        newMediaDestinationBackground.current !== lootboxInfo.backgroundImage
      ) {
        request.payload.backgroundImage = newMediaDestinationBackground.current;
      }
      if (
        newMediaDestinationPlayerHeadshot.current !== undefined &&
        newMediaDestinationPlayerHeadshot.current !== '' &&
        newMediaDestinationPlayerHeadshot.current !== lootboxInfo.stampMetadata?.playerHeadshot
      ) {
        request.payload.stampMetadata = {
          ...(request.payload?.stampMetadata || {}),
          playerHeadshot: newMediaDestinationPlayerHeadshot.current,
        };
      }
      const dupedLogoURLS = [
        newMediaDestinationLogo_1.current,
        lootboxInfo.stampMetadata?.logoURLs?.[0],
        newMediaDestinationLogo_2.current,
        lootboxInfo.stampMetadata?.logoURLs?.[1],
        newMediaDestinationLogo_3.current,
        lootboxInfo.stampMetadata?.logoURLs?.[2],
        newMediaDestinationLogo_4.current,
        lootboxInfo.stampMetadata?.logoURLs?.[3],
      ];
      // Remove duplicates of logoURLS
      var logoURLs = dupedLogoURLS.filter((v, i, a) => a.indexOf(v) === i);

      if (
        logoURLs.some((val, idx) => {
          return (
            val !== undefined && val !== '' && val !== lootboxInfo.stampMetadata?.logoURLs?.[idx]
          );
        })
      ) {
        request.payload.stampMetadata = {
          ...(request.payload?.stampMetadata || {}),
          logoURLs: logoURLs.filter((url) => url !== undefined && url !== '') as string[],
        };
      }
      if (
        newMediaDestinationLogo.current != undefined &&
        newMediaDestinationLogo.current !== lootboxInfo.logoImage
      ) {
        request.payload.logoImage = newMediaDestinationLogo.current;
      }
      // if (values.logoImage != undefined && values.logoImage !== lootboxInfo.logoImage) {
      //   request.payload.logoImage = newMediaDestinationLogo.current;
      // }
      if (newThemeColor.current != undefined && newThemeColor.current !== lootboxInfo.themeColor) {
        request.payload.themeColor = newThemeColor.current;
      }
      if (
        values.nftBountyValue != undefined &&
        values.nftBountyValue !== lootboxInfo.nftBountyValue
      ) {
        request.payload.nftBountyValue = values.nftBountyValue;
      }
      if (
        values.joinCommunityUrl != undefined &&
        values.joinCommunityUrl !== lootboxInfo.joinCommunityUrl
      ) {
        request.payload.joinCommunityUrl = values.joinCommunityUrl;
      }
      if (values.status != undefined && values.status !== lootboxInfo.status) {
        request.payload.status = values.status;
      }
      if (values.maxTickets != undefined && values.maxTickets !== lootboxInfo.maxTickets) {
        request.payload.maxTickets = values.maxTickets;
      }
      if (
        values.safetyFeatures?.isExclusiveLootbox != undefined &&
        values.safetyFeatures.isExclusiveLootbox !== lootboxInfo.safetyFeatures?.isExclusiveLootbox
      ) {
        request.payload.isExclusiveLootbox = values.safetyFeatures.isExclusiveLootbox;
      }
      if (
        values.safetyFeatures?.maxTicketsPerUser != undefined &&
        values.safetyFeatures.maxTicketsPerUser !== lootboxInfo.safetyFeatures?.maxTicketsPerUser
      ) {
        request.payload.maxTicketsPerUser = values.safetyFeatures.maxTicketsPerUser;
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

  const metaSimple = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        {
          key: 'name',
          label: 'Team Name',
          placeholder: 'Optional',
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
          key: 'quickInfo',
          label: 'Defaults',
          tooltip:
            'These are the default values for this Event. If you want to change this, use advanced mode and your defaults will automatically be the last values you used.',
          widget: () => (
            <i style={{ color: 'gray' }}>{`${lootboxInfo.maxTickets} Max Tickets, Prize ${
              lootboxInfo.nftBountyValue || 'TBD'
            }`}</i>
          ),
        },
      ],
    };

    return meta;
  };

  const metaFlush = () => {
    const explorerURL = lootboxInfo.chainIDHex ? getBlockExplorerUrl(lootboxInfo.chainIDHex) : null;
    const meta: Meta = {
      columns: 1,
      initialValues: lootboxInfo,
      // disabled: pending,
      // initialValues: lootboxInfo,
      fields: [
        {
          key: 'lootboxAddr',
          label: 'Lootbox Address',
          viewMode: true,
          viewWidget: () => (
            <Typography.Link
              href={`${explorerURL}/address/${lootboxInfo.address}`}
              target="_blank"
              rel="noreferrer"
              copyable={{
                text: lootboxInfo.address || undefined,
              }}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              <Tooltip title={lootboxInfo.address}>
                {shortenAddress(lootboxInfo.address || '')}
              </Tooltip>
            </Typography.Link>
          ),
        },
        {
          key: 'lootboxOwnerFlush',
          label: 'Owner Address',
          viewMode: true,
          viewWidget: () => (
            <Typography.Link
              href={`${explorerURL}/address/${lootboxInfo.creatorAddress}`}
              target="_blank"
              rel="noreferrer"
              copyable={{
                text: lootboxInfo.creatorAddress || undefined,
              }}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              <Tooltip title={lootboxInfo.creatorAddress}>
                {shortenAddress(lootboxInfo.creatorAddress || '')}
              </Tooltip>
            </Typography.Link>
          ),
        },
        {
          key: 'currentAccountFlush',
          label: 'Your Address',
          viewMode: true,
          viewWidget: () => (
            <div>
              {currentAccount ? (
                <Typography.Link
                  href={`${explorerURL}/address/${currentAccount}`}
                  target="_blank"
                  rel="noreferrer"
                  copyable={{
                    text: currentAccount || undefined,
                  }}
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <Tooltip title={currentAccount}>{shortenAddress(currentAccount || '')}</Tooltip>
                </Typography.Link>
              ) : (
                <Typography.Text italic>Not connected</Typography.Text>
              )}
              {currentAccount &&
                currentAccount.toLowerCase() !== lootboxInfo.creatorAddress?.toLowerCase() && (
                  <div>
                    <br />
                    <Alert
                      showIcon
                      type="error"
                      message={
                        <span>
                          Only the owner can flush. Switch to&nbsp;
                          <Tooltip title={lootboxInfo.creatorAddress}>
                            {shortenAddress(lootboxInfo.creatorAddress || '')}.
                          </Tooltip>
                        </span>
                      }
                    />
                  </div>
                )}
            </div>
          ),
        },
      ],
    };

    return meta;
  };

  const metaPublic = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        {
          key: 'name',
          label: 'Team Name',
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
          placeholder: 'e.g. $20 USD',
          tooltip:
            'The advertised max value of the Lootbox fan ticket. Calculate this by taking the largest 1st place prize and divide it by the number of tickets in this Lootbox. You can change this field at any time.',
        },
        {
          key: 'maxTickets',
          label: 'Max Tickets',
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
                  return (
                    <$Horizontal>
                      {lootboxInfo?.status === LootboxStatus.SoldOut ? (
                        <$Horizontal>
                          <Tooltip title="Disabled Lootboxes are not visible or redeemable for any Tournament">
                            <Tag color="warning">Sold Out</Tag>
                          </Tooltip>
                        </$Horizontal>
                      ) : lootboxInfo?.status === LootboxStatus.Disabled ? (
                        <$Horizontal>
                          <Tooltip title="Disabled Lootboxes are not visible or redeemable for any Tournament">
                            <Tag color="error">Disabled</Tag>
                          </Tooltip>
                        </$Horizontal>
                      ) : (
                        <$Horizontal>
                          <Tooltip title="Active Lootboxes are visible and redeemable by your audience">
                            <Tag color="green">Active</Tag>
                          </Tooltip>
                        </$Horizontal>
                      )}
                      {airdropMetadata && <Tag color="processing">Airdrop</Tag>}
                      {lootboxInfo.address && (
                        <Tooltip title="This Lootbox is deployed on the Blockchain">
                          <Tag color="geekblue">Deployed</Tag>
                        </Tooltip>
                      )}
                    </$Horizontal>
                  );
                },
              },
            ]
          : []),
      ],
    };

    return meta;
  };

  const metaAirdrop = () => {
    if (!airdropMetadata) {
      return {
        columns: 1,
        disabled: true,
        fields: [],
      };
    }
    const meta = {
      columns: 1,
      disabled: true,
      fields: [
        {
          key: 'title',
          label: 'Batch Name',
          tooltip: 'The internal name of the Airdrop Batch.',
          viewWidget: () => <span>{airdropMetadata.title}</span>,
        },
        {
          key: 'value',
          label: 'Reward Value',
          tooltip: 'The advertised value of the airdrop reward',
          viewWidget: () => <span>{airdropMetadata.value}</span>,
        },
        {
          key: 'oneLiner',
          label: 'One Liner',
          tooltip: 'The one line description shown to users',
          viewWidget: () => <span>{airdropMetadata.oneLiner}</span>,
        },
        {
          key: 'instructionsLink',
          label: 'Instructions',
          tooltip: 'The link to the instructions on how to claim this Airdrop',
          viewWidget: () => (
            <a href={airdropMetadata.instructionsLink || ''} target="_blank" rel="noreferrer">
              {airdropMetadata.instructionsLink}
            </a>
          ),
        },
        {
          key: 'viewOffer',
          label: 'Origin',
          tooltip: 'The original offer that this Airdrop is from',
          viewWidget: () => (
            <Link to={`/dashboard/offers/id/${airdropMetadata.offerID}`}>View Offer</Link>
          ),
        },
      ],
    };

    return meta;
  };
  const metaSafety = () => {
    const meta: Meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        {
          key: 'safetyFeatures.isExclusiveLootbox',
          label: 'Exclusive Lootbox',
          widget: 'checkbox',
          tooltip:
            'When checked this Lootbox will not appear in fan referral links, and cannot be claimed by any referral link other than your own. Bonus rewards are also disabled by default.',
          viewWidget: () => {
            if (lootboxInfo?.safetyFeatures?.isExclusiveLootbox) {
              return <Tag color="purple">Exclusive</Tag>;
            } else {
              return <Tag color="green">Public</Tag>;
            }
          },
        },
        {
          key: 'safetyFeatures.maxTicketsPerUser',
          label: 'Max Tickets Per User',
          widget: 'number',
          tooltip:
            'The maximum number of tickets a user can claim for this Lootbox (includes bonus rewards & airdrops)',
        },
      ],
    };
    return meta;
  };
  const metaCreative = () => {
    const meta: Meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        ...(!isStampV2 && mode !== 'create'
          ? [
              {
                key: 'logoImage',
                label: 'Team Logo',
                // rules: [
                //   {
                //     validator: (rule: any, value: any, callback: any) => {
                //       return new Promise((resolve, reject) => {
                //         if (mode === 'create' && !newMediaDestinationLogo.current) {
                //           reject(new Error(`Upload a Logo`));
                //         } else {
                //           resolve(newMediaDestinationLogo.current);
                //         }
                //       });
                //     },
                //   },
                // ],
                widget: () => (
                  <AntUploadFile
                    affiliateID={affiliateUserID as AffiliateID}
                    folderName={AffiliateStorageFolder.LOOTBOX}
                    newMediaDestination={newMediaDestinationLogo}
                    forceRefresh={() => setPreviewMediasLogo([])}
                    acceptedFileTypes={'image/*'}
                  />
                ),
                tooltip:
                  'A square image that will be cropped to a circle. Used as your Lootbox centerpiece. Avoid transparent backgrounds.',
              },
            ]
          : []),
        {
          key: 'stampMetadata.playerHeadshot',
          label: 'Player Headshot',
          widget: () => (
            <AntUploadFile
              affiliateID={affiliateUserID as AffiliateID}
              folderName={AffiliateStorageFolder.HEADSHOT}
              newMediaDestination={newMediaDestinationPlayerHeadshot}
              forceRefresh={() => setPreviewMediasLogo([newMediaDestinationPlayerHeadshot.current])}
              acceptedFileTypes={'image/*'}
            />
          ),
          tooltip:
            'This should be a full frontal picture of the team captain / player. Transparent backgrounds HIGHLY recommended. Portrait orientation is perferred.',
        },
        {
          key: 'backgroundImage',
          label: 'Background Image',
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
          key: 'stampMetadata.logoURLs',
          label: 'Logo Images',
          widget: () => (
            <AntUploadMultipleFiles
              affiliateID={affiliateUserID as AffiliateID}
              folderName={AffiliateStorageFolder.LOOTBOX}
              newMediaDestination={[
                newMediaDestinationLogo_1,
                newMediaDestinationLogo_2,
                newMediaDestinationLogo_3,
                newMediaDestinationLogo_4,
              ]}
              forceRefresh={() =>
                setPreviewMediasLogos([
                  newMediaDestinationLogo_1.current,
                  newMediaDestinationLogo_2.current,
                  newMediaDestinationLogo_3.current,
                  newMediaDestinationLogo_4.current,
                ])
              }
              acceptedFileTypes={'image/*'}
            />
          ),
          tooltip:
            '4 Logo images allowed. Ideally landscape orientation. These will be converted to greyscale.',
        },
        {
          key: 'themeColor',
          label: 'Theme Color',
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
    const meta: Meta = {
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
              viewWidget: () => (
                <Typography.Link
                  href={`${explorerURL}/address/${lootboxInfo.address}`}
                  target="_blank"
                  rel="noreferrer"
                  copyable={{
                    text: lootboxInfo.address || undefined,
                  }}
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
              viewWidget: () => (
                <Typography.Link
                  href={`${explorerURL}/address/${lootboxInfo.creatorAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  copyable={{
                    text: lootboxInfo.creatorAddress || undefined,
                  }}
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <Tooltip title={lootboxInfo.creatorAddress}>
                    {shortenAddress(lootboxInfo.creatorAddress || '')}
                  </Tooltip>
                </Typography.Link>
              ),
            },
            ...(lootbox?.flushed
              ? [
                  {
                    key: 'flushed',
                    label: 'Flushed',
                    viewWidget: () => {
                      return <Tag color="red">True</Tag>;
                    },
                  },
                ]
              : []),
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
              // @ts-ignore
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

  const toggleFlushMode = () => {
    if (isFlushMode) {
      setViewMode(true);
      setIsFlushMode(false);
    } else {
      setViewMode(false);
      setIsFlushMode(true);
    }
  };

  interface WizardMeta {
    steps: {
      title: string;
      subSteps: {
        title: string;
        meta: any;
        key?: string;
        notifications?: {
          type: 'info' | 'success' | 'warning' | 'error';
          message: string;
        }[];
      }[];
    }[];
  }
  const getWizardMeta = (): WizardMeta => {
    if (isFlushMode) {
      return {
        steps: [
          {
            title: 'Flush Lootbox?',
            subSteps: [
              {
                title: `Flush ${lootboxInfo.name}`,
                meta: metaFlush() as any,
                key: 'flush-lootbox',
                notifications: [
                  {
                    type: 'info',
                    message:
                      'Flushing a Lootbox will flush all existing funds from the Lootbox to your wallet address.',
                  },
                  {
                    type: 'warning',
                    message:
                      'This action cannot be undone. It may confuse existing ticket holders because they will not be able to withdraw their earnings. Use this feature at your own risk. We do not recommend using this Lootbox after flushing it.',
                  },
                ],
              },
            ],
          },
        ],
      };
    }
    const result = {
      steps: [
        {
          title: 'Lootbox Details',
          subSteps: [
            {
              title: 'Public Details',
              meta: metaPublic() as any,
              key: 'public-details',
              notifications: [],
            },
          ],
        },
      ],
    };

    if (mode !== 'create') {
      result.steps[0].subSteps.push({
        title: 'Safety Settings',
        meta: metaSafety() as any,
        key: 'safety-details',
        notifications: [],
      });
    }

    // if (!viewMode && mode !== 'create') {
    if (!viewMode) {
      result.steps[0].subSteps.push({
        title: 'Lootbox Design',
        meta: metaCreative() as any,
        key: 'creative-details',
        notifications: [],
      });
    }

    result.steps.push({
      title: 'Deploy to Blockchain',
      subSteps: [
        {
          title: 'Blockchain Details',
          meta: metaBlockchain() as any,
          key: 'blockchain-details',
          notifications: [],
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
              style={{ alignSelf: 'flex-end', marginBottom: '-24px' }}
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
                : isFlushMode
                ? handleFlush
                : isOnBlockChain
                ? handleCreateWeb3
                : handleEditFinish
            }
            onValuesChange={forceUpdate}
          >
            {isAdvancedMode ? (
              <div>
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

                {viewMode && airdropMetadata && (
                  <fieldset key={`step-${currentStep}-airdrop`}>
                    <legend>Airdrop Details</legend>
                    <FormBuilder form={form} meta={metaAirdrop()} viewMode={true} />
                    <br />
                  </fieldset>
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
                      {s?.notifications &&
                        s.notifications.map((n, idx) => (
                          <Alert
                            key={'notif' + idx}
                            type={n.type}
                            message={n.message}
                            style={{ marginBottom: '10px' }}
                          />
                        ))}
                      {s?.notifications && s.notifications.length > 0 && <br />}
                      {!currentAccount && s.key === 'flush-lootbox' && (
                        <Empty
                          key="connect-wallet-empty-flush"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          imageStyle={{
                            height: 60,
                          }}
                          description={
                            <span style={{ maxWidth: '200px' }}>
                              {`You must connect your Metamask wallet before you can flush`}
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
                      )}
                      {isOnBlockChain && !isLootboxDeployed && (
                        <>
                          <Alert
                            type="success"
                            message={
                              <span>
                                {
                                  'Ready to launch your LOOTBOX? There will a one-time gas fee that LOOTBOX does not control or receive. '
                                }
                                <a href="https://google.com" target="_blank" rel="noreferrer">
                                  View Tutorial
                                </a>
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
                <br />

                {!!lootboxInfo?.address && viewMode && !lockedToView && (
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Tooltip title="Advanced action to release funds stored in a Lootbox. USE WITH CAUTION.">
                      <Button
                        type="text"
                        onClick={toggleFlushMode}
                        style={{
                          paddingLeft: '0px',
                          marginBottom: '-24px',
                          color: 'rgba(0, 0, 0, 0.45)',
                        }}
                      >
                        Flush
                      </Button>
                    </Tooltip>
                  </div>
                )}
                {viewMode && !!lootboxInfo?.address && (
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
                      <div>
                        <FormBuilder form={form} meta={metaBlockchain()} viewMode={viewMode} />
                      </div>
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
                            <Tooltip
                              title={
                                <span>
                                  This Lootbox can not pay out rewards to fans until it is deployed
                                  on the Blockchain. To deploy this Lootbox, you must install
                                  MetaMask and connect your wallet by clicking below.{` `}
                                  <a
                                    href="https://lootbox.fyi/3VFzk80"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
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
                        ) : isFlushMode ? (
                          <Popconfirm
                            title="Are you sure? This is irreversible."
                            okText="Yes, flush this Lootbox"
                            onConfirm={handleFlush}
                            okButtonProps={{
                              htmlType: 'submit',
                              type: 'primary',
                              disabled: pending || !currentAccount,
                            }}
                          >
                            <Button type="primary" disabled={pending || !currentAccount}>
                              {pending ? 'Flushing...' : 'Flush Lootbox'}
                            </Button>
                          </Popconfirm>
                        ) : !isOnBlockChain ? (
                          <Button htmlType="submit" type="primary" disabled={pending}>
                            {pending ? 'Updating...' : 'Update'}
                          </Button>
                        ) : null}
                      </Form.Item>
                    </$Horizontal>
                  </fieldset>
                )}
              </div>
            ) : (
              <div style={{ paddingRight: '20px' }}>
                <fieldset key={`step-simple`}>
                  <legend>Create Lootbox</legend>
                  <FormBuilder form={form} meta={metaSimple()} viewMode={false} />
                </fieldset>
                <$Horizontal justifyContent="space-between" verticalCenter>
                  <Switch
                    checkedChildren="Advanced"
                    unCheckedChildren="Simple"
                    checked={isAdvancedMode}
                    onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                    style={{ marginLeft: '50px' }}
                  />
                  <$Horizontal>
                    <Button onClick={resetForm} style={{ marginRight: '15px' }}>
                      Cancel
                    </Button>
                    <Button htmlType="submit" type="primary" disabled={pending}>
                      {pending ? 'Creating...' : 'Create'}
                    </Button>
                  </$Horizontal>
                </$Horizontal>
              </div>
            )}
          </Form>
        </div>
        <$ColumnGap width="50px" />
        {viewMode ? (
          <div>
            {isStampV2 ? (
              <SimpleTicket
                teamName={form.getFieldValue('name') || lootboxInfo.name || 'Team Name'}
                coverPhoto={
                  newMediaDestinationBackground.current ||
                  lootboxInfo.backgroundImage ||
                  placeholderBackground
                }
                themeColor={
                  newThemeColor.current || lootboxInfo.themeColor || lootboxInfo.themeColor
                }
                sponsorLogos={[
                  lootboxInfo.stampMetadata?.logoURLs?.[0] || PLACEHOLDER_LOGO,
                  lootboxInfo.stampMetadata?.logoURLs?.[1] || PLACEHOLDER_LOGO,
                  lootboxInfo.stampMetadata?.logoURLs?.[2] || PLACEHOLDER_LOGO,
                  lootboxInfo.stampMetadata?.logoURLs?.[3] || PLACEHOLDER_LOGO,
                ]}
                playerHeadshot={
                  newMediaDestinationPlayerHeadshot.current ||
                  lootboxInfo.stampMetadata?.playerHeadshot ||
                  PLACEHOLDER_HEADSHOT
                }
                eventName="Your epic event"
              />
            ) : (
              <LootboxPreview
                name={form.getFieldValue('name') || lootboxInfo.name}
                logoImage={
                  newMediaDestinationLogo.current || lootboxInfo.logoImage || placeholderImage
                }
                backgroundImage={
                  newMediaDestinationBackground.current ||
                  lootboxInfo.backgroundImage ||
                  placeholderBackground
                }
                themeColor={
                  newThemeColor.current || lootboxInfo.themeColor || lootboxInfo.themeColor
                }
                lootboxID={lootbox?.id}
              />
            )}
            <$Horizontal justifyContent="center" style={{ width: '100%', marginTop: '5px' }}>
              <a href={stampImage} download target="_blank" rel="noreferrer">
                Download Image
              </a>
            </$Horizontal>
          </div>
        ) : (
          <Affix offsetTop={70} style={{ pointerEvents: 'none' }}>
            <div>
              <SimpleTicket
                teamName={form.getFieldValue('name') || lootboxInfo.name || 'Team Name'}
                coverPhoto={newMediaDestinationBackground.current || placeholderBackground}
                themeColor={newThemeColor.current || lootboxInfo.themeColor}
                sponsorLogos={[
                  newMediaDestinationLogo_1.current || PLACEHOLDER_LOGO,
                  newMediaDestinationLogo_2.current || PLACEHOLDER_LOGO,
                  newMediaDestinationLogo_3.current || PLACEHOLDER_LOGO,
                  newMediaDestinationLogo_4.current || PLACEHOLDER_LOGO,
                ]}
                playerHeadshot={newMediaDestinationPlayerHeadshot.current || PLACEHOLDER_HEADSHOT}
                eventName="Your epic event"
              />
            </div>
          </Affix>
        )}
      </$Horizontal>
    </Card>
  );
};

export default CreateLootboxForm;
