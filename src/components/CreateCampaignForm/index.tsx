import { AdvertiserID, ConquestStatus } from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal, Upload } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UpdateConquestPayload } from '@/api/graphql/generated/types';
import { AntUploadFile, HiddenViewWidget } from '../AntFormBuilder';
import { AdvertiserStorageFolder } from '@/api/firebase/storage';

export type CreateCampaignFormProps = {
  conquest?: {
    title: string;
    description: string;
    status: ConquestStatus;
    startDate: number;
    endDate: number;
  };
  advertiserID: AdvertiserID;
  onSubmit: (payload: Omit<UpdateConquestPayload, 'id'>) => void;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
};

const CONQUEST_INFO = {
  title: '',
  description: '',
  startDate: moment(new Date()),
  endDate: moment(new Date()),
  status: ConquestStatus.Planned,
};
const DateView = ({ value }: { value: Moment }) => value.format('MMM Do YYYY');

const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({
  conquest,
  onSubmit,
  mode,
  advertiserID,
}) => {
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const newMediaDestination = useRef('');
  const [conquestInfo, setConquestInfo] = useState(CONQUEST_INFO);
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);
  useEffect(() => {
    if (conquest) {
      setConquestInfo({
        title: conquest.title,
        description: conquest.description,
        startDate: moment.unix(conquest.startDate),
        endDate: moment.unix(conquest.endDate),
        status: conquest.status,
      });
    }
  }, [conquest]);
  const handleFinish = useCallback(async (values) => {
    console.log('Submit: ', values);
    const payload = {} as Omit<UpdateConquestPayload, 'id'>;
    if (values.title) {
      payload.title = values.title;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    if (values.startDate) {
      payload.startDate = values.startDate;
    }
    if (values.endDate) {
      payload.endDate = values.endDate;
    }
    if (newMediaDestination.current) {
      payload.image = newMediaDestination.current;
    }
    setPending(true);
    try {
      await onSubmit(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: mode === 'create' ? 'Campaign created' : 'Campaign updated',
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
      columns: 2,
      disabled: pending,
      initialValues: conquestInfo,
      fields: [{ key: 'title', label: 'Title', required: true }],
    };
    if (mode !== 'create') {
      const editOnlyFields = [
        {
          key: 'startDate',
          label: 'Start Date',
          widget: 'date-picker',
          viewWidget: DateView,
        },
        {
          key: 'description',
          label: 'Description',
          widget: 'textarea',
        },
        {
          key: 'endDate',
          label: 'End Date',
          widget: 'date-picker',
          viewWidget: DateView,
        },
        {
          key: 'status',
          label: 'Status',
          widget: 'radio-group',
          options: [
            ConquestStatus.Active,
            ConquestStatus.Inactive,
            ConquestStatus.Planned,
            ConquestStatus.Archived,
          ],
        },
      ];
      editOnlyFields.forEach((f: any) => meta.fields.push(f));
      if (!viewMode) {
        meta.fields.push({
          key: 'image',
          label: 'Image',
          // @ts-ignore
          widget: () => (
            <AntUploadFile
              advertiserID={advertiserID}
              folderName={AdvertiserStorageFolder.CAMPAIGN_IMAGE}
              newMediaDestination={newMediaDestination}
              acceptedFileTypes={'image/*'}
            />
          ),
        });
      }
    }
    return meta;
  };
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {viewMode && !lockedToEdit && (
          <Button type="link" onClick={() => setViewMode(false)} style={{ alignSelf: 'flex-end' }}>
            Edit
          </Button>
        )}
        <Form layout="horizontal" form={form} onFinish={handleFinish}>
          <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          {!viewMode && (
            <Form.Item className="form-footer" wrapperCol={{ span: 16, offset: 4 }}>
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
          )}
        </Form>
      </div>
    </Card>
  );
};

export default CreateCampaignForm;
