import {
  ActivationID,
  AdvertiserID,
  ConquestStatus,
  MeasurementPartnerType,
  OfferID,
  OfferStatus,
} from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import type {
  Activation,
  CreateActivationInput,
  CreateOfferPayload,
  EditActivationInput,
  EditOfferPayload,
} from '@/api/graphql/generated/types';
import { PriceInput, PriceView } from '../AntFormBuilder';
import { Rule } from 'antd/lib/form';
import { ActivationStatus } from '../../api/graphql/generated/types';
import type {
  CreateActivationPayload,
  EditActivationPayload,
} from '../../api/graphql/generated/types';

export type CreateActivationFormModalProps = {
  activationToEdit: Activation | null;
  mode: 'create' | 'view-edit';
  activationModalVisible: boolean;
  pendingActivationEdit: boolean;
  setPendingActivationEdit: (pending: boolean) => void;
  toggleActivationModal: (visible: boolean) => void;
  offerID: OfferID;
  createActivation: (payload: Omit<CreateActivationInput, 'offerID'>) => void;
  editActivation: (
    activationID: ActivationID,
    payload: Omit<EditActivationInput, 'offerID'>,
  ) => void;
};

const ACTIVATION_INFO = {
  name: '',
  description: '',
  pricing: 1,
  status: ActivationStatus.Active,
  mmpAlias: '',
};

const CreateActivationFormModal: React.FC<CreateActivationFormModalProps> = ({
  activationToEdit,
  createActivation,
  editActivation,
  mode,
  toggleActivationModal,
  pendingActivationEdit,
  activationModalVisible,
  setPendingActivationEdit,
}) => {
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [activationInfo, setActivationInfo] = useState(ACTIVATION_INFO);
  const lockedToEdit = mode === 'create';
  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);
  useEffect(() => {
    if (activationToEdit) {
      setActivationInfo({
        name: activationToEdit.name,
        description: activationToEdit.description || '',
        pricing: activationToEdit.pricing,
        status: activationToEdit.status,
        mmpAlias: activationToEdit.mmpAlias,
      });
    }
  }, [activationToEdit]);
  const handleFinishCreate = useCallback(async (values) => {
    console.log('Submit: ', values);
    const payload = {} as Omit<CreateActivationInput, 'offerID'>;
    if (values.name) {
      payload.name = values.name;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    if (values.mmpAlias) {
      payload.mmpAlias = values.mmpAlias;
    }
    if (values.pricing) {
      payload.pricing = values.pricing.price;
    }
    setPendingActivationEdit(true);
    try {
      await createActivation(payload);
      setPendingActivationEdit(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: mode === 'create' ? 'Activation created' : 'Activation updated',
      });
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
    }
  }, []);
  const handleFinishEdit = useCallback(
    async (values) => {
      if (!activationToEdit) return;
      console.log('Submit: ', values);
      const payload = {} as Omit<EditActivationInput, 'offerID'>;
      if (values.name) {
        payload.name = values.name;
      }
      if (values.description) {
        payload.description = values.description;
      }
      if (values.status) {
        payload.status = values.status;
      }
      if (values.mmpAlias) {
        payload.mmpAlias = values.mmpAlias;
      }
      if (values.pricing) {
        payload.pricing = values.pricing.price;
      }
      setPendingActivationEdit(true);
      try {
        await editActivation(activationToEdit.id as ActivationID, payload);
        setPendingActivationEdit(false);
        if (!lockedToEdit) {
          setViewMode(true);
        }
        Modal.success({
          title: 'Success',
          content: mode === 'create' ? 'Activation created' : 'Activation updated',
        });
      } catch (e: any) {
        Modal.error({
          title: 'Failure',
          content: `${e.message}`,
        });
      }
    },
    [activationToEdit],
  );
  const getMeta = () => {
    const meta = {
      disabled: pendingActivationEdit,
      initialValues: activationInfo,
      fields: [
        { key: 'name', label: 'Name', required: true },
        { key: 'description', label: 'Description', widget: 'textarea' },
        {
          key: 'pricing',
          label: 'Pricing',
          widget: PriceInput,
          viewWidget: PriceView,
          initialValue: {
            price: mode === 'create' ? 1 : activationToEdit?.pricing || 1,
            currency: 'USDC Polygon',
          },
        },
        {
          key: 'status',
          label: 'Status',
          widget: 'radio-group',
          options: [
            ActivationStatus.Active,
            ActivationStatus.Inactive,
            ActivationStatus.Planned,
            ActivationStatus.Archived,
          ],
        },
        {
          key: 'mmpAlias',
          label: 'Measurement ID',
          required: true,
          rules: [
            {
              validator: (rule: any, value: any, callback: any) => {
                return new Promise((resolve, reject) => {
                  const re = new RegExp('^[a-zA-Z0-9_-]*$');
                  const urlSafe = re.test(value);
                  if (!urlSafe) {
                    reject(new Error(`Can only contain letters, numbers, underscores and dashes`));
                  } else {
                    resolve('Success');
                  }
                });
              },
            },
          ],
        },
      ],
    };
    return meta;
  };
  return (
    <Modal
      title={mode === 'create' ? 'Add Activation Event' : 'Edit Activation Event'}
      closable={!pendingActivationEdit}
      maskClosable={!pendingActivationEdit}
      visible={activationModalVisible}
      destroyOnClose
      onOk={() => {
        if (viewMode) {
          toggleActivationModal(false);
        } else {
          form.submit();
        }
      }}
      onCancel={() => {
        form.resetFields();
        if (!lockedToEdit) {
          setViewMode(true);
        }
        toggleActivationModal(false);
      }}
      okText={pendingActivationEdit ? 'Loading...' : 'Ok'}
      okButtonProps={{ loading: pendingActivationEdit, disabled: pendingActivationEdit }}
      cancelButtonProps={{ disabled: pendingActivationEdit }}
    >
      <Card style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            layout="vertical"
            form={form}
            onFinish={mode === 'create' ? handleFinishCreate : handleFinishEdit}
          >
            <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          </Form>
        </div>
      </Card>
    </Modal>
  );
};

export default CreateActivationFormModal;
