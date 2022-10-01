import { AffiliateID, TournamentID } from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EditLootboxPayload } from '@/api/graphql/generated/types';
import { AntColorPicker, AntUploadFile } from '../AntFormBuilder';
import { $Horizontal, $ColumnGap } from '@/components/generics';
import { placeholderGif, placeholderImage } from '../generics';
import ConnectWalletButton from '../ConnectWalletButton';
import { SelectChain } from './SelectChain';
import { useAffiliateUser } from '../AuthGuard/affiliateUserInfo';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import { useWeb3 } from '@/hooks/useWeb3';

export interface CreateLootboxRequest {
  payload: LootboxBodyPayload;
}

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
}

export type CreateLootboxFormProps = {
  lootbox?: LootboxBodyPayload;
  onSubmitCreate?: (payload: CreateLootboxRequest) => void;
  onSubmitEdit?: (payload: EditLootboxPayload) => void;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
};

const LOOTBOX_INFO: LootboxBodyPayload = {
  description: '',
  backgroundImage: placeholderGif,
  logoImage: placeholderImage,
  themeColor: '#000000',
  nftBountyValue: '',
  joinCommunityUrl: '',
  name: '',
  maxTickets: 1000,
  tag: '',
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
  const { currentAccount } = useWeb3();
  // const { connected, currentAccount, chainId } = useAccount();
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
      });
    }
  }, [lootbox]);

  const handleCreateFinish = useCallback(
    async (values) => {
      if (!onSubmitCreate) return;

      const payload: CreateLootboxRequest = {
        payload: {
          name: values.name,
          description: values.description,
          backgroundImage: newMediaDestinationBackground.current,
          logoImage: newMediaDestinationLogo.current,
          themeColor: values.themeColor,
          nftBountyValue: values.nftBountyValue,
          joinCommunityUrl: values.joinCommunityUrl,
          maxTickets: values.maxTickets,
          tag: values.symbol,
          tournamentID: lootbox?.tournamentID,
        },
      };

      setPending(true);
      try {
        await onSubmitCreate(payload);
        setPending(false);
        if (!lockedToEdit) {
          setViewMode(true);
        }
        Modal.success({
          title: 'Success',
          content: mode === 'create' ? 'Lootbox created' : 'Lootbox updated',
        });
        setPending(false);
      } catch (e: any) {
        Modal.error({
          title: 'Failure',
          content: `${e.message}`,
        });
        setPending(false);
      }
    },
    [onSubmitCreate],
  );

  const handleEditFinish = useCallback(async (values) => {
    console.log('edit? ', values);
    // console.log(`values = `, values);
    // console.log(`lootboxInfo = `, lootboxInfo);
    // console.log(`newThemeColor = `, newThemeColor.current);
    // console.log(`newMediaDestination = `, newMediaDestination.current);
    // if (!onSubmitEdit) return;
    // const payload = {
    //   creative: {},
    // } as EditAdPayload;
    // if (lootbox?.id) {
    //   payload.name = values.name;
    // }
    // if (values.name) {
    //   payload.name = values.name;
    // }
    // if (values.description) {
    //   payload.description = values.description;
    // }
    // if (values.status) {
    //   payload.status = values.status;
    // }
    // if (values.placement) {
    //   payload.placement = values.placement;
    // }
    // if (values.publicInfo) {
    //   payload.publicInfo = values.publicInfo;
    // }
    // if (payload.creative && values.creative_creativeType) {
    //   payload.creative.creativeType = values.creative_creativeType;
    // }
    // if (payload.creative && values.creative_creativeLinks) {
    //   payload.creative.creativeLinks = values.creative_creativeLinks;
    // }
    // if (payload.creative && values.creative_callToAction) {
    //   payload.creative.callToAction = values.customCTA || values.creative_callToAction;
    // }
    // if (payload.creative && values.creative_aspectRatio) {
    //   payload.creative.aspectRatio = values.creative_aspectRatio;
    // }
    // // if (payload.creative && lootboxInfo.creative.themeColor) {
    // //   payload.creative.themeColor = lootboxInfo.creative.themeColor;
    // // }
    // if (payload.creative && newThemeColor.current) {
    //   payload.creative.themeColor = newThemeColor.current;
    // }
    // if (payload.creative && newMediaDestination.current) {
    //   payload.creative.creativeLinks = [newMediaDestination.current];
    // }
    // if (payload.creative && newMediaDestination.current) {
    //   payload.creative.thumbnail =
    //     values.creative_creativeType === CreativeType.Video
    //       ? placeholderVideoThumbnail
    //       : newMediaDestination.current;
    // }
    // setPending(true);
    // try {
    //   await onSubmitEdit(payload);
    //   setPending(false);
    //   if (!lockedToEdit) {
    //     setViewMode(true);
    //   }
    //   Modal.success({
    //     title: 'Success',
    //     content: 'Offer updated',
    //   });
    //   setPending(false);
    // } catch (e: any) {
    //   Modal.error({
    //     title: 'Failure',
    //     content: `${e.message}`,
    //   });
    //   setPending(false);
    // }
  }, []);

  const metaPublic = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        { key: 'name', label: 'Team Name', required: true },
        { key: 'symbol', label: 'Team Tag', required: true },
        { key: 'description', label: 'Team Bio', required: true, widget: 'textarea' },
        { key: 'chain', label: 'Network', widget: SelectChain },
        {
          key: 'nftBountyValue',
          label: 'Value per NFT Ticket',
          required: true,
          widget: 'input',
          placeholder: 'e.g. $20 USD',
        },
        {
          key: 'joinCommunityUrl',
          label: 'Team Community URL',
          required: false,
          widget: 'input',
          type: 'url',
        },
        {
          key: 'maxTickets',
          label: 'Number of Tickets',
          required: true,
          widget: 'number',
          tooltip: 'The maximum number of tickets available for distribution.',
        },
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
        },
        {
          key: 'backgroundImage',
          label: 'Background Image',
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
        },
        {
          key: 'themeColor',
          label: 'Theme Color',
          required: true,
          widget: () => (
            <AntColorPicker
              color={lootboxInfo.themeColor}
              updateColor={(hex: string) => {
                newThemeColor.current = hex;
                setLootboxInfo({
                  ...lootboxInfo,
                  themeColor: hex,
                });
              }}
            />
          ),
        },
      ],
    };

    return meta;
  };
  return (
    <Card style={{ flex: 1 }}>
      <$Horizontal>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
            <fieldset>
              <legend>{`Lootbox NFT`}</legend>
              <FormBuilder form={form} meta={metaCreative()} viewMode={viewMode} />
            </fieldset>
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
        <$ColumnGap width="50px" />
        <div>Stamp Image Preview</div>

        {/* <DeviceSimulator
          creative={{
            themeColor: newThemeColor.current ? newThemeColor.current : adInfo.creative.themeColor,
            callToAction:
              form.getFieldValue('creative_callToAction') === AdSampleCallToActions.Custom
                ? form.getFieldValue('customCTA') || adInfo.creative.callToAction
                : form.getFieldValue('creative_callToAction') || adInfo.creative.callToAction,
            creativeType:
              form.getFieldValue('creative_creativeType') || adInfo.creative.creativeType,
            creativeLinks: newMediaDestination.current
              ? [newMediaDestination.current]
              : adInfo.creative.creativeLinks,
            aspectRatio: form.getFieldValue('creative_aspectRatio') || adInfo.creative.aspectRatio,
          }}
        /> */}
      </$Horizontal>
    </Card>
  );
};

export default CreateLootboxForm;
