import {
  AffiliateID,
  TournamentPrivacyScope,
  TournamentSafetyFeatures_Firestore,
} from '@wormgraph/helpers';
import moment, { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal, Tag, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CreateTournamentPayload,
  EditTournamentPayload,
  TournamentSafetyFeatures,
  TournamentVisibility,
} from '@/api/graphql/generated/types';
import { AntUploadFile, DateView } from '../AntFormBuilder';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import { $Horizontal } from '@/components/generics';
import { Rule } from 'antd/lib/form';
import { InviteMetadataFE } from '@/pages/Dashboard/EventPage/api.gql';
import { buildPlayerInviteLinkForEvent, buildPromoterInviteLinkForEvent } from '@/lib/routes';

export type CreateEventFormProps = {
  tournament?: TournamentInfo;
  affiliateID: AffiliateID;
  onSubmitCreate?: (payload: CreateTournamentPayload) => void;
  onSubmitEdit?: (payload: EditTournamentPayload) => void;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
};

interface TournamentInfo {
  title?: string;
  description?: string;
  tournamentDate?: Moment;
  tournamentLink?: string;
  coverPhoto?: string;
  magicLink?: string;
  prize?: string;
  communityURL?: string;
  playbookUrl?: string;
  privacyScope?: TournamentPrivacyScope[];
  safetyFeatures?: TournamentSafetyFeatures;
  visibility?: TournamentVisibility;
  inviteMetadata: InviteMetadataFE | null;
}

interface EventFormStepMeta {
  title: string;
  meta: any;
  key: string;
}

interface EventFormMeta {
  steps: EventFormStepMeta[];
}

