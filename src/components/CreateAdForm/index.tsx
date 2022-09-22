import {
  AdID,
  AdvertiserID,
  AspectRatio,
  MeasurementPartnerType,
  OfferStatus,
} from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Image, Modal } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Ad,
  AdStatus,
  CreateAdPayload,
  CreativeType,
  EditAdPayload,
  OfferPreview,
  Placement,
} from '@/api/graphql/generated/types';
import { AntColorPicker, AntUploadFile, PriceInput, PriceView } from '../AntFormBuilder';
import { Rule } from 'antd/lib/form';
import { DateView } from '../AntFormBuilder';
import { AdvertiserStorageFolder } from '@/api/firebase/storage';
import { $Horizontal } from '@/components/generics';

export enum AdSampleCallToActions {
  'Custom' = 'Custom',
  'Sign Up' = 'Sign Up',
  'Download Game' = 'Download Game',
  'Join Community' = 'Join Community',
  'Start Free Trial' = 'Start Free Trial',
  'Subscribe' = 'Subscribe',
  'Pre-Register' = 'Pre-Register',
  'Follow Socials' = 'Follow Socials',
  'Shop Now' = 'Shop Now',
  'Visit Website' = 'Visit Website',
  'Donate Now' = 'Donate Now',
  'RSVP Event' = 'RSVP Event',
  'Learn More' = 'Learn More',
  'Join Whitelist' = 'Join Whitelist',
  'Download App' = 'Download App',
  'Book Now' = 'Book Now',
  'Get Offer' = 'Get Offer',
  'Get Quote' = 'Get Quote',
  'Get Directions' = 'Get Directions',
  'Contact Us' = 'Contact Us',
  'Play Game' = 'Play Game',
  'Listen Now' = 'Listen Now',
  'Read More' = 'Read More',
  'Buy Now' = 'Buy Now',
  'Download' = 'Download',
  'Install Now' = 'Install Now',
  'Use App' = 'Use App',
  'Watch Now' = 'Watch Now',
}

export type CreateAdFormProps = {
  ad?: {
    id?: string;
    advertiserID: AdvertiserID;
    name: string;
    description: string;
    status: AdStatus;
    placement: Placement;
    publicInfo: string;
    creative: {
      creativeType: CreativeType;
      creativeLinks: string[];
      callToAction: AdSampleCallToActions;
      thumbnail: string;
      infographicLink?: string;
      aspectRatio: AspectRatio;
      themeColor: string;
    };
  };
  advertiserID: AdvertiserID;
  onSubmitCreate?: (payload: CreateAdPayload) => void;
  onSubmitEdit?: (payload: EditAdPayload) => void;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
};

