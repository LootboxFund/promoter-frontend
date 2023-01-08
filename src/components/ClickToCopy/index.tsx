import { message } from 'antd';

export type ClickToCopyProps = {
  style?: Record<string, unknown>;
  text: string;
  showTip?: boolean;
};

const ClickToCopy: React.FC<ClickToCopyProps> = ({ style, text, showTip }) => {
  const tipStyle = {
    color: '#358FEE',
    fontStyle: 'italic',
  };
  const styleToApply = style ? { ...style, ...tipStyle } : { ...tipStyle };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };
  return (
    <span
      onClick={copyToClipboard}
      style={{
        cursor: 'pointer',
        ...styleToApply,
      }}
    >
      {`${text}${showTip ? ' (Click to Copy)' : ''}`}
    </span>
  );
};

export default ClickToCopy;
