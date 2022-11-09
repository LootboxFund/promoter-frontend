import { Address, AffiliateID, ChainIDHex, LootboxID, TournamentID } from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import {
  Affix,
  Alert,
  Button,
  Card,
  Empty,
  Form,
  message,
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
import { useAffiliateUser } from '../AuthGuard/affiliateUserInfo';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import LootboxPreview from '../LootboxPreview';
import { LootboxStatus } from '@/api/graphql/generated/types';

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

interface OnSubmitCreateResponse {
  lootboxID: LootboxID;
}

export type CreateLootboxFormProps = {
  airdropParams: {
    tournamentID?: TournamentID;
    numClaimers: number;
    teamName?: string;
    value?: string;
  };
  onSubmitCreate: (payload: CreateLootboxRequest) => Promise<OnSubmitCreateResponse>;
  mode: 'create';
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
  airdropParams,
  onSubmitCreate,
  mode,
}) => {
  const {
    affiliateUser: { id: affiliateUserID },
  } = useAffiliateUser();
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
  const [lootboxInfo, setLootboxInfo] = useState<LootboxBody>({
    ...LOOTBOX_INFO,
    maxTickets: airdropParams.numClaimers,
    name: airdropParams.teamName || '',
    nftBountyValue: airdropParams.value || '',
  });
  const lockedToEdit = mode === 'create' || mode === 'edit-only';

  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);

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
          maxTickets: airdropParams.numClaimers,
          tag: values.symbol,
          tournamentID: airdropParams?.tournamentID,
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
        await onSubmitCreate(payload);
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

  const metaPublic = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: lootboxInfo,
      fields: [
        {
          key: 'name',
          label: 'Lootbox Name',
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
          key: 'nftBountyValue',
          label: 'Airdrop Value',
          required: true,
          widget: 'input',
          placeholder: 'e.g. $20 USD',
          tooltip:
            'The advertised max value of the Lootbox fan ticket. Calculate this by taking the largest 1st place prize and divide it by the number of tickets in this Lootbox. You can change this field at any time.',
        },
        {
          key: 'description',
          label: 'Description',
          widget: 'textarea',
          tooltip:
            'Additional information shown publically on your Lootbox. We recommend linking your socials.',
        },
        {
          key: 'joinCommunityUrl',
          label: 'Community',
          required: false,
          widget: 'input',
          type: 'url',
          tooltip:
            'Link to where you want to funnel your fans who claim these Lootbox tickets. This could be to grow your social media accounts, Discord community, YouTube channel or email mailing list.',
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
          label: 'Background',
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

    return result;
  };

  return (
    <Card style={{ flex: 1 }}>
      <$Horizontal>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '350px' }}>
          <Form
            layout="horizontal"
            form={form}
            onFinish={handleCreateFinish}
            onValuesChange={forceUpdate}
          >
            <FormBuilder form={form} meta={metaPublic()} viewMode={viewMode} />
            <FormBuilder form={form} meta={metaCreative()} viewMode={viewMode} />
            <$Horizontal justifyContent="flex-end" style={{ width: '100%' }}>
              <Form.Item className="form-footer">
                <Button loading={pending} htmlType="submit" type="primary">
                  Next
                </Button>
              </Form.Item>
            </$Horizontal>
          </Form>
        </div>
        <$ColumnGap width="50px" />

        <div
          style={{
            scale: 0.3,
          }}
        >
          <LootboxPreview
            name={form.getFieldValue('name') || lootboxInfo.name}
            logoImage={newMediaDestinationLogo.current || placeholderImage}
            backgroundImage={newMediaDestinationBackground.current || placeholderBackground}
            themeColor={newThemeColor.current || lootboxInfo.themeColor}
          />
        </div>
      </$Horizontal>
    </Card>
  );
};

export default CreateLootboxForm;
