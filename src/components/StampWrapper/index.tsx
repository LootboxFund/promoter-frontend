import { useCallback, useRef, useState } from 'react';
import React from 'react';
import { toPng } from 'html-to-image';
import { Button } from 'antd';

interface StampWrapper {
  stampTemplate: () => React.ReactNode;
  fileName?: string;
}

const StampLootbox_Classic: React.FC<StampWrapper> = ({ stampTemplate, fileName }) => {
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onButtonClick = useCallback(() => {
    if (ref.current === null) {
      return;
    }
    setLoading(true);
    toPng(ref.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = fileName || 'my-image-name.png';
        link.href = dataUrl;
        link.click();
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [ref]);
  return (
    <div>
      <div ref={ref}>{stampTemplate()}</div>
      <br />
      <Button loading={loading} onClick={() => onButtonClick()}>
        Download Image
      </Button>
    </div>
  );
};

export default StampLootbox_Classic;
