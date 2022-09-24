import type { Moment } from 'moment';
import { Button, Col, InputNumber, message, Row, Select, Spin, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';
import { AdvertiserID, AffiliateID, ConquestID } from '@wormgraph/helpers';
import { AffiliateStorageFolder, uploadImageToFirestore } from '@/api/firebase/storage';
import { $Vertical, $Horizontal } from '@/components/generics';

export const HiddenViewWidget = (data: any) => null;

interface AntUploadFileProps {
  affiliateID: AffiliateID;
  newMediaDestination: React.MutableRefObject<string>;
  folderName: AffiliateStorageFolder;
  acceptedFileTypes: 'image/*,video/*' | 'image/*' | 'video/*';
}
export const AntUploadFile: React.FC<AntUploadFileProps> = ({
  affiliateID,
  newMediaDestination,
  folderName,
  acceptedFileTypes,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const customUploadImage = async ({ file, onSuccess }: any) => {
    const destination = await uploadImageToFirestore({
      folderName,
      file: file,
      folderID: 'media',
      affiliateID,
    });
    newMediaDestination.current = destination;

    onSuccess('ok');
  };
  const handleChange: UploadProps['onChange'] = async (info: any) => {
    console.log(info);

    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
    let newFileList = [...info.fileList];

    // 1. Limit the number of uploaded files
    // Only to show one recent uploaded files, and old ones will be replaced by the new
    newFileList = newFileList.slice(-1);

    // 2. Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });
    console.log(newFileList);
    setFileList(newFileList);
  };
  const props = {
    onChange: handleChange,
    multiple: false,
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent: any) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };
  return (
    <$Vertical>
      <Upload
        {...props}
        fileList={fileList}
        listType="text"
        style={{ overflow: 'hidden' }}
        accept={acceptedFileTypes}
        customRequest={customUploadImage}
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
    </$Vertical>
  );
};

export const DateView = ({ value }: { value: Moment }) => value.format('MMM Do YYYY');

export const PriceInput = ({ value, onChange }: { value: any; onChange: any }) =>
  value ? (
    <Row gutter={10}>
      <Col span={12}>
        <InputNumber
          style={{ width: '100%' }}
          value={value.price}
          min={0}
          onChange={(v) => onChange({ price: v, currency: value.currency })}
          formatter={(value) => `$ ${value}`}
        />
      </Col>
      <Col span={12}>
        <Select
          value={value.currency}
          onChange={(v) => onChange({ price: value.price, currency: v })}
        >
          <Select.Option value="USDC_Polygon">USDC Polygon</Select.Option>
        </Select>
      </Col>
    </Row>
  ) : null;

export const PriceView = ({ value }: { value: any }) => {
  return (
    <span>
      ${value.price} {value.currency}
    </span>
  );
};

export const AntColorPicker = ({ updateColor, initialColor }: any) => {
  const [color, setColor] = useState();
  useEffect(() => {
    setColor(initialColor);
  }, []);
  const handleChangeComplete = (data: any) => {
    setColor(data.hex);
    console.log(`chrome color picker data`, data.hex);
    updateColor(data.hex);
  };
  return <ChromePicker color={color} onChangeComplete={handleChangeComplete} />;
};
