import { AffiliateStorageFolder, uploadImageToFirestore } from '@/api/firebase/storage';
import { UploadOutlined } from '@ant-design/icons';
import { AffiliateID } from '@wormgraph/helpers';
import { Button, message, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload';

export interface UploadImagesProps {
  acceptedFileTypes?: 'image/*,video/mp4' | 'image/*' | 'video/mp4';
  folderName: AffiliateStorageFolder;
  affiliateID: AffiliateID;
  initFileList?: UploadFile[];
  onFileRemoved: (file: UploadFile) => void;
  onFileUploaded: (file: UploadFile) => void;
}

const UploadImages = (props: UploadImagesProps) => {
  const customUploadImage = async ({ file, onSuccess }: any) => {
    if (file.type.indexOf('image') > -1) {
      if (file.size > 10000000) {
        message.error('Image must be under 10MB');
        return;
      }
    }
    const destination = await uploadImageToFirestore({
      folderName: props.folderName,
      file: file,
      folderID: 'media',
      affiliateID: props.affiliateID,
    });

    props.onFileUploaded({
      uid: file.uid,
      name: file.name,
      type: file.type,
      url: destination,
    });

    onSuccess('ok');
  };

  const onFileRemoved = (file: UploadFile) => {
    props.onFileRemoved(file);
  };

  return (
    <Upload
      defaultFileList={props.initFileList}
      multiple
      accept={props.acceptedFileTypes ?? 'image/*'}
      progress={{
        strokeColor: {
          '0%': '#108ee9',
          '100%': '#87d068',
        },
        strokeWidth: 3,
        format: (percent: number | undefined) => percent && `${parseFloat(percent.toFixed(2))}%`,
      }}
      customRequest={customUploadImage}
      onRemove={onFileRemoved}
    >
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};

export default UploadImages;
