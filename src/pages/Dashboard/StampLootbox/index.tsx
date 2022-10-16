import {
  AffiliatePublicViewResponse,
  MutationCreateReferralArgs,
  QueryAffiliatePublicViewArgs,
  QueryGetLootboxByIdArgs,
  QueryListConquestPreviewsArgs,
  ReferralType,
  ResponseError,
} from '@/api/graphql/generated/types';
import QRCodeComponent from 'easyqrcodejs';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import StampLootbox_Classic from '@/components/StampLootbox/StampLootbox_Classic';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GET_AFFILIATE } from './api.gql';
import styles from './index.less';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import { Affix, Button, Card, Dropdown, Input, Menu, message, Space } from 'antd';
import StampWrapper from '@/components/StampWrapper';
import { GetLootboxFE, GET_LOOTBOX, LootboxFE } from '../LootboxPage/api.gql';
import { useParams } from '@umijs/max';
import { AntUploadFile } from '@/components/AntFormBuilder';
import { AffiliateID, TournamentID } from '@wormgraph/helpers';
import { AffiliateStorageFolder } from '@/api/firebase/storage';
import {
  CreateReferralFE,
  CreateReferralResponseFE,
  CREATE_REFERRAL,
} from '@/components/GenerateReferralModal/api.gql';
import { manifest } from '@/manifest';
import { DownOutlined } from '@ant-design/icons';

const placeholderHeadshot =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2F2x3_Placeholder_Headshot.png?alt=media';
const placeholderGameGraphic =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2FGift_Basket.png?alt=media';

enum StampSocialTypes {
  Facebook = 'Facebook',
  Twitter = 'Twitter',
  DirectMessage = 'DirectMessage',
}

interface MagicLinkParams {
  tournamentID?: TournamentID;
}

export const extractURLState_StampLootboxPage = (): MagicLinkParams => {
  const url = new URL(window.location.href);

  const params: MagicLinkParams = {
    tournamentID: url.searchParams.get('tid') as TournamentID | undefined,
  };

  return params;
};

