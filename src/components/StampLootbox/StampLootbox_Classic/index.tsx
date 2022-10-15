import {
  forwardRef,
  FunctionComponent,
  MutableRefObject,
  useCallback,
  useRef,
  useState,
} from 'react';
import styles from './index.module.css';
import React from 'react';

interface StampLootbox_Classic_Props {
  scale: {
    height?: number;
    width?: number;
    scale?: number;
  };
  teamName: string;
  themeColor: string;
  lootboxImage: string;
  nftBountyValue: string;
  gameName?: string;
  tentativeDate?: string;
  tournamentTitle?: string;
  tentativeTime?: string;
  gameGraphic?: string;
  headshot?: string;
  additionalLogo?: string;
  inviteLink: string;
}

const StampLootbox_Classic: React.FC<StampLootbox_Classic_Props> = ({
  scale,
  lootboxImage,
  teamName,
  themeColor,
  nftBountyValue,
  gameName,
  tentativeDate,
  tournamentTitle,
  tentativeTime,
  gameGraphic,
  headshot,
  additionalLogo,
  inviteLink,
}) => {
  return (
    <article
      className={styles.bCSRRGMSRaysterG}
      id={`invite-graphic-${teamName}`}
      style={{
        transform: scale.scale ? `scale(${scale.scale})` : `scale(0.3)`,
        height: scale.height ? `${scale.height}px` : '270px',
        width: scale.width ? `${scale.width}px` : '460px',
        transformOrigin: 'top left',
      }}
    >
      <div className={styles.groupDiv}>
        <img
          className={styles.rectangleIcon}
          alt=""
          src="https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2FStampLootbox_Classic%2Frectangle-97%402x.png?alt=media&token=84b8959e-86d1-46d8-aa43-67ccc20089cf"
        />
        <div className={styles.rectangleDiv} />
        {additionalLogo && <img className={styles.sponsorIcon} alt="" src={additionalLogo} />}

        <div className={styles.maskGroupDiv}>
          <div className={styles.groupDiv1}>
            <div className={styles.groupDiv2}>
              <img
                className={styles.rectangleIcon1}
                alt=""
                src="https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2FStampLootbox_Classic%2Frectangle-1%402x.png?alt=media&token=4ddb59ae-220d-4eed-922e-0526b4b806bf"
              />
              <img
                className={styles.group28621}
                alt=""
                src="https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2FStampLootbox_Classic%2Fgroup-286-2-1%402x.png?alt=media&token=87e99d27-80a1-4e0c-8e92-4716f4f9219f"
              />
              <div className={styles.rectangleDiv1} />
              <div className={styles.lOOTBOXDiv}>LOOTBOX</div>
              <div className={styles.cABANATUANTOURNAMENTDiv}>{tournamentTitle}</div>
              <div className={styles.fANPRIZE500PHP}>
                <span className={styles.fANPRIZE500Container}>
                  <p className={styles.fANPRIZE}>
                    <span className={styles.pHPSpan}>
                      <span>{`FAN PRIZE `}</span>
                    </span>
                  </p>
                  <p className={styles.pHP}>
                    <span className={styles.pHPSpan}>
                      <span>{nftBountyValue}</span>
                    </span>
                  </p>
                </span>
              </div>
              <div className={styles.fanLOOTBOXTicket}>LOOTBOX Fan Ticket</div>
              <div className={styles.gameAxieInfinityDateOcto}>
                <span className={styles.fANPRIZE500Container}>
                  <p className={styles.fANPRIZE}>Game: {gameName}</p>
                  <p className={styles.fANPRIZE}>{`Date: ${tentativeDate} `}</p>
                  <p className={styles.at12NN}>{tentativeTime}</p>
                </span>
              </div>
              <div className={styles.audienceMembersCanWinAPor}>
                <b>Audience</b>
                <span className={styles.membersCanWin}>{` members can win a portion of the `}</span>
                <b>prize money</b>
                <span className={styles.membersCanWin}> if this team wins the tournament.</span>
              </div>
            </div>
            <div className={styles.event3PGMLBBTournamentDat}>
              <span className={styles.fANPRIZE500Container}>
                <p className={styles.fANPRIZE}>
                  <b className={styles.eventB}>Event:</b>
                  <span> 3PG MLBB Tournament</span>
                </p>
                <p className={styles.at12NN}>
                  <b className={styles.eventB}>{`Date: ${tentativeDate}`}</b>
                  <span>{tentativeTime}</span>
                </p>
              </span>
            </div>
          </div>
        </div>
        <div className={styles.maskGroupDiv1}>
          <div className={styles.groupDiv1}>
            <div className={styles.groupDiv2}>
              <img
                className={styles.rectangleIcon1}
                alt=""
                src="https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2FStampLootbox_Classic%2Frectangle-1%402x.png?alt=media&token=4ddb59ae-220d-4eed-922e-0526b4b806bf"
              />
              <img
                className={styles.group28621}
                alt=""
                src="https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2FStampLootbox_Classic%2Fgroup-286-2-1%402x.png?alt=media&token=87e99d27-80a1-4e0c-8e92-4716f4f9219f"
              />
              <div className={styles.rectangleDiv1} />
              <span className={styles.gameDateSpan} id="game-date">
                <span className={styles.fANPRIZE500Container}>
                  <p className={styles.fANPRIZE}>&nbsp;</p>
                  <p className={styles.fANPRIZE}>{`Date: ${tentativeDate} `}</p>
                  <p className={styles.at12NN}>{tentativeTime}</p>
                </span>
              </span>
              <div className={styles.lOOTBOXDiv1}>LOOTBOX</div>
              <span className={styles.subtitleSpan} id="sub-title">
                {tournamentTitle}
              </span>
              <div className={styles.fANPRIZEDiv}>
                <span className={styles.pHPSpan}>
                  <span>{`FAN PRIZE `}</span>
                  <span className={styles.span}>{` `}</span>
                </span>
              </div>
              <div className={styles.fanLOOTBOXTicket1}>LOOTBOX Fan Ticket</div>
              <span className={styles.gameNameSpan} id="game-name">
                Game: {gameName}
              </span>
              <div className={styles.audienceMembersCanWinAPor}>
                <b>Audience</b>
                <span className={styles.membersCanWin}>{` members can win a portion of the `}</span>
                <b>prize money</b>
                <span className={styles.membersCanWin}> if this team wins the tournament.</span>
              </div>
            </div>
            <div className={styles.event3PGMLBBTournamentDat1}>
              <span className={styles.fANPRIZE500Container}>
                <p className={styles.fANPRIZE}>
                  <b className={styles.eventB}>Event:</b>
                  <span> 3PG MLBB Tournament</span>
                </p>
                <p className={styles.at12NN}>
                  <b className={styles.eventB}>{`Date: ${tentativeDate}`}</b>
                  <span>{tentativeTime}</span>
                </p>
              </span>
            </div>
          </div>
        </div>
        <div className={styles.maskGroupDiv2}>
          {gameGraphic && <img className={styles.gameGraphic} alt="" src={gameGraphic} />}

          <div className={styles.groupDiv5}>
            <div className={styles.groupDiv6}>
              <div id="qrcode" style={{ width: '100%', height: '100%', zIndex: 99 }} />
              <div className={styles.rectangleDiv3} />
            </div>
            <a className={styles.groupA} href="invite-link">
              <div className={styles.linkDiv}>
                <div className={styles.rectangleDiv4} />
                <b className={styles.golootboxfundrrmm23QP4lYO}>
                  🔒 {inviteLink.replace('https://', '')}
                </b>
              </div>
            </a>
          </div>
          <div className={styles.groupDiv7}>
            <div className={styles.rectangleDiv5} />
            <b className={styles.scanOrScreenshotToOpenQR}>Scan or Screenshot to Open QR Code</b>
          </div>
        </div>
        <div className={styles.groupDiv8}>
          <div className={styles.sharesTheTournamentCashPri}>
            Shares the tournament cash prize with the holder of this LOOTBOX fan ticket
          </div>
          <h2 className={styles.teamNamE} id="team-name">
            {teamName}
          </h2>
        </div>
        <img
          className={styles.vectorIcon}
          alt=""
          src="https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2FStampLootbox_Classic%2Fvector-1.svg?alt=media&token=8b28a1f3-8499-4294-b2e4-d456ee9b50d4"
        />
      </div>
      <img
        className={styles.lootboxImageIcon}
        alt=""
        src={lootboxImage}
        style={{
          filter: `drop-shadow(0px 4px 75px ${themeColor})`,
        }}
      />
      <div className={styles.theLogoSoloPerfected1} />
      <img className={styles.headshotIcon} alt="" src={headshot} />
      <h1 className={styles.prizeAmountH1} id="prize-amount">
        <span className={styles.pHPSpan}>{nftBountyValue}</span>
      </h1>
    </article>
  );
};

export default StampLootbox_Classic;
