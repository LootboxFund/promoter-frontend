import { AffiliateID } from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal, Tag } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AffiliateVisibility, UpdateAffiliateDetailsPayload } from '@/api/graphql/generated/types';
import { AntUploadFile } from '../AntFormBuilder';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import { $Horizontal } from '@/components/generics';
import { useAuth } from '@/api/firebase/useAuth';
import ClickToCopy from '../ClickToCopy';

export interface AffiliateInfo {
  id: AffiliateID;
  name: string;
  description?: string;
  avatar?: string;
  publicContactEmail?: string;
  website?: string;
  audienceSize?: number;
  visibility?: AffiliateVisibility;
  privateLoginEmail?: string;
}

export type EditAffiliateFormProps = {
  affiliate: AffiliateInfo;
  onSubmit: (payload: UpdateAffiliateDetailsPayload) => void;
  mode: 'view-edit' | 'view-only';
};

const AFFILIATE_INFO: AffiliateInfo = {
  id: '' as AffiliateID,
  name: '',
  description: '',
  avatar: '',
  publicContactEmail: '',
  privateLoginEmail: '',
  website: '',
  audienceSize: 0,
};

const EditAffiliateForm: React.FC<EditAffiliateFormProps> = ({ affiliate, onSubmit, mode }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const newMediaDestination = useRef('');
  const [affiliateInfo, setAffiliateInfo] = useState(AFFILIATE_INFO);
  useEffect(() => {
    setAffiliateInfo({
      id: affiliate.id,
      name: affiliate.name,
      description: affiliate.description || '',
      avatar: affiliate.avatar || '',
      privateLoginEmail: affiliateInfo.privateLoginEmail || '',
      publicContactEmail: affiliate.publicContactEmail || '',
      website: affiliate.website || '',
      audienceSize: affiliate.audienceSize || 0,
      visibility: affiliate.visibility || AffiliateVisibility.Private,
    });
  }, [affiliate]);

  useEffect(() => {
    setAffiliateInfo((info) => ({
      ...info,
      privateLoginEmail: user?.email || '',
    }));
  }, [user]);

  const handleFinish = useCallback(async (values) => {
    const payload = {} as Omit<UpdateAffiliateDetailsPayload, 'id'>;
    if (values.name) {
      payload.name = values.name;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (newMediaDestination.current) {
      payload.avatar = newMediaDestination.current;
    }
    if (values.publicContactEmail) {
      payload.publicContactEmail = values.publicContactEmail;
    }
    if (values.website) {
      payload.website = values.website;
    }
    if (values.audienceSize) {
      payload.audienceSize = values.audienceSize;
    }
    if (values.visibility) {
      payload.visibility = values.visibility;
    }
    setPending(true);
    try {
      await onSubmit(payload);
      setPending(false);
      setViewMode(true);
      Modal.success({
        title: 'Success',
        content: 'Profile Details updated',
      });
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
    }
  }, []);
  const getMeta = () => {
    const meta: any = {
      columns: 1,
      disabled: pending,
      initialValues: affiliateInfo,
      fields: [
        {
          key: 'name',
          label: 'Name',
          required: true,
          tooltip:
            'Your name that will appear in the marketplace for advertisers and fellow promoters.',
        },
        {
          key: 'visibility',
          label: 'Visibility',
          tooltip: 'Determines if your account is shown in the marketplace for promoters.',
          widget: 'radio-group',
          options: [AffiliateVisibility.Public, AffiliateVisibility.Private],
          viewWidget: () => {
            if (!affiliateInfo?.visibility) {
              return <Tag> N/A</Tag>;
            }
            const color =
              affiliateInfo.visibility === AffiliateVisibility.Public ? 'green' : 'orange';
            return (
              <div>
                <Tag color={color}>{affiliateInfo.visibility}</Tag>
              </div>
            );
          },
        },
        {
          key: 'privateLoginEmail',
          label: 'Private Login Email',
          tooltip: 'Used for login to LOOTBOX. Not shown publically.',
          widget: () => (
            <span style={{ color: 'gray', marginLeft: '10px' }}>
              {`${affiliateInfo.privateLoginEmail} (Locked)`}
            </span>
          ),
        },
        {
          key: 'publicContactEmail',
          label: 'Public Contact Email',
          tooltip: 'The main contact channel for advertisers and promoters to reach out to you.',
        },
        {
          key: 'website',
          label: 'Website',
          tooltip:
            'How advertisers and other promoters can learn more about you. Link to your socials. We recommend using LinkTree or LinkInBio.',
        },
        {
          key: 'audienceSize',
          label: 'Audience Size',
          widget: 'number',
          tooltip:
            'Your estimated total audience size across all socials. Please be honest about this amount because advertisers and promoter partners will inevitably check.',
        },
        {
          key: 'description',
          label: 'Description',
          widget: 'textarea',
          tooltip:
            'A short description of your company and what you specialize in. Advertisers and promoters are interested in knowing about your past experience, your audience, expertise and operating style.',
        },
      ],
    };
    if (!viewMode) {
      meta.fields.push({
        key: 'image',
        label: 'Logo',
        widget: () => (
          <AntUploadFile
            affiliateID={affiliate.id}
            folderName={AffiliateStorageFolder.AVATAR}
            newMediaDestination={newMediaDestination}
            acceptedFileTypes={'image/*'}
          />
        ),
        tooltip: 'The logo for your company. Please use a square image.',
      });
    }
    if (viewMode) {
      meta.fields.push({
        key: 'id',
        label: 'Affiliate ID (Promoter ID)',
        tooltip: 'Your Affiliate ID (aka Promoter ID). In case anyone asks you for it.',
        viewWidget: () => <ClickToCopy text={affiliateInfo.id} showTip />,
      });
    }
    return meta;
  };
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {viewMode && (
          <Button type="link" onClick={() => setViewMode(false)} style={{ alignSelf: 'flex-end' }}>
            Edit
          </Button>
        )}
        <Form layout="horizontal" form={form} onFinish={handleFinish}>
          <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          {!viewMode && (
            <Form.Item className="form-footer">
              <$Horizontal justifyContent="flex-end" style={{ width: '100%' }}>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setViewMode(true);
                  }}
                  style={{ marginRight: '10px' }}
                >
                  Cancel
                </Button>
                <Button htmlType="submit" type="primary" disabled={pending}>
                  {pending ? 'Updating...' : 'Update'}
                </Button>
              </$Horizontal>
            </Form.Item>
          )}
        </Form>
      </div>
    </Card>
  );
};

export default EditAffiliateForm;
