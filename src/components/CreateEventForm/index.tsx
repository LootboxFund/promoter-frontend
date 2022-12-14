import {
  AdvertiserID,
  AffiliateID,
  ConquestStatus,
  MeasurementPartnerType,
  OfferStatus,
  TournamentPrivacyScope,
} from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CreateOfferPayload,
  CreateTournamentPayload,
  EditOfferPayload,
  EditTournamentPayload,
} from '@/api/graphql/generated/types';
import { AntUploadFile, DateView, PriceInput, PriceView } from '../AntFormBuilder';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import { $Horizontal } from '@/components/generics';
import { Rule } from 'antd/lib/form';

export type CreateEventFormProps = {
  tournament?: {
    title: string;
    description?: string;
    tournamentDate?: number;
    tournamentLink?: string;
    coverPhoto?: string;
    magicLink?: string;
    prize?: string;
    communityURL?: string;
    privacyScope?: TournamentPrivacyScope[];
    playbookUrl?: string;
  };
  affiliateID: AffiliateID;
  onSubmitCreate?: (payload: CreateTournamentPayload) => void;
  onSubmitEdit?: (payload: EditTournamentPayload) => void;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
};

const TOURNAMENT_INFO = {
  title: '',
  description: '',
  tournamentDate: moment(new Date()),
  tournamentLink: '',
  coverPhoto: '',
  magicLink: '',
  prize: '',
  communityURL: '',
  playbookUrl: '',
  privacyScope: [] as TournamentPrivacyScope[],
};
const CreateEventForm: React.FC<CreateEventFormProps> = ({
  tournament,
  onSubmitCreate,
  onSubmitEdit,
  mode,
  affiliateID,
}) => {
  const newMediaDestination = useRef('');
  const [previewMedias, setPreviewMedias] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [tournamentInfo, setTournamentInfo] = useState(TOURNAMENT_INFO);
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);
  useEffect(() => {
    if (tournament) {
      setTournamentInfo({
        title: tournament.title,
        description: tournament.description || '',
        tournamentDate: moment(tournament.tournamentDate) || moment(new Date()),
        tournamentLink: tournament.tournamentLink || '',
        coverPhoto: tournament.coverPhoto || '',
        magicLink: tournament.magicLink || '',
        prize: tournament.prize || '',
        communityURL: tournament.communityURL || '',
        privacyScope: tournament.privacyScope || [],
        playbookUrl: tournament.playbookUrl || '',
      });
    }
  }, [tournament]);
  const handleFinish = useCallback(async (values) => {
    console.log('Submit: ', values);
    if (!onSubmitCreate) return;

    const payload = {} as CreateTournamentPayload;

    if (values.title) {
      payload.title = values.title;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.tournamentDate) {
      payload.tournamentDate = values.tournamentDate;
    }
    if (values.tournamentLink) {
      payload.tournamentLink = values.tournamentLink;
    }
    if (values.communityURL) {
      payload.communityURL = values.communityURL;
    }
    if (newMediaDestination.current) {
      payload.coverPhoto = newMediaDestination.current;
    }
    if (values.prize) {
      payload.prize = values.prize;
    }
    payload.organizer = affiliateID;
    console.log(`payload = `, payload);
    setPending(true);
    try {
      await onSubmitCreate(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: 'Event created!',
      });
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
    }
  }, []);
  const handleEdit = useCallback(async (values) => {
    console.log('Submit: ', values);
    console.log(newMediaDestination.current);
    if (!onSubmitEdit) return;

    const payload = {} as EditTournamentPayload;
    if (values.title) {
      payload.title = values.title;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.tournamentDate) {
      payload.tournamentDate = values.tournamentDate;
    }
    if (values.tournamentLink) {
      payload.tournamentLink = values.tournamentLink;
    }
    if (values.communityURL) {
      payload.communityURL = values.communityURL;
    }
    if (values.playbookUrl) {
      payload.playbookUrl = values.playbookUrl;
    }
    if (values.magicLink) {
      payload.magicLink = values.magicLink;
    }
    if (newMediaDestination.current) {
      payload.coverPhoto = newMediaDestination.current;
    }
    if (values.prize) {
      payload.prize = values.prize;
    }
    if (values.privacyScope) {
      payload.privacyScope = values.privacyScope;
    }
    setPending(true);
    try {
      await onSubmitEdit(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: 'Event updated!',
      });
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
    }
  }, []);
  const getMeta = () => {
    // communityURL?: InputMaybe<Scalars['String']>;
    // coverPhoto?: InputMaybe<Scalars['String']>;
    // description: Scalars['String'];
    // organizer?: InputMaybe<Scalars['ID']>;
    // prize?: InputMaybe<Scalars['String']>;
    // streams?: InputMaybe<Array<StreamInput>>;
    // title: Scalars['String'];
    // tournamentDate: Scalars['Timestamp'];
    // tournamentLink?: InputMaybe<Scalars['String']>;
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: tournamentInfo,
      fields: [
        {
          key: 'title',
          label: 'Title',
          required: true,
          tooltip: 'The title of the tournament shown publically on tickets',
        },
        {
          key: 'tournamentLink',
          label: 'Link to Tournament',
          rules: [{ type: 'url' } as Rule],
          tooltip:
            'Link to an external event page such as EventBrite, CommunityGaming, Facebook Events, Twitch, Discord, or your website.',
        },
      ],
    };
    if (mode !== 'create') {
      // @ts-ignore
      meta.fields.push({
        key: 'description',
        label: 'Description',
        // @ts-ignore
        widget: 'textarea',
        tooltip: 'Additional information shown publically on your Lootbox event page',
      });
      // @ts-ignore
      meta.fields.push({
        key: 'tournamentDate',
        label: 'Estimated Date',
        // @ts-ignore
        widget: 'date-picker',
        viewWidget: DateView,
        tooltip: 'Shown publically as the last date that tickets can be claimed',
      });
      // @ts-ignore
      meta.fields.push({
        key: 'communityURL',
        label: 'Link to Community',
        rules: [{ type: 'url' } as Rule],
        tooltip:
          'Link to where you want to funnel audience members. This could be to grow your social media accounts, Discord community, YouTube channel or email mailing list.',
        // @ts-ignore
        viewWidget: () => (
          <a href={tournamentInfo.communityURL} target="_blank" rel="noreferrer">
            {tournamentInfo.communityURL && `${tournamentInfo.communityURL.slice(0, 25)}...`}
          </a>
        ),
      });
      // @ts-ignore
      meta.fields.push({
        key: 'playbookUrl',
        label: 'Event Checklist',
        rules: [{ type: 'url' } as Rule],
        tooltip:
          'Your checklist for running a successful event. This could be a Google Doc, Notion, or other document.',
        // @ts-ignore
        viewWidget: () => (
          <a href={tournamentInfo.playbookUrl} target="_blank" rel="noreferrer">
            {tournamentInfo.playbookUrl && `${tournamentInfo.playbookUrl.slice(0, 25)}...`}
          </a>
        ),
      });
      // @ts-ignore
      meta.fields.push({
        key: 'prize',
        label: 'Prize',
        tooltip:
          'The total prize pool for fan ticket holders, shown publically on marketing materials',
      });
      // @ts-ignore
      meta.fields.push({
        key: 'privacyScope',
        label: 'Privacy Scope',
        tooltip:
          'Privacy scope sets the appropriate Terms and Conditions & Privacy Policy that fans must consent to.\n\n DataSharing means you intend to download user emails and possibly even share them with a 3rd party such as an advertiser.\n\n MarketingEmails means you intend to send marketing emails to users who claim tickets to this event.',
        // @ts-ignore
        widget: 'checkbox-group',
        options: [
          TournamentPrivacyScope.DataSharing,
          TournamentPrivacyScope.MarketingEmails,
        ] as TournamentPrivacyScope[],
      });
      if (!viewMode) {
        meta.fields.push({
          key: 'coverPhoto',
          label: 'Cover Photo',
          // rules: [
          //   {
          //     validator: (rule: any, value: any, callback: any) => {
          //       // Do async validation to check if username already exists
          //       // Use setTimeout to emulate api call
          //       return new Promise((resolve, reject) => {
          //         if (mode === 'create' && !newMediaDestination.current) {
          //           reject(new Error(`Upload a file`));
          //         } else {
          //           resolve(newMediaDestination.current);
          //         }
          //       });
          //     },
          //   },
          // ],
          // @ts-ignore
          widget: () => (
            <AntUploadFile
              affiliateID={affiliateID}
              folderName={AffiliateStorageFolder.TOURNAMENT}
              newMediaDestination={newMediaDestination}
              acceptedFileTypes={'image/*'}
            />
          ),
          tooltip: 'Shown as the banner photo for your event',
        });
      }
    }
    return meta;
  };
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {viewMode && mode !== 'view-only' && !lockedToEdit && (
          <Button type="link" onClick={() => setViewMode(false)} style={{ alignSelf: 'flex-end' }}>
            Edit
          </Button>
        )}
        <Form
          layout="horizontal"
          form={form}
          onFinish={mode === 'create' ? handleFinish : handleEdit}
        >
          <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          {!viewMode && (
            <$Horizontal justifyContent="flex-end" style={{ width: '100%' }}>
              <Form.Item className="form-footer">
                {mode === 'create' ? (
                  <Button htmlType="submit" type="primary" disabled={pending}>
                    {pending ? 'Creating...' : 'Create'}
                  </Button>
                ) : (
                  <Button htmlType="submit" type="primary" disabled={pending}>
                    {pending ? 'Updating...' : 'Update'}
                  </Button>
                )}

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
                  style={{ marginLeft: '15px' }}
                >
                  Cancel
                </Button>
              </Form.Item>
            </$Horizontal>
          )}
        </Form>
      </div>
    </Card>
  );
};

export default CreateEventForm;
