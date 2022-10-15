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
import { $Horizontal, $Vertical } from '@/components/generics';
import { Button, Card, Input } from 'antd';
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

const placeholderHeadshot =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2F2x3_Placeholder_Headshot.png?alt=media';
const placeholderGameGraphic =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2FGift_Basket.png?alt=media';

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

  return (
    <PageContainer>
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <$Horizontal>
            <$Vertical style={{ flex: 3, paddingRight: '30px' }}>
              <Card>
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
            </$Vertical>
            <$Vertical style={{ flex: 3, alignItems: 'center' }}>
              <StampWrapper
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
            </$Vertical>
          </$Horizontal>
        </div>
      )}
    </PageContainer>
  );
};

export default StampLootbox;
