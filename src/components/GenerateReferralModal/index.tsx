import { Button, Input, InputNumber, message, Modal, Tabs } from 'antd';
import { $Vertical, $Horizontal, $InfoDescription } from '@/components/generics';
import { useEffect, useState } from 'react';
import QRCodeComponent from 'easyqrcodejs';

export type GenerateReferralModalProps = {
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
};
enum INVITE_TYPE {
  GENESIS = 'GENESIS',
  VIRAL = 'VIRAL',
  PARTICIPATION = 'PARTICIPATION',
}
const GenerateReferralModal: React.FC<GenerateReferralModalProps> = ({ isOpen, setIsOpen }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<INVITE_TYPE>(INVITE_TYPE.GENESIS);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [attributedTo, setAttributedTo] = useState('');
  const [quantityTickets, setQuantityTickets] = useState(1);
  useEffect(() => {
    const link = `${generatedUrl}`;
    const options_object = {
      // ====== Basic
      text: link,
      width: 120,
      height: 120,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCodeComponent.CorrectLevel.H, // L, M, Q, <H></H>
      quietZone: 12,
      /*
        title: 'QR Title', // content

        titleColor: "#004284", // color. default is "#000"
        titleBackgroundColor: "#fff", // background color. default is "#fff"
        titleHeight: 70, // height, including subTitle. default is 0
        titleTop: 25, // draws y coordinates. default is 30
    */
    };
    const el = document.getElementById('qrcode');
    if (el) {
      if (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      new QRCodeComponent(el, options_object);
    }
  }, [generatedUrl]);
  const exitModal = () => {
    setIsOpen(false);
    setGeneratedUrl('');
    setCampaignName('');
    setQuantityTickets(1);
    setAttributedTo('');
  };
  const renderCopyableReferral = () => {
    return (
      <$Horizontal>
        <div id="qrcode" />
        <$Vertical style={{ flex: 1, paddingTop: '5px' }}>
          <h3>Share Tickets with Friends</h3>
          <$InfoDescription fontSize="0.7rem" marginBottom="10px">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt
          </$InfoDescription>
          <Input.Group compact>
            <Input
              prefix={<span>🔒 </span>}
              style={{ maxWidth: '80%' }}
              value={generatedUrl}
              readOnly
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedUrl);
                message.success('Invite link copied to clipboard');
              }}
              type="primary"
            >
              Copy
            </Button>
          </Input.Group>
        </$Vertical>
      </$Horizontal>
    );
  };
  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        exitModal();
      }}
      footer={null}
    >
      <Tabs
        type="card"
        activeKey={activeTab}
        onChange={(key) => {
          setGeneratedUrl('');
          setActiveTab(key as INVITE_TYPE);
          console.log(`Now on key = ${key}`);
        }}
      >
        <Tabs.TabPane tab="Regular Invite" key={INVITE_TYPE.GENESIS}>
          <h3>Regular Invite</h3>
          <$InfoDescription fontSize="0.8rem">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore.
          </$InfoDescription>
          <$Vertical>
            <label
              style={{ marginBottom: '5px', color: 'gray' }}
            >{`Campaign Name (optional)`}</label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Campaign Name"
            />
          </$Vertical>
          <br />
          <br />
          <br />

          {generatedUrl && activeTab === INVITE_TYPE.GENESIS ? (
            renderCopyableReferral()
          ) : (
            <$Horizontal justifyContent="flex-end">
              <Button onClick={() => exitModal()} style={{ marginRight: '5px' }}>
                Cancel
              </Button>
              <Button
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    setGeneratedUrl('https://lootbox.fund');
                  }, 1000);
                }}
                type="primary"
              >
                Generate Invite
              </Button>
            </$Horizontal>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Viral Invite" key={INVITE_TYPE.VIRAL}>
          <h3>Viral Invite</h3>
          <$InfoDescription fontSize="0.8rem">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore.
          </$InfoDescription>
          <$Vertical>
            <label
              style={{ marginBottom: '5px', color: 'gray' }}
            >{`Campaign Name (optional)`}</label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Campaign Name"
            />
          </$Vertical>

          <$Vertical style={{ marginTop: '10px' }}>
            <label
              style={{ marginBottom: '5px', color: 'gray' }}
            >{`Attributed To (optional)`}</label>
            <Input
              value={attributedTo}
              onChange={(e) => setAttributedTo(e.target.value)}
              placeholder="Someone Else's User ID"
            />
          </$Vertical>
          <br />
          <br />
          <br />

          {generatedUrl && activeTab === INVITE_TYPE.VIRAL ? (
            renderCopyableReferral()
          ) : (
            <$Horizontal justifyContent="flex-end">
              <Button onClick={() => exitModal()} style={{ marginRight: '5px' }}>
                Cancel
              </Button>
              <Button
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    setGeneratedUrl('https://lootbox.fund');
                  }, 1000);
                }}
                type="primary"
              >
                Generate Invite
              </Button>
            </$Horizontal>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Participation Rewards" key={INVITE_TYPE.PARTICIPATION}>
          <h3>Participation Rewards</h3>
          <$InfoDescription fontSize="0.8rem">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore.
          </$InfoDescription>
          <$Vertical>
            <label
              style={{ marginBottom: '5px', color: 'gray' }}
            >{`Campaign Name (optional)`}</label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Campaign Name"
            />
          </$Vertical>
          <$Vertical style={{ marginTop: '10px' }}>
            <label
              style={{ marginBottom: '5px', color: 'gray' }}
            >{`Attributed To (optional)`}</label>
            <Input
              value={attributedTo}
              onChange={(e) => setAttributedTo(e.target.value)}
              placeholder="Someone Else's User ID"
            />
          </$Vertical>
          <$Vertical style={{ marginTop: '10px' }}>
            <label style={{ marginBottom: '5px', color: 'gray' }}>{`Quantity of Tickets`}</label>
            <InputNumber
              value={quantityTickets}
              onChange={(e) => setQuantityTickets(e)}
              min={1}
              style={{ width: '100%' }}
            />
          </$Vertical>
          <br />
          <br />
          <br />
          {generatedUrl && activeTab === INVITE_TYPE.PARTICIPATION ? (
            renderCopyableReferral()
          ) : (
            <$Horizontal justifyContent="flex-end">
              <Button onClick={() => exitModal()} style={{ marginRight: '5px' }}>
                Cancel
              </Button>
              <Button
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    setGeneratedUrl('https://lootbox.fund');
                  }, 1000);
                }}
                type="primary"
              >
                Generate Invites
              </Button>
            </$Horizontal>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default GenerateReferralModal;