const StampLootbox: React.FC = () => {
  const { lootboxID } = useParams();
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const [loading, setLoading] = useState(true);
  const [magicLinkParams, setMagicLinkParams] = useState<MagicLinkParams>(
    extractURLState_StampLootboxPage(),
  );
  const [referralType, setReferralType] = useState<ReferralType>(ReferralType.Genesis);
  const [socialType, setSocialType] = useState<StampSocialTypes>(StampSocialTypes.Facebook);
  const [errorMessage, setErrorMessage] = useState('');
  const [socialMediaBodyText, setSocialMediaBodyText] = useState('');
  const [hashtagsText, setHashtagsText] = useState('');

  const fullSocialCopy = `${socialMediaBodyText}
${socialType === StampSocialTypes.DirectMessage ? '' : hashtagsText}`;

  const gameGraphic = useRef(placeholderGameGraphic);
  const headshotGraphic = useRef(placeholderHeadshot);
  const additionalLogo = useRef('');

  const [teamName, setTeamName] = useState('');
  const [nftBountyValue, setNftBountyValue] = useState('');
  const [gamePlayed, setGamePlayed] = useState('Game TBD');
  const [tentativeDate, setTentativeDate] = useState('To Be Determined');
  const [tentativeTime, setTentativeTime] = useState('Hour TBD');
  const [tournamentTitle, setTournamentTitle] = useState('Gaming Competition');
  const [refreshPing, triggerRefreshPing] = useState(0);

  const [campaignName, setCampaignName] = useState('');
  const [attributedTo, setAttributedTo] = useState('');
  const [createdReferral, setCreatedReferral] = useState<CreateReferralFE | null>(null);
  const inviteLink = `${manifest.microfrontends.webflow.referral}?r=${createdReferral?.slug}`;

  // VIEW Lootbox
  const {
    data,
    loading: loadingLootbox,
    error,
  } = useQuery<{ getLootboxByID: GetLootboxFE | ResponseError }, QueryGetLootboxByIdArgs>(
    GET_LOOTBOX,
    {
      variables: { id: lootboxID || '' },
    },
  );

  const lootbox: LootboxFE | undefined = useMemo(() => {
    return (data?.getLootboxByID as GetLootboxFE)?.lootbox;
  }, [data]);

  const [createReferral, { loading: loadingReferralCreation }] = useMutation<
    { createReferral: CreateReferralResponseFE | ResponseError },
    MutationCreateReferralArgs
  >(CREATE_REFERRAL);

  useEffect(() => {
    if (createdReferral) {
      console.log('Generating QR Code...');
      console.log(inviteLink);
      const options_object = {
        // ====== Basic
        text: inviteLink,
        width: 300,
        height: 300,
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
      setTimeout(() => {
        const el = document.getElementById('qrcode');
        console.log('trying to find id#qrcode');
        console.log(el);
        if (el) {
          if (el.firstChild) {
            el.removeChild(el.firstChild);
          }
          new QRCodeComponent(el, options_object);
        }
      }, 1000);
    }
  }, [createdReferral]);

  const socialOptions = [
    {
      label: 'Facebook',
      key: StampSocialTypes.Facebook,
      getTextCopy: () => `Hello Everyone! 📣

Vote to earn ${nftBountyValue} at ${tournamentTitle}! ${teamName} is competing to win the grand prize and we need your help! 🏆

It's free - just vote for us and you'll get a LOOTBOX ticket to win up to ${nftBountyValue} per ticket if we win the competition. Multiple votes are allowed if you:

1. Share this post
2. Vote at ${inviteLink}
3. After voting, share your referral link or screenshot in the comments to get bonus voting tickets!
Limited supply of tickets, first come first serve!

Vote now 👉 ${inviteLink}

---------------------

Winners announced after ${tentativeDate}.
Hosted by ${affiliateUser.name}, Powered by Lootbox Fund`,
    },
    {
      label: 'Twitter',
      key: StampSocialTypes.Twitter,
      getTextCopy:
        () => `Vote to earn ${nftBountyValue} if ${teamName} wins prize $$ at ${tournamentTitle}! 🏆

Multiple votes allowed if you:
1. Retweet
2. Vote at ${inviteLink}
3. Comment your referral for bonus @LootboxFund tickets

Hosted by ${teamName}`,
    },
    {
      label: 'Direct Message',
      key: StampSocialTypes.DirectMessage,
      getTextCopy: () => `Hi! Is this ok?

Our team ${teamName} is competing to win the grand prize at ${tournamentTitle} and we need the support of friends.
Vote for us and you'll get a free LOOTBOX ticket to win up to ${nftBountyValue} per ticket if we win the competition.

The winners will be announced after ${tentativeDate}. It's free, and multiple winning tickets are allowed 😄

If you feel like supporting us, please vote here 👉 ${inviteLink}

Thanks so much!
      `,
    },
  ];

  useEffect(() => {
    const initReferral = async () => {
      const { data } = await createReferral({
        variables: {
          payload: {
            campaignName,
            lootboxID: lootboxID,
            tournamentId: magicLinkParams.tournamentID || '',
            type: referralType,
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
    };
    initReferral();
  }, []);

  console.log(createdReferral);

  useEffect(() => {
    if (lootbox) {
      setTeamName(lootbox.name);
      setNftBountyValue(lootbox.nftBountyValue);
    }
  }, [lootbox]);

  useEffect(() => {
    if (lootbox) {
      setSocialMediaBodyText(socialOptions.find((s) => s.key === socialType)?.getTextCopy() || '');
    }
  }, [lootbox?.name, lootbox?.nftBountyValue, tournamentTitle, inviteLink, socialType]);

  const generateReferral = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // if (!lootboxID) {
      //   throw new Error('A Lootbox is required to generated a referral invite link');
      // } else
      if (!magicLinkParams.tournamentID) {
        throw new Error('Tournament is required to generate a referral invite link');
      }

      const { data } = await createReferral({
        variables: {
          payload: {
            campaignName,
            lootboxID: lootboxID,
            tournamentId: magicLinkParams.tournamentID,
            type: referralType,
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
        message.success('Referral invite link generated successfully!');
      }
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred when creating the referral invite link!');
      setLoading(false);
    }
  };
  const referralMenu = (
    <Menu
      onClick={(e) => setReferralType(e.key as ReferralType)}
      items={[
        {
          label: 'Regular Invite',
          key: ReferralType.Genesis,
        },
        {
          label: 'Viral Invite',
          key: ReferralType.Viral,
        },
      ]}
    />
  );
  const socialMenu = (
    <Menu
      onClick={(e) => setSocialType(e.key as StampSocialTypes)}
      items={socialOptions.map((s) => ({ label: s.label, key: s.key }))}
    />
  );

  return (
    <PageContainer>
      {loadingLootbox ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <$Horizontal>
            <$Vertical style={{ flex: 3, paddingRight: '30px' }}>
              <Card>
                <h3>Customize Graphics</h3>
                <$InfoDescription fontSize="0.8rem">
                  Modify the ticket invite graphics to be shared with fans. For best results, use a
                  real human profile picture for this specific player.
                </$InfoDescription>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Team Name</label>
                  <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>
                    Advertised Ticket Value
                  </label>
                  <Input
                    value={nftBountyValue}
                    onChange={(e) => setNftBountyValue(e.target.value)}
                  />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Game Played</label>
                  <Input value={gamePlayed} onChange={(e) => setGamePlayed(e.target.value)} />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Tentative Date</label>
                  <Input value={tentativeDate} onChange={(e) => setTentativeDate(e.target.value)} />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Tentative Time</label>
                  <Input value={tentativeTime} onChange={(e) => setTentativeTime(e.target.value)} />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Event Title</label>
                  <Input
                    value={tournamentTitle}
                    onChange={(e) => setTournamentTitle(e.target.value)}
                  />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>
                    Game Graphic (Portrait 4:5)
                  </label>
                  <$Horizontal justifyContent="space-between">
                    <div style={{ width: '100%', maxWidth: '200px', overflow: 'hidden' }}>
                      <AntUploadFile
                        affiliateID={affiliateID as AffiliateID}
                        folderName={AffiliateStorageFolder.LOOTBOX}
                        newMediaDestination={gameGraphic}
                        forceRefresh={() => triggerRefreshPing(refreshPing + 1)}
                        acceptedFileTypes={'image/*'}
                      />
                    </div>

                    {gameGraphic.current && (
                      <img src={gameGraphic.current} style={{ width: 'auto', height: '50px' }} />
                    )}
                  </$Horizontal>
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>
                    Player Headshot (Portrait 2:3)
                  </label>
                  <$Horizontal justifyContent="space-between">
                    <div style={{ width: '100%', maxWidth: '200px', overflow: 'hidden' }}>
                      <AntUploadFile
                        affiliateID={affiliateID as AffiliateID}
                        folderName={AffiliateStorageFolder.LOOTBOX}
                        newMediaDestination={headshotGraphic}
                        forceRefresh={() => triggerRefreshPing(refreshPing + 1)}
                        acceptedFileTypes={'image/*'}
                      />
                    </div>

                    {headshotGraphic.current && (
                      <img
                        src={headshotGraphic.current}
                        style={{ width: 'auto', height: '50px' }}
                      />
                    )}
                  </$Horizontal>
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>
                    Additional Logo (Landscape 1x4)
                  </label>
                  <$Horizontal justifyContent="space-between">
                    <div style={{ width: '100%', maxWidth: '200px', overflow: 'hidden' }}>
                      <AntUploadFile
                        affiliateID={affiliateID as AffiliateID}
                        folderName={AffiliateStorageFolder.LOOTBOX}
                        newMediaDestination={additionalLogo}
                        forceRefresh={() => triggerRefreshPing(refreshPing + 1)}
                        acceptedFileTypes={'image/*'}
                      />
                    </div>

                    {additionalLogo.current && (
                      <img
                        src={additionalLogo.current}
                        style={{ width: '100px', height: 'auto' }}
                      />
                    )}
                  </$Horizontal>
                </$Vertical>
              </Card>
              <br />
              <Card>
                <h3>Customize Referral</h3>
                <$InfoDescription fontSize="0.8rem">
                  Modify who gets credit for sharing this invite graphic and what kind of reward
                  they receive.
                </$InfoDescription>
                <$Vertical style={{ marginBottom: '15px' }}>
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
                  <label style={{ marginBottom: '5px', color: 'gray' }}>{`Referral Type`}</label>
                  <Dropdown overlay={referralMenu}>
                    <Button style={{ width: '200px' }}>
                      <Space>
                        {referralType === ReferralType.Genesis ? 'Regular Invite' : 'Viral Invite'}
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                </$Vertical>
                <$Vertical style={{ marginTop: '30px' }}>
                  <Button
                    loading={loading}
                    onClick={async () => {
                      await generateReferral();
                    }}
                    type="primary"
                    style={{ width: '200px' }}
                  >
                    Generate Invite
                  </Button>
                </$Vertical>
              </Card>
            </$Vertical>
            <$Vertical style={{ flex: 3, alignItems: 'center' }}>
              <StampWrapper
                primaryDownload
                inviteLink={inviteLink}
                fileName={`ticket-invite-${teamName}-ref-${createdReferral?.slug}`}
                stampTemplate={() => (
                  <StampLootbox_Classic
                    teamName={teamName}
                    lootboxImage={lootbox.stampImage}
                    themeColor={lootbox.themeColor}
                    nftBountyValue={nftBountyValue}
                    gameName={gamePlayed}
                    tentativeDate={tentativeDate}
                    tentativeTime={tentativeTime}
                    tournamentTitle={tournamentTitle}
                    gameGraphic={gameGraphic.current}
                    headshot={headshotGraphic.current}
                    additionalLogo={additionalLogo.current}
                    inviteLink={inviteLink}
                    scale={{
                      scale: 0.3,
                      height: 270,
                      width: 460,
                    }}
                  />
                )}
              />

              <br />
              <br />
              <Card style={{ width: '100%' }}>
                <$Horizontal justifyContent="space-between">
                  <$Vertical flex={2}>
                    <h3>Social Media Copy</h3>
                    <$InfoDescription fontSize="0.8rem">
                      Easy copy & paste social media posts for partners to share.
                    </$InfoDescription>
                  </$Vertical>
                  <$Vertical flex={1}>
                    <Button
                      type="primary"
                      onClick={() => {
                        navigator.clipboard.writeText(fullSocialCopy);
                        message.success('Copied social media post to clipboard');
                      }}
                      style={{ width: '150px', marginBottom: '10px' }}
                    >
                      Copy Text
                    </Button>
                    <Dropdown overlay={socialMenu}>
                      <Button size="small" style={{ width: '150px' }}>
                        <Space>
                          {socialOptions.find((i) => i.key === socialType)?.label}
                          <DownOutlined />
                        </Space>
                      </Button>
                    </Dropdown>
                  </$Vertical>
                </$Horizontal>

                <$Vertical>
                  <label style={{ marginBottom: '5px', color: 'gray' }}>{`Text Body`}</label>
                  <Input.TextArea
                    value={socialMediaBodyText}
                    onChange={(e) => setSocialMediaBodyText(e.target.value)}
                    rows={4}
                  />
                </$Vertical>
                {socialType !== StampSocialTypes.DirectMessage && (
                  <$Vertical style={{ marginTop: '10px' }}>
                    <label style={{ marginBottom: '5px', color: 'gray' }}>{`Hashtags`}</label>
                    <Input
                      value={hashtagsText}
                      onChange={(e) => setHashtagsText(e.target.value)}
                      placeholder={`#${affiliateUser.name.replace(' ', '')} #${gamePlayed.replace(
                        ' ',
                        '',
                      )}`}
                    />
                  </$Vertical>
                )}

                <$Vertical style={{ marginTop: '30px' }}>
                  <label
                    style={{ marginBottom: '5px', color: 'gray' }}
                  >{`Preview - ${fullSocialCopy.length} characters`}</label>
                  <div
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      padding: '10px',
                      borderRadius: '5px',
                    }}
                  >
                    <span style={{ whiteSpace: 'pre-line', color: 'gray' }}>{fullSocialCopy}</span>
                  </div>
                  <Button
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(fullSocialCopy);
                      message.success('Copied social media post to clipboard');
                    }}
                    style={{ width: '150px', marginTop: '10px' }}
                  >
                    Copy Text
                  </Button>
                </$Vertical>
              </Card>
            </$Vertical>
          </$Horizontal>
        </div>
      )}
    </PageContainer>
  );
};

export default StampLootbox;
