import { Address, AffiliateID, LootboxID, TournamentID } from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import { Affix, Button, Card, Empty, Form, Modal, notification, Typography } from 'antd';
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
import { ContractTransaction } from 'ethers';
import { chainIdToHex, getBlockExplorerUrl } from '@/lib/chain';
import { LootboxStatus } from '@/api/graphql/generated/types';
// import * as _ from 'lodash';

// const DEFAULT_THEME_COLOR = '#00B0FB'
const DEFAULT_THEME_COLOR = '#000000';

interface LootboxBodyPayload {
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
  address?: Address;
  status: LootboxStatus;
}

export interface CreateLootboxRequest {
  payload: Omit<LootboxBodyPayload, 'address' | 'status'>;
}

export interface EditLootboxRequest {
  payload: Omit<LootboxBodyPayload, 'address' | 'tag'>;
}

interface OnSubmitCreateResponse {
  tx: ContractTransaction;
  lootboxID: LootboxID;
}

export type CreateLootboxFormProps = {
  lootbox?: LootboxBodyPayload;
  onSubmitCreate?: (payload: CreateLootboxRequest) => Promise<OnSubmitCreateResponse>;
  onSubmitEdit?: (payload: EditLootboxRequest) => Promise<void>;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
};

const LOOTBOX_INFO: LootboxBodyPayload = {
  description: '',
  backgroundImage: placeholderBackground,
  logoImage: placeholderImage,
  themeColor: DEFAULT_THEME_COLOR,
  nftBountyValue: '',
  joinCommunityUrl: '',
  name: '',
  maxTickets: 100,
  tag: '',
  address: 'missing' as Address,
  status: LootboxStatus.Active,
};
const CreateLootboxForm: React.FC<CreateLootboxFormProps> = ({
  lootbox,
  onSubmitCreate,
  onSubmitEdit,
  mode,
}) => {
  const {
    affiliateUser: { id: affiliateUserID },
  } = useAffiliateUser();
  const { currentAccount, network } = useWeb3();
  const newMediaDestinationLogo = useRef('');
  const newMediaDestinationBackground = useRef('');
  const newThemeColor = useRef<string>();

  const [previewMediasLogo, setPreviewMediasLogo] = useState<string[]>([]);
  const [previewMediasBackground, setPreviewMediasBackground] = useState<string[]>([]);
  const [form] = Form.useForm();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [lootboxInfo, setLootboxInfo] = useState<LootboxBodyPayload>(LOOTBOX_INFO);
  const lockedToEdit = mode === 'create' || mode === 'edit-only';

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
      });
      newMediaDestinationLogo.current = lootbox.logoImage;
      newMediaDestinationBackground.current = lootbox.backgroundImage;
    }
  }, [lootbox]);

  const handleCreateFinish = useCallback(
    async (values) => {
      if (!onSubmitCreate || !network) return;

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
      try {
        const { tx, lootboxID: createdLootboxID } = await onSubmitCreate(payload);

        if (!lockedToEdit) {
          setViewMode(true);
        }
        const chainIDHex = chainIdToHex(network.chainId);
        const explorerURL = getBlockExplorerUrl(chainIDHex);

        Modal.success({
          title: 'Success',
          content: (
            <$Vertical>
              <Typography.Text>
                {mode === 'create' ? 'Lootbox created' : 'Lootbox updated'}
              </Typography.Text>
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
          okText: 'Go to Lootbox',
          onOk: () => {
            window.location.href = `/dashboard/lootbox/id/${createdLootboxID}tid=${lootbox?.tournamentID}`;
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
        notification.close('metamask');
        notification.close('pending-creation');
        setPending(false);
      }
    },
    [onSubmitCreate],
  );

  const handleEditFinish = useCallback(async (values) => {
    console.log(`values = `, values);
    console.log(`lootboxInfo = `, lootboxInfo);
    console.log(`newThemeColor = `, newThemeColor.current);
    console.log(`newMediaDestinationLogo = `, newMediaDestinationLogo.current);
    console.log(`newMediaDestinationBackground = `, newMediaDestinationBackground.current);

    if (!onSubmitEdit) return;
    const request = { payload: {} } as EditLootboxRequest;

    if (values.name) {
      request.payload.name = values.name;
    }
    if (values.description) {
      request.payload.description = values.description;
    }
    if (newMediaDestinationBackground.current) {
      request.payload.backgroundImage = newMediaDestinationBackground.current;
    }
    if (newMediaDestinationLogo.current) {
      request.payload.logoImage = newMediaDestinationLogo.current;
    }
    if (values.logoImage) {
      request.payload.logoImage = newMediaDestinationLogo.current;
    }
    if (newThemeColor.current) {
      request.payload.themeColor = newThemeColor.current;
    }
    if (values.nftBountyValue) {
      request.payload.nftBountyValue = values.nftBountyValue;
    }
    if (values.joinCommunityUrl) {
      request.payload.joinCommunityUrl = values.joinCommunityUrl;
    }
    if (values.status) {
      request.payload.status = values.status;
    }
    if (values.maxTickets) {
      request.payload.maxTickets = values.maxTickets;
    }

    setPending(true);
    try {
      await onSubmitEdit(request);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: 'Lootbox updated',
      });
      setPending(false);
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
      setPending(false);
    }
  }, []);

  const metaPublic = () => {
    console.log('META lootbox info', lootboxInfo);
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        ...(mode === 'create'
          ? [
              {
                key: 'chain',
                label: 'Network',
                widget: SelectChain,
                required: true,
                tooltip:
                  'The blockchain network that this Lootbox will reside on. The fan prize money must also be distributed on this same blockchain network.',
              },
            ]
          : []),
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
          tooltip: 'The maximum number of tickets available for distribution.',
        },
        {
          key: 'joinCommunityUrl',
          label: 'Community URL',
          required: false,
          widget: 'input',
          type: 'url',
          tooltip:
            'Link to where you want to funnel your fans who claim these Lootbox tickets. This could be to grow your social media accounts, Discord community, YouTube channel or email mailing list.',
        },
        ...(mode === 'view-edit'
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
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        {
          key: 'blockchainExplorer',
          label: 'Lootbox Address',
          // @ts-ignore
          viewWidget: () => (
            <a href={`https://blockexplorer.com`} target="_blank" rel="noreferrer">
              {lootboxInfo.address}
            </a>
          ),
        },
        {
          key: 'lootboxOwner',
          label: 'Owner Address',
          // @ts-ignore
          viewWidget: () => (
            <a href={`https://blockexplorer.com`} target="_blank" rel="noreferrer">
              {lootboxInfo.address}
            </a>
          ),
        },
        {
          key: 'lootboxTreasury',
          label: 'Treasury Address',
          // @ts-ignore
          viewWidget: () => (
            <a href={`https://blockexplorer.com`} target="_blank" rel="noreferrer">
              {lootboxInfo.address}
            </a>
          ),
        },
      ],
    };

    return meta;
  };
  return (
    <Card style={{ flex: 1 }}>
      <$Horizontal>
        {mode === 'create' && !currentAccount ? (
          <Empty
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
            <ConnectWalletButton />
          </Empty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '500px' }}>
            {viewMode && !lockedToEdit && (
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
              onFinish={mode === 'create' ? handleCreateFinish : handleEditFinish}
              onValuesChange={forceUpdate}
            >
              <fieldset>
                <legend>{`Public Details`}</legend>
                <FormBuilder form={form} meta={metaPublic()} viewMode={viewMode} />
              </fieldset>
              <br />
              {!viewMode && (
                <fieldset>
                  <legend>{`Lootbox Design`}</legend>
                  <FormBuilder form={form} meta={metaCreative()} viewMode={viewMode} />
                </fieldset>
              )}
              {viewMode && (
                <fieldset>
                  <legend>{`Blockchain Details`}</legend>
                  <FormBuilder form={form} meta={metaBlockchain()} viewMode={viewMode} />
                </fieldset>
              )}
              {!viewMode && (
                <fieldset>
                  <legend>{`Submit`}</legend>
                  <$Horizontal justifyContent="flex-end">
                    <Form.Item className="form-footer" style={{ width: 'auto' }}>
                      <Button
                        onClick={() => {
                          form.resetFields();
                          if (!lockedToEdit) {
                            setViewMode(true);
                          }
                          newMediaDestinationLogo.current = lootboxInfo.logoImage;
                          newMediaDestinationBackground.current = lootboxInfo.backgroundImage;
                          if (mode === 'create') {
                            history.back();
                          }
                        }}
                        style={{ marginRight: '15px' }}
                      >
                        Cancel
                      </Button>

                      {mode === 'create' && !currentAccount ? (
                        <ConnectWalletButton />
                      ) : mode === 'create' && !!currentAccount ? (
                        <Button htmlType="submit" type="primary" disabled={pending}>
                          {pending ? 'Creating...' : 'Create'}
                        </Button>
                      ) : (
                        <Button htmlType="submit" type="primary" disabled={pending}>
                          {pending ? 'Updating...' : 'Update'}
                        </Button>
                      )}
                    </Form.Item>
                  </$Horizontal>
                </fieldset>
              )}
            </Form>
          </div>
        )}
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
