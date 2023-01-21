import { Badge, Button, Input, InputNumber, message, Modal, Tabs, Tag } from 'antd';
import { $Vertical, $Horizontal, $InfoDescription, $ErrorMessage } from '@/components/generics';
import { useEffect, useState } from 'react';
import QRCodeComponent from 'easyqrcodejs';
import { useMutation } from '@apollo/client';
import {
  BulkCreateReferralResponseSuccess,
  MutationBulkCreateReferralArgs,
  MutationCreateReferralArgs,
  ReferralType,
  ResponseError,
} from '@/api/graphql/generated/types';
import {
  BulkCreateReferralResponseFE,
  BULK_CREATE_REFERRAL,
  CreateReferralFE,
  CreateReferralResponseFE,
  CREATE_REFERRAL,
} from './api.gql';
import { LootboxID, TournamentID } from '@wormgraph/helpers';
import { manifest } from '../../manifest';

export type GenerateReferralModalProps = {
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
  lootboxID?: LootboxID;
  tournamentID: TournamentID;
};
const GenerateReferralModal: React.FC<GenerateReferralModalProps> = ({
  isOpen,
  setIsOpen,
  lootboxID,
  tournamentID,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ReferralType>(ReferralType.Genesis);
  const [errorMessage, setErrorMessage] = useState('');
  const [csvFile, setCsvFile] = useState<string>('');
  const [campaignName, setCampaignName] = useState('');
  const [attributedTo, setAttributedTo] = useState('');
  const [quantityTickets, setQuantityTickets] = useState(10);
  const [createdReferral, setCreatedReferral] = useState<CreateReferralFE | null>(null);
  const inviteLink = `${manifest.microfrontends.webflow.referral}?r=${createdReferral?.slug}`;
  const inviteGraphic = createdReferral?.inviteGraphic;
  const [createReferral, { loading: loadingReferralCreation }] = useMutation<
    { createReferral: CreateReferralResponseFE | ResponseError },
    MutationCreateReferralArgs
  >(CREATE_REFERRAL);
  const [bulkCreateReferral] = useMutation<
    { bulkCreateReferral: BulkCreateReferralResponseFE | ResponseError },
    MutationBulkCreateReferralArgs
  >(BULK_CREATE_REFERRAL);
  useEffect(() => {
    if (createdReferral) {
      const options_object = {
        // ====== Basic
        text: inviteLink,
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
    }
  }, [createdReferral]);
  const exitModal = () => {
    setIsOpen(false);
    setCreatedReferral(null);
    setCampaignName('');
    setQuantityTickets(1);
    setAttributedTo('');
    setCsvFile('');
  };
  const generateReferral = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // if (!lootboxID) {
      //   throw new Error('A Lootbox is required to generated a referral invite link');
      // } else
      if (!tournamentID) {
        throw new Error('Tournament is required to generate a referral invite link');
      }

      const { data } = await createReferral({
        variables: {
          payload: {
            campaignName,
            lootboxID: lootboxID,
            tournamentId: tournamentID,
            type: activeTab,
            promoterId: !!attributedTo ? attributedTo : undefined,
          },
        },
      });

      if (!data) {
        setLoading(false);
        throw new Error(`An error occurred!`);
      } else if (data?.createReferral?.__typename === 'ResponseError') {
        setLoading(false);
        throw new Error(
          data?.createReferral.error?.message ||
            'An error occurred when creating the referral invite link! No data returned',
        );
      }

      const referral = (data.createReferral as CreateReferralResponseFE).referral;

      if (referral) {
        setCreatedReferral(referral);
      }
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred when creating the referral invite link!');
      setLoading(false);
    }
  };

  const generateBulkReferral = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // if (!lootboxID) {
      //   throw new Error('A Lootbox is required to generated a referral invite link');
      // } else
      if (!tournamentID) {
        throw new Error('Tournament is required to generate a referral invite link');
      } else if (quantityTickets <= 0) {
        throw new Error('Must bulk participation rewards more than 0');
      }

      const { data } = await bulkCreateReferral({
        variables: {
          payload: {
            campaignName,
            tournamentId: tournamentID,
            type: ReferralType.OneTime,
            numReferrals: quantityTickets,
            promoterId: !!attributedTo ? attributedTo : undefined,
            lootboxID: lootboxID,
          },
        },
      });

      if (!data) {
        setLoading(false);
        throw new Error(`An error occurred creating participation rewards! No data returned`);
      } else if (data?.bulkCreateReferral?.__typename === 'ResponseError') {
        setLoading(false);
        throw new Error(
          data?.bulkCreateReferral.error?.message ||
            'An error occurred creating participation rewards! bulkCreateReferral.error',
        );
      }
      const csv = (data.bulkCreateReferral as BulkCreateReferralResponseSuccess).csv;
      setCsvFile(csv);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred creating participation rewards!');
      setLoading(false);
    }
  };
  const renderCopyableReferral = () => {
    return (
      <$Vertical>
        <$Horizontal>
          <div id="qrcode" />
          <$Vertical style={{ flex: 1, paddingTop: '5px' }}>
            <h3>Share Tickets with Friends</h3>
            <$InfoDescription fontSize="0.7rem" marginBottom="10px">
              Get your FREE LOOTBOX fan ticket and earn a share of the competition prize money if
              your favorite contestant wins!
            </$InfoDescription>
            <Input.Group compact>
              <Input
                prefix={<span>🔒 </span>}
                style={{ maxWidth: '80%' }}
                value={inviteLink}
                readOnly
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  message.success('Invite link copied to clipboard');
                }}
                type="primary"
              >
                Copy
              </Button>
            </Input.Group>
          </$Vertical>
        </$Horizontal>
        {inviteGraphic && (
          <a
            href={inviteGraphic}
            download
            target="_blank"
            rel="noreferrer"
            style={{ textAlign: 'end' }}
          >
            <Button loading={loading} type="link">
              Download Invite Graphic
            </Button>
          </a>
        )}
      </$Vertical>
    );
  };
  const renderDownloadCsv = () => {
    return (
      <$Horizontal justifyContent="flex-end">
        <Button onClick={() => exitModal()} style={{ marginRight: '5px' }}>
          Cancel
        </Button>
        <a href={csvFile} download style={{ fontStyle: 'italic' }}>
          <Button style={{ backgroundColor: '#4baf21', border: '0px solid white', color: 'white' }}>
            Download CSV
          </Button>
        </a>
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
          setCreatedReferral(null);
          setActiveTab(key as ReferralType);
          setCsvFile('');
        }}
      >
        <Tabs.TabPane tab="Regular Invite" key={ReferralType.Genesis}>
          <h3>Regular Invite</h3>
          <$InfoDescription fontSize="0.8rem">
            {`Regular invites will allow fans to redeem 1 ticket each for this event. Event organizers
            should use regular invites. `}
            <a href="https://lootbox.fyi/3tYiGVs" target="_blank" rel="noreferrer">
              View Tutorial
            </a>
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
              placeholder="Someone Else's Promoter ID"
            />
          </$Vertical>
          <br />
          <br />
          <br />

          {createdReferral && activeTab === ReferralType.Genesis ? (
            renderCopyableReferral()
          ) : (
            <$Horizontal justifyContent="flex-end">
              <Button onClick={() => exitModal()} style={{ marginRight: '5px' }}>
                Cancel
              </Button>
              <Button
                loading={loading}
                onClick={async () => {
                  await generateReferral();
                }}
                type="primary"
              >
                Generate Invite
              </Button>
            </$Horizontal>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Viral Invite" key={ReferralType.Viral}>
          <h3>Viral Invite</h3>
          <$InfoDescription fontSize="0.8rem">
            {`Viral Invites act like regular invites, but will also reward a bonus ticket to the
            person who shared the invite link. Only fans should use viral invite links. `}
            <a href="https://lootbox.fyi/3ubgWs2" target="_blank" rel="noreferrer">
              View Tutorial
            </a>
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
              placeholder="Someone Else's Promoter ID"
            />
          </$Vertical>
          <br />
          <br />
          <br />

          {createdReferral && activeTab === ReferralType.Viral ? (
            renderCopyableReferral()
          ) : (
            <$Horizontal justifyContent="flex-end">
              <Button onClick={() => exitModal()} style={{ marginRight: '5px' }}>
                Cancel
              </Button>
              <Button
                loading={loading}
                onClick={async () => {
                  await generateReferral();
                }}
                type="primary"
              >
                Generate Invite
              </Button>
            </$Horizontal>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Participation Rewards" key={ReferralType.OneTime}>
          <h3>Participation Rewards</h3>
          <$InfoDescription fontSize="0.8rem">
            Participation rewards are tickets that can be given to anyone, even if they already got
            their 1 free ticket. Learn more by{' '}
            <a href="https://lootbox.fyi/3OM3GDn" target="_blank" rel="noreferrer">
              watching this tutorial.
            </a>
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
              placeholder="Someone Else's Promoter ID"
            />
          </$Vertical>
          <$Vertical style={{ marginTop: '10px' }}>
            <label style={{ marginBottom: '5px', color: 'gray' }}>{`Quantity of Tickets`}</label>
            <InputNumber
              value={quantityTickets}
              onChange={(e) => setQuantityTickets(e || 0)}
              min={1}
              style={{ width: '100%' }}
            />
          </$Vertical>
          <br />
          <br />
          <br />
          {csvFile && activeTab === ReferralType.OneTime ? (
            renderDownloadCsv()
          ) : (
            <$Horizontal justifyContent="flex-end">
              <Button onClick={() => exitModal()} style={{ marginRight: '5px' }}>
                Cancel
              </Button>
              <Button
                loading={loading}
                onClick={async () => {
                  await generateBulkReferral();
                }}
                type="primary"
              >
                Generate Participation Rewards
              </Button>
            </$Horizontal>
          )}
        </Tabs.TabPane>
        {errorMessage ? (
          <$ErrorMessage style={{ paddingTop: '15px' }}>{errorMessage}</$ErrorMessage>
        ) : null}
      </Tabs>
    </Modal>
  );
};

export default GenerateReferralModal;