const AD_INFO = {
  id: '',
  advertiserID: '',
  name: '',
  description: '',
  status: AdStatus.Active,
  publicInfo: '',
  placement: Placement.AfterTicketClaim,
  creative: {
    creativeType: CreativeType.Video,
    creativeLinks: [] as string[],
    callToAction: AdSampleCallToActions['Get Offer'],
    thumbnail: '',
    infographicLink: '',
    aspectRatio: AspectRatio.Portrait2x3,
    themeColor: '#ff821c',
  },
};
const CreateAdForm: React.FC<CreateAdFormProps> = ({
  ad,
  onSubmitCreate,
  onSubmitEdit,
  mode,
  advertiserID,
}) => {
  const newMediaDestination = useRef('');
  const [previewImage, setPreviewImage] = useState('');
  const [previewVideo, setPreviewVideo] = useState('');
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [adInfo, setAdInfo] = useState(AD_INFO);
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);

  useEffect(() => {
    if (ad && mode !== 'create') {
      setAdInfo({
        id: ad.id as AdID,
        advertiserID: ad.advertiserID,
        name: ad.name,
        description: ad.description,
        status: ad.status,
        placement: ad.placement,
        publicInfo: ad.publicInfo,
        creative: {
          creativeType: ad.creative.creativeType,
          creativeLinks: ad.creative.creativeLinks,
          callToAction: ad.creative.callToAction as AdSampleCallToActions,
          thumbnail: ad.creative.thumbnail,
          infographicLink: ad.creative.infographicLink || '',
          aspectRatio: ad.creative.aspectRatio,
          themeColor: ad.creative.themeColor,
        },
      });
    }
  }, [ad]);
  const handleCreateFinish = useCallback(async (values) => {
    if (!onSubmitCreate) return;
    console.log('Submit: ', values);
    const payload = {
      creative: {},
    } as CreateAdPayload;
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
    if (values.publicInfo) {
      payload.publicInfo = values.publicInfo;
    }
    if (values.creative.creativeType) {
      payload.creative.creativeType = values.creative.creativeType;
    }
    if (values.creative.creativeLinks) {
      payload.creative.creativeLinks = values.creative.creativeLinks;
    }
    if (values.creative.callToAction) {
      payload.creative.callToAction = values.customCTA || values.creative.callToAction;
    }
    if (values.creative.aspectRatio) {
      payload.creative.aspectRatio = values.creative.aspectRatio;
    }
    if (values.creative.themeColor) {
      payload.creative.themeColor = adInfo.creative.themeColor;
    }
    if (newMediaDestination.current) {
      payload.creative.creativeLinks = [newMediaDestination.current];
    }
    if (newMediaDestination.current) {
      payload.creative.thumbnail = newMediaDestination.current;
    }
    console.log(adInfo);
    setPending(true);
    try {
      await onSubmitCreate(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: mode === 'create' ? 'Offer created' : 'Offer updated',
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
  const handleEditFinish = useCallback(async (values) => {
    if (!onSubmitEdit) return;
    console.log('Submit: ', values);
    const payload = {
      creative: {},
    } as EditAdPayload;
    if (ad?.id) {
      payload.name = values.name;
    }
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
    if (values.publicInfo) {
      payload.publicInfo = values.publicInfo;
    }
    if (payload.creative && values.creative.creativeType) {
      payload.creative.creativeType = values.creative.creativeType;
    }
    if (payload.creative && values.creative.creativeLinks) {
      payload.creative.creativeLinks = values.creative.creativeLinks;
    }
    if (payload.creative && values.creative.callToAction) {
      payload.creative.callToAction = values.customCTA || values.creative.callToAction;
    }
    if (payload.creative && values.creative.aspectRatio) {
      payload.creative.aspectRatio = values.creative.aspectRatio;
    }
    if (payload.creative && adInfo.creative.themeColor) {
      payload.creative.themeColor = adInfo.creative.themeColor;
    }
    if (payload.creative && newMediaDestination.current) {
      payload.creative.creativeLinks = [newMediaDestination.current];
    }
    if (payload.creative && newMediaDestination.current) {
      payload.creative.thumbnail = newMediaDestination.current;
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
        content: 'Offer updated',
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

  const meta1 = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: adInfo,
      fields: [
        {
          key: 'placement',
          label: 'Placement',
          widget: 'select',
          tooltip: 'This determines where your ad is shown',
          required: true,
          initialValue: adInfo.placement,
          options: [Placement.AfterPayout, Placement.BeforePayout, Placement.AfterTicketClaim],
        },
        {
          key: 'creative.aspectRatio',
          label: 'Aspect Ratio',
          widget: 'select',
          required: true,
          initialValue: adInfo.creative.aspectRatio,
          options: [
            AspectRatio.Square1x1,
            AspectRatio.Landscape16x9,
            AspectRatio.Portrait9x16,
            AspectRatio.Portrait2x3,
            AspectRatio.Tablet4x5,
          ],
        },
        {
          key: 'creative.creativeType',
          label: 'Media Type',
          widget: 'select',
          required: true,
          initialValue: adInfo.creative.creativeType,
          // @ts-ignore
          options: [CreativeType.Image, CreativeType.Video],
        },
      ],
    };
    if (!viewMode) {
      meta.fields.push({
        key: 'creative.thumbnail',
        label: 'Media',
        rules: [
          {
            validator: (rule: any, value: any, callback: any) => {
              // Do async validation to check if username already exists
              // Use setTimeout to emulate api call
              return new Promise((resolve, reject) => {
                if (!newMediaDestination.current) {
                  reject(new Error(`Upload a file`));
                } else {
                  resolve(newMediaDestination.current);
                }
              });
            },
          },
        ],
        // @ts-ignore
        widget: () => (
          <AntUploadFile
            advertiserID={advertiserID}
            folderName={AdvertiserStorageFolder.AD_VIDEO}
            newMediaDestination={newMediaDestination}
            acceptedFileTypes={'image/*,video/*'}
          />
        ),
      });
    }
    return meta;
  };
  const meta2 = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: adInfo,
      fields: [
        { key: 'publicInfo', label: 'Public Info', widget: 'textarea', required: true },
        {
          key: 'creative.callToAction',
          label: 'Call To Action',
          widget: 'select',
          required: true,
          initialValue: adInfo.creative.callToAction,
          options: Object.keys(AdSampleCallToActions),
        },
      ],
    };

    // @ts-ignore
    meta.fields.push({
      key: 'customCTA',
      label: 'Custom CTA',
    });

    meta.fields.push({
      key: 'destination',
      label: 'Landing Page URL',
      // @ts-ignore
      widget: () => (
        <input value="Set By Offer" disabled style={{ width: '100%', color: 'gray' }} />
      ),
      viewWidget: () => <i style={{ color: 'gray' }}>{'Set By Offer'}</i>,
    });
    meta.fields.push({
      key: 'creative.themeColor',
      label: 'Theme Color',
      required: true,
      // @ts-ignore
      widget: () => (
        <AntColorPicker
          initialColor={adInfo.creative.themeColor}
          updateColor={(hex: string) => {
            console.log(`hhhhh = ${hex}`);
            setAdInfo({
              ...adInfo,
              creative: {
                ...adInfo.creative,
                themeColor: hex,
              },
            });
          }}
        />
      ),
    });
    return meta;
  };
  const meta3 = () => {
    return {
      columns: 1,
      disabled: pending,
      initialValues: adInfo,
      fields: [
        { key: 'name', label: 'Name', required: true },
        { key: 'description', label: 'Private Notes', widget: 'textarea' },
        {
          key: 'status',
          label: 'Status',
          required: true,
          widget: 'radio-group',
          options: [AdStatus.Active, AdStatus.Inactive, AdStatus.Planned, AdStatus.Archived],
        },
      ],
    };
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
          onFinish={mode === 'create' ? handleCreateFinish : handleEditFinish}
        >
          <fieldset>
            <legend>{`Media Upload`}</legend>
            <FormBuilder form={form} meta={meta1()} viewMode={viewMode} />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              {previewImage && (
                <Image
                  width={200}
                  src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                  style={{ marginBottom: '50px' }}
                />
              )}
              {previewVideo && (
                <video width="320" height="240" controls>
                  <source src="movie.mp4" type="video/mp4" />
                  <source src="movie.ogg" type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>{`Public Details`}</legend>
            <FormBuilder form={form} meta={meta2()} viewMode={viewMode} />
          </fieldset>
          <fieldset>
            <legend>{`Private Details`}</legend>
            <FormBuilder form={form} meta={meta3()} viewMode={viewMode} />
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
            </fieldset>
          )}
        </Form>
      </div>
    </Card>
  );
};

export default CreateAdForm;
