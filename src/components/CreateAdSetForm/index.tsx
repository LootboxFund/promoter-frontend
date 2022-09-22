import {
  AdID,
  AdSetID,
  AdvertiserID,
  ConquestStatus,
  MeasurementPartnerType,
  OfferID,
  OfferStatus,
} from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Alert, Button, Card, Form, Modal, Space } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Ad,
  AdSetStatus,
  CreateAdSetPayload,
  EditAdSetPayload,
  EditOfferPayload,
  OfferPreview,
  Placement,
} from '@/api/graphql/generated/types';
import { AntUploadFile, PriceInput, PriceView } from '../AntFormBuilder';
import { Rule } from 'antd/lib/form';
import { DateView } from '../AntFormBuilder';
import { AdvertiserStorageFolder } from '@/api/firebase/storage';
import AdToAdSetPicker from './AdToAdSetPicker';
import { $Horizontal, $Vertical } from '@/components/generics';
import { Link } from '@umijs/max';
import AdSetToOfferPicker from './AdSetToOfferPicker';

export type CreateAdSetFormProps = {
  adSet?: {
    id: AdSetID;
    name: string;
    description: string;
    status: AdSetStatus;
    advertiserID: AdvertiserID;
    placement: Placement;
    thumbnail: string;
    offerIDs: OfferID[];
    adIDs: AdID[];
  };
  advertiserID: AdvertiserID;
  onSubmitCreate?: (payload: CreateAdSetPayload) => void;
  onSubmitEdit?: (payload: EditAdSetPayload) => void;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
  listOfAds: Ad[];
  listOfOffers: OfferPreview[];
};

