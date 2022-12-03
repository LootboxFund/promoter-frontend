// Size mapping for thumbnails - they get this appended to the filename in storage
export const sizeMapping = {
  sm: '160x224',
  md: '300x420',
};

export const THUMBS_FOLDER = 'thumbs';

/**
 * When a file is uploaded to stamp storage bucket, a firebase function creates 2 thumbnails under it.
 * i.e.
 *
 * Object created: lootbox-stamp-image/0x082Eb37D5Cfe7d4373c585Ed3E04E294684b7dAd/lootbox.png
 * then the following thumbnails are also made:
 * lootbox-stamp-image/0x082Eb37D5Cfe7d4373c585Ed3E04E294684b7dAd/thumbs/lootbox_166x233.png etc
 *
 *
 * @param file filename: e.g. https://api.storage.com/lootbox-stamp-image/0x082Eb37D5Cfe7d4373c585Ed3E04E294684b7dAd/lootbox.png
 * @param size 'sm' | 'md'
 */
export const convertFilenameToThumbnail = (file: string, size: 'sm' | 'md') => {
  const decodedFile = decodeURIComponent(file);
  const fileparts = decodedFile.split('/');
  const filename = fileparts.pop();
  const filenameParts = filename?.split('.');
  const extension = filenameParts?.pop();
  const originalFilenameWithoutExtension = filenameParts?.join('.');
  if (!filename || !extension || !originalFilenameWithoutExtension) {
    console.log('invalid filename', decodedFile);
    return decodedFile;
  }

  const newFilename = `${originalFilenameWithoutExtension}_${sizeMapping[size]}.${extension}`;
  const thumbnailFilename = [...fileparts, THUMBS_FOLDER, newFilename].join('/');
  return thumbnailFilename;
};
