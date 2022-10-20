import { useCallback, useRef, useState } from 'react';
import React from 'react';
import { toPng } from 'html-to-image';
import { Button, message } from 'antd';
import { $Horizontal } from '@/components/generics';

interface StampWrapper {
  stampTemplate: () => React.ReactNode;
  fileName?: string;
  primaryDownload?: boolean;
  inviteLink?: string;
}

const StampLootbox_Classic: React.FC<StampWrapper> = ({
  stampTemplate,
  fileName,
  primaryDownload,
  inviteLink,
}) => {
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onButtonClick = () => {
    if (!ref.current) {
      return;
    }
    setLoading(true);
    toPng(ref.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${fileName}.png` || 'ticket-invite-graphic.png';
        link.href = dataUrl;
        link.click();
        setLoading(false);
      })
      .catch((err) => {
        console.log(`An error occurred generating the image!`);
        console.log(err);
      });
  };
  return (
    <div>
      <div ref={ref}>{stampTemplate()}</div>
      <br />
      <$Horizontal justifyContent="flex-start">
        <Button
          loading={loading}
          onClick={() => onButtonClick()}
          {...(primaryDownload ? { type: 'primary' } : {})}
        >
          Download Image
        </Button>
        {inviteLink && (
          <Button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              message.success('Invite Link copied to clipboard!');
            }}
            style={{ marginLeft: '5px' }}
          >
            Copy Link
          </Button>
        )}
      </$Horizontal>
    </div>
  );
};

export default StampLootbox_Classic;
