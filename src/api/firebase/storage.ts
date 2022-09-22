import { storage } from './app';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { v4 as uuidV4 } from 'uuid';
import { AdvertiserID } from '@wormgraph/helpers';

export const USER_ASSET_SUB_FOLDER = 'users';
export const LOOTBOX_ADVERTISER_ASSET_FOLDER = `advertiser-assets`;
export enum AdvertiserStorageFolder {
  CAMPAIGN_IMAGE = 'campaign-image',
  OFFER_IMAGE = 'offer-image',
  ADSET_IMAGE = 'adset-image',
  AD_IMAGE = 'ad-image',
  AD_VIDEO = 'ad-video',
}

/**
 * Save image to gbucket
 * @param fileDestination filepath within the gbucket
 * @param file
 */
const uploadImageToBucket = async (fileDestination: string, file: File) => {
  console.log('uploadImageToBucket');
  // Create a reference to 'mountains.jpg'
  const storageRef = ref(storage, fileDestination);
  console.log('is it working?');
  // 'file' comes from the Blob or File API
  await uploadBytes(storageRef, file);
  console.log('uploaded bites');
  const downloadURL = await getDownloadURL(storageRef);
  console.log(downloadURL);
  return downloadURL;
};

export const uploadImageToFirestore = async ({
  folderName,
  folderID,
  file,
  advertiserID,
}: {
  folderName: AdvertiserStorageFolder;
  folderID?: string;
  file: File;
  advertiserID: AdvertiserID;
}): Promise<string> => {
  const extension = file?.name?.split('.').pop();
  const fileID = uuidV4();
  const fileDestination = `${LOOTBOX_ADVERTISER_ASSET_FOLDER}/advertiser/${advertiserID}/${folderName}/${
    folderID || 'unknown'
  }/${fileID}/${extension ? '.' + extension : ''}`;
  console.log(`fileDestination = ${fileDestination}`);
  const downloadURL = await uploadImageToBucket(fileDestination, file);
  return downloadURL;
};