const TOURNAMENT_INFO: TournamentInfo = {
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
  safetyFeatures: undefined,
  inviteMetadata: null,
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
        safetyFeatures: tournament.safetyFeatures || undefined,
        visibility: tournament.visibility,
        inviteMetadata: tournament.inviteMetadata,
      });
    }
  }, [tournament]);
  const handleFinish = useCallback(async (values) => {
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
    // payload.organizer = affiliateID;
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

    if (values.safetyFeatures) {
      if (values?.safetyFeatures?.maxTicketsPerUser != null) {
        payload.maxTicketsPerUser = values.safetyFeatures.maxTicketsPerUser;
      }
      if (values?.safetyFeatures?.seedMaxLootboxTicketsPerUser != null) {
        payload.seedMaxLootboxTicketsPerUser = values.safetyFeatures.seedMaxLootboxTicketsPerUser;
      }
    }

    if (values.visibility) {
      payload.visibility = values.visibility;
    }

    setPending(true);
    try {
      await onSubmitEdit(payload);
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
    } finally {
      setPending(false);
    }
  }, []);

  const getMeta = (): EventFormMeta => {
    // communityURL?: InputMaybe<Scalars['String']>;
    // coverPhoto?: InputMaybe<Scalars['String']>;
    // description: Scalars['String'];
    // organizer?: InputMaybe<Scalars['ID']>;
    // prize?: InputMaybe<Scalars['String']>;
    // streams?: InputMaybe<Array<StreamInput>>;
    // title: Scalars['String'];
    // tournamentDate: Scalars['Timestamp'];
    // tournamentLink?: InputMaybe<Scalars['String']>;
    const meta: EventFormMeta = {
      steps: [],
    };

    const publicMeta: any = {
      columns: 1,
      disabled: pending,
      initialValues: tournamentInfo,
      fields: [
        {
          key: 'title',
          label: 'Title',
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
      publicMeta.fields.push({
        key: 'prize',
        label: 'Prize',
        tooltip:
          'The total prize pool for fan ticket holders, shown publically on marketing materials',
      });

      publicMeta.fields.push({
        key: 'description',
        label: 'Description',
        widget: 'textarea',
        tooltip: 'Additional information shown publically on your Lootbox event page',
      });

      publicMeta.fields.push({
        key: 'tournamentDate',
        label: 'Estimated Date',
        widget: 'date-picker',
        viewWidget: DateView,
        tooltip: 'Shown publically as the last date that tickets can be claimed',
      });

      publicMeta.fields.push({
        key: 'communityURL',
        label: 'Link to Community',
        rules: [{ type: 'url' } as Rule],
        tooltip:
          'Link to where you want to funnel audience members. This could be to grow your social media accounts, Discord community, YouTube channel or email mailing list.',
        viewWidget: () => (
          <a href={tournamentInfo.communityURL} target="_blank" rel="noreferrer">
            {tournamentInfo.communityURL && `${tournamentInfo.communityURL.slice(0, 25)}...`}
          </a>
        ),
      });
      publicMeta.fields.push({
        key: 'playbookUrl',
        label: 'Event Playbook',
        rules: [{ type: 'url' } as Rule],
        tooltip:
          'Your checklist for running a successful event. This could be a Google Doc, Notion, or other document.',
        viewWidget: () => (
          <a href={tournamentInfo.playbookUrl} target="_blank" rel="noreferrer">
            {tournamentInfo.playbookUrl && `${tournamentInfo.playbookUrl.slice(0, 25)}...`}
          </a>
        ),
      });

      publicMeta.fields.push({
        key: 'safetyFeatures.maxTicketsPerUser',
        label: 'Max Tickets Per User',
        tooltip: 'The maximum number of tickets a user can claim for this event.',
        rules: [],
        initialValue: tournamentInfo?.safetyFeatures?.maxTicketsPerUser || 100,
        widget: 'number',
      });

      publicMeta.fields.push({
        key: 'visibility',
        label: 'Discoverability',
        tooltip: 'Determines if your event is shown in the marketplace.',
        widget: 'radio-group',
        options: [
          TournamentVisibility.Public,
          TournamentVisibility.Private,
        ] as TournamentVisibility[],
        viewWidget: () => {
          if (!tournamentInfo?.visibility) return null;
          const color =
            tournamentInfo.visibility === TournamentVisibility.Public ? 'green' : 'orange';
          return (
            <div>
              <Tag color={color}>{tournamentInfo.visibility}</Tag>
            </div>
          );
        },
      });

      publicMeta.fields.push({
        key: 'privacyScope',
        label: 'Privacy Scope',
        tooltip:
          'Privacy scope sets the appropriate Terms and Conditions & Privacy Policy that fans must consent to.\n\n DataSharing means you intend to download user emails and possibly even share them with a 3rd party such as an advertiser.\n\n MarketingEmails means you intend to send marketing emails to users who claim tickets to this event.',
        widget: 'checkbox-group',
        options: [
          TournamentPrivacyScope.DataSharing,
          TournamentPrivacyScope.MarketingEmails,
        ] as TournamentPrivacyScope[],
        viewWidget: () => {
          return (
            <div>
              {(tournamentInfo?.privacyScope || []).map((v: any, idx: number) => (
                <Tag key={`priv${idx}`}>{v}</Tag>
              ))}
            </div>
          );
        },
      });

      if (!viewMode) {
        publicMeta.fields.push({
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

    meta.steps.push({
      key: 'public-details',
      title: 'Public Details',
      meta: publicMeta,
    });

    const inviteMeta: any = {
      columns: 1,
      disabled: pending,
      initialValues: tournamentInfo,
      fields: [],
    };

    if (viewMode) {
      inviteMeta.fields.push({
        key: '__player_invite',
        label: 'Player Invite Link',
        tooltip:
          'Share this link with players to invite them to your event. They will make a Lootbox and it will appear here. These Lootboxes are subject to the event limits and have a low default max ticket value.',
        viewWidget: () => {
          if (!tournamentInfo?.inviteMetadata?.slug) {
            return <Typography.Text>Not Set</Typography.Text>;
          }
          const txt = buildPlayerInviteLinkForEvent(tournamentInfo.inviteMetadata.slug);
          return (
            <Typography.Text
              copyable={{
                text: txt,
              }}
            >
              {txt}
            </Typography.Text>
          );
        },
      });
      inviteMeta.fields.push({
        key: '__promoter_invite',
        label: 'Promoter Invite Link',
        tooltip:
          'Share this link with promoters and streamers to invite them to your event. They will make a Lootbox and it will appear here. These Lootboxes are NOT subject to the event limits and have a high default max ticket value to increase sharing.',
        viewWidget: () => {
          if (!tournamentInfo?.inviteMetadata?.slug) {
            return <Typography.Text>Not Set</Typography.Text>;
          }
          const txt = buildPromoterInviteLinkForEvent(tournamentInfo.inviteMetadata.slug);
          return (
            <Typography.Text
              copyable={{
                text: txt,
              }}
            >
              {txt}
            </Typography.Text>
          );
        },
      });
    }

    if (!viewMode && (mode === 'edit-only' || mode === 'view-edit')) {
      // Editable stuff
      inviteMeta.fields.push({
        key: 'inviteMetadata.playerDestinationURL',
        label: 'Player Destination URL',
        tooltip:
          'Players are guided to this URL after they make their Lootbox. This can be any URL where you collect sign up data and / or manage players.',
        widget: 'input',
      });
      // Editable stuff
      inviteMeta.fields.push({
        key: 'inviteMetadata.promoterDestinationURL',
        label: 'Promoter Destination URL',
        tooltip:
          'Promoters & streamers are guided to this URL after they make their Lootbox. This can be any URL where you collect sign up data, give instructions to and / or manage promoters.',
        widget: 'input',
      });
    }

    if (mode !== 'create') {
      meta.steps.push({
        key: 'invite-config',
        title: 'Lootbox Invite Config',
        meta: inviteMeta,
      });
    }
    return meta;
  };

  const meta = getMeta();

  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {viewMode && mode !== 'view-only' && !lockedToEdit && (
          <Button
            type="link"
            onClick={() => setViewMode(false)}
            style={{ alignSelf: 'flex-end', marginBottom: '-28px' }}
          >
            Edit
          </Button>
        )}
        <Form
          layout="horizontal"
          form={form}
          onFinish={mode === 'create' ? handleFinish : handleEdit}
        >
          {meta.steps.map((m: EventFormStepMeta) => {
            return (
              <fieldset key={m.key}>
                <legend>{m.title}</legend>
                <FormBuilder form={form} meta={m.meta} viewMode={viewMode} />
                <br />
              </fieldset>
            );
          })}
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
