import { AdvertiserID, ConquestStatus, AffiliateID } from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal, Upload } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UpdateAffiliateDetailsPayload } from '@/api/graphql/generated/types';
import { AntUploadFile } from '../AntFormBuilder';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import { $Horizontal } from '@/components/generics';

export type EditAffiliateFormProps = {
  affiliate: {
    id: AffiliateID;
    name: string;
    description?: string;
    avatar?: string;
    publicContactEmail?: string;
    website?: string;
    audienceSize?: number;
  };
  onSubmit: (payload: UpdateAffiliateDetailsPayload) => void;
  mode: 'view-edit' | 'view-only';
};

const AFFILIATE_INFO = {
  name: '',
  description: '',
  avatar: '',
  publicContactEmail: '',
  website: '',
  audienceSize: 0,
};

const EditAffiliateForm: React.FC<EditAffiliateFormProps> = ({ affiliate, onSubmit, mode }) => {
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const newMediaDestination = useRef('');
  const [affiliateInfo, setAffiliateInfo] = useState(AFFILIATE_INFO);
  useEffect(() => {
    setAffiliateInfo({
      name: affiliate.name,
      description: affiliate.description || '',
      avatar: affiliate.avatar || '',
      publicContactEmail: affiliate.publicContactEmail || '',
      website: affiliate.website || '',
      audienceSize: affiliate.audienceSize || 0,
    });
  }, [affiliate]);
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
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: affiliateInfo,
      fields: [
        { key: 'name', label: 'Name', required: true },
        { key: 'publicContactEmail', label: 'Public Contact Email' },
        { key: 'website', label: 'Website' },
        { key: 'audienceSize', label: 'Audience Size', widget: 'number' },
        {
          key: 'description',
          label: 'Description',
          widget: 'textarea',
        },
      ],
    };
    if (!viewMode) {
      meta.fields.push({
        key: 'image',
        label: 'Image',
        // @ts-ignore
        widget: () => (
          <AntUploadFile
            affiliateID={affiliate.id}
            folderName={AffiliateStorageFolder.AVATAR}
            newMediaDestination={newMediaDestination}
            acceptedFileTypes={'image/*'}
          />
        ),
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