const AD_SET_INFO = {
  id: '',
  name: '',
  description: '',
  thumbnail: '',
  status: AdSetStatus.Active,
  advertiserID: '' as AdvertiserID,
  placement: Placement.AfterTicketClaim,
  offerIDs: [] as OfferID[],
  adIDs: [] as AdID[],
};
const CreateAdSetForm: React.FC<CreateAdSetFormProps> = ({
  adSet,
  onSubmitCreate,
  onSubmitEdit,
  mode,
  advertiserID,
  listOfAds,
  listOfOffers,
}) => {
  const newMediaDestination = useRef('');
  const chosenAdSets = useRef([] as AdID[]);
  const chosenOffers = useRef([] as OfferID[]);

  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [adSetInfo, setAdSetInfo] = useState(AD_SET_INFO);
  const [chosenPlacementInternalState, setChosenPlacementInternalState] = useState<Placement>(
    AD_SET_INFO.placement,
  );
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);
  useEffect(() => {
    if (adSet) {
      setAdSetInfo({
        id: adSet.id,
        name: adSet.name,
        description: adSet.description,
        status: adSet.status,
        advertiserID: adSet.advertiserID,
        thumbnail: adSet.thumbnail,
        placement: adSet.placement,
        offerIDs: adSet.offerIDs,
        adIDs: adSet.adIDs,
      });
      setChosenPlacementInternalState(adSet.placement);
    }
  }, [adSet]);

  const handleFinishCreate = useCallback(async (values) => {
    if (!onSubmitCreate) return;
    console.log('Submit: ', values);
    const payload = {} as CreateAdSetPayload;
    if (values.name) {
      payload.name = values.name;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    if (values.placement) {
      payload.placement = values.placement;
    }
    if (chosenAdSets.current && chosenAdSets.current.length > 0) {
      payload.adIDs = chosenAdSets.current;
    }
    if (chosenAdSets.current && chosenAdSets.current.length > 0) {
      payload.adIDs = chosenAdSets.current;
    }
    if (chosenOffers.current && chosenOffers.current.length > 0) {
      payload.offerIDs = chosenOffers.current;
    }
    if (newMediaDestination.current) {
      payload.thumbnail = newMediaDestination.current;
    }
    setPending(true);
    try {
      await onSubmitCreate(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: 'Ad Set Created',
      });
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
    }
  }, []);

  const handleFinishEdit = useCallback(async (values) => {
    if (!onSubmitEdit) return;
    console.log('Submit: ', values);
    const payload = {} as EditAdSetPayload;
    if (values.name) {
      payload.name = values.name;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    // if (values.placement) {
    //   payload.placement = values.placement;
    // }
    if (chosenAdSets.current && chosenAdSets.current.length > 0) {
      payload.adIDs = chosenAdSets.current;
    }
    if (chosenAdSets.current && chosenAdSets.current.length > 0) {
      payload.adIDs = chosenAdSets.current;
    }
    if (chosenOffers.current && chosenOffers.current.length > 0) {
      payload.offerIDs = chosenOffers.current;
    }
    if (newMediaDestination.current) {
      payload.thumbnail = newMediaDestination.current;
    }
    console.log(newMediaDestination.current);
    console.log(`Sending out payload..`);
    console.log(payload);
    setPending(true);
    try {
      await onSubmitEdit(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: 'Ad Set Updated',
      });
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
    }
  }, []);

  const renderAdSetToOfferPicker = () => {
    return (
      <$Vertical>
        {listOfOffers && listOfOffers.length === 0 ? (
          <Alert
            message="You have no offers made yet. You can include offers later or make one now."
            type="warning"
            action={
              <Space>
                <Link to="/manage/offers/create" target="_blank">
                  <Button size="small" type="ghost">
                    New Offer
                  </Button>
                </Link>
              </Space>
            }
            style={{ margin: '00px 0px 20px 0px' }}
          />
        ) : null}
        <AdSetToOfferPicker
          listOfOffers={listOfOffers}
          chosenOffers={chosenOffers}
          disabled={viewMode}
          initialSelectedKeys={adSetInfo.offerIDs}
        />
      </$Vertical>
    );
  };

  const renderAdToAdSetPicker = () => {
    return (
      <$Vertical>
        {listOfAds && listOfAds.length === 0 ? (
          <Alert
            message="You have no ad creatives made yet. You can include creatives later or make one now."
            type="warning"
            action={
              <Space>
                <Link to="/manage/ads/create" target="_blank">
                  <Button size="small" type="ghost">
                    New Creative
                  </Button>
                </Link>
              </Space>
            }
            style={{ margin: '20px 0px' }}
          />
        ) : null}
        <AdToAdSetPicker
          listOfAds={listOfAds}
          chosenPlacement={chosenPlacementInternalState}
          chosenAdSets={chosenAdSets}
          disabled={viewMode}
          initialSelectedKeys={adSetInfo.adIDs}
        />
      </$Vertical>
    );
  };

  const getMeta = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: adSetInfo,
      fields: [
        {
          key: 'basicInfoLabel',
          render() {
            return (
              <fieldset>
                <legend>Basic Infomation</legend>
              </fieldset>
            );
          },
        },
        { key: 'name', label: 'Name', required: true },

        { key: 'description', label: 'Description', widget: 'textarea' },
        {
          key: 'image',
          label: 'Image',
          widget: () => (
            <AntUploadFile
              advertiserID={advertiserID}
              folderName={AdvertiserStorageFolder.ADSET_IMAGE}
              newMediaDestination={newMediaDestination}
              acceptedFileTypes={'image/*'}
            />
          ),
        },
        {
          key: 'status',
          label: 'Status',
          widget: 'radio-group',
          required: true,
          options: [
            AdSetStatus.Active,
            AdSetStatus.Inactive,
            AdSetStatus.Planned,
            AdSetStatus.Archived,
          ],
        },
        {
          key: 'pickCreativesLabel',
          render() {
            return (
              <fieldset>
                <legend>Attach Creatives</legend>
              </fieldset>
            );
          },
        },
        {
          key: 'adSetsPlacementInfo',
          render() {
            return (
              <span style={{ color: 'gray', paddingBottom: '10px' }}>
                {`Pick a Placement for your Ad Set (All creatives will match this placement).`}
              </span>
            );
          },
        },
        {
          key: 'placement',
          widget: 'select',
          viewWidget: (data: any) => (
            <input disabled={true} value={data.value} style={{ margin: '10px 0px' }} />
          ),
          required: true,
          disabled: mode !== 'create',
          options: [Placement.AfterTicketClaim, Placement.BeforePayout, Placement.AfterPayout],
          rules: [
            {
              validator: (rule: any, value: any, callback: any) => {
                return new Promise((resolve, reject) => {
                  setChosenPlacementInternalState(value);
                  resolve(value);
                });
              },
            },
          ],
        },
        {
          key: 'creativesPlacementInfo',
          render() {
            return (
              <span style={{ color: 'gray', paddingBottom: '10px' }}>
                {`Creatives must match Placement`}
              </span>
            );
          },
        },
        {
          key: 'adIDs',
          rules: [
            // {
            //   validator: (rule: any, value: any, callback: any) => {
            //     // Do async validation to check if username already exists
            //     // Use setTimeout to emulate api call
            //     return new Promise((resolve, reject) => {
            //       if (adSetInfo.adIDs && adSetInfo.adIDs.length > 0) {
            //         resolve('success');
            //       } else {
            //         reject(new Error(`Please choose some ad creatives`));
            //       }
            //     });
            //   },
            // },
          ],
          widget: renderAdToAdSetPicker,
          viewWidget: renderAdToAdSetPicker,
        },
        {
          key: 'pickOffersLabel',
          render() {
            return (
              <fieldset>
                <legend>{`Available In Offers (Can modify anytime)`}</legend>
              </fieldset>
            );
          },
        },
        {
          key: 'offerIDs',
          rules: [
            // {
            //   validator: (rule: any, value: any, callback: any) => {
            //     // Do async validation to check if username already exists
            //     // Use setTimeout to emulate api call
            //     return new Promise((resolve, reject) => {
            //       if (adSetInfo.adIDs && adSetInfo.adIDs.length > 0) {
            //         resolve('success');
            //       } else {
            //         reject(new Error(`Please choose some ad creatives`));
            //       }
            //     });
            //   },
            // },
          ],
          widget: renderAdSetToOfferPicker,
          viewWidget: renderAdSetToOfferPicker,
        },
      ],
    };
    if (!viewMode) {
      meta.fields.push({
        key: 'submitLabel',
        render() {
          return (
            <fieldset>
              <legend>Submit</legend>
            </fieldset>
          );
        },
      });
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
        <Form
          layout="horizontal"
          form={form}
          onFinish={mode === 'create' ? handleFinishCreate : handleFinishEdit}
        >
          <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          {!viewMode && (
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
                {mode === 'create' ? (
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
          )}
        </Form>
      </div>
    </Card>
  );
};

export default CreateAdSetForm;
