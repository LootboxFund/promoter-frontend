import { FunctionComponent } from 'react';
import { LOGO_URL } from '../constants';
import LogoSection from '../LogoSection';

export interface SimpleTicketProps {
  coverPhoto: string;
  teamName: string;
  playerHeadshot?: string;
  themeColor: string;
  sponsorLogos: string[];
  eventName?: string;
  hostName?: string;
}
const SimpleTicket: FunctionComponent<SimpleTicketProps> = (props) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'var(--font-open-sans)',
        minWidth: '310px',
        maxWidth: '360px',
      }}
    >
      <div
        style={{
          alignSelf: 'stretch',
          borderRadius: '50px 50px 0px 0px',
          backgroundColor: props.themeColor,
          flexShrink: '0',
          display: 'flex',
          flexDirection: 'row',
          padding: '20px 0px',
          boxSizing: 'border-box',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '3',
        }}
      >
        <h2
          style={{
            margin: '0',
            flex: '1',
            position: 'relative',
            fontWeight: '700',
            fontFamily: 'inherit',
            fontSize: '34px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            color: '#ffffff',
          }}
        >
          {props.teamName}
        </h2>
      </div>
      <div
        style={{
          alignSelf: 'stretch',
          flexShrink: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
          zIndex: '2',
          // height: '100%',
          height: '380px',
        }}
      >
        <img
          style={{
            alignSelf: 'stretch',
            flex: '1',
            position: 'relative',
            maxWidth: '100%',
            overflow: 'hidden',
            objectFit: 'cover',
            zIndex: '0',
            width: '100%',
            height: '380px',
          }}
          alt=""
          id="bg1"
          src={props.coverPhoto}
        />

        {props.playerHeadshot && (
          <img
            style={{
              position: 'absolute',
              margin: '0',
              // bottom: "324.33px",
              bottom: '0px',
              // left: "calc(50% - 450px)",
              left: '20px', // takes left padding into account from QR code
              maxWidth: '120px',
              width: '100%',
              maxHeight: '180px',
              flexShrink: '0',
              objectFit: 'contain',
              zIndex: '2',
            }}
            alt=""
            id="headshot"
            src={props.playerHeadshot}
          />
        )}

        <div
          style={{
            position: 'absolute',
            margin: '0',
            bottom: '0px',
            background: `linear-gradient(180deg, rgba(0, 0, 0, 0), ${props.themeColor}AA 50%, ${props.themeColor})`,
            width: '100%',
            height: '80px',
            flexShrink: '0',
            zIndex: '2',
          }}
        />
      </div>

      <div
        style={{
          alignSelf: 'stretch',
          backgroundColor: props.themeColor,
          height: '60px',
          flexShrink: '0',
          display: 'flex',
          flexDirection: 'row',
          padding: '16px 20px 10px',
          boxSizing: 'border-box',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: '1',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '20px',
          lineHeight: '57px',
        }}
      >
        <div
          style={{
            flex: '1',
            height: '100%',
            position: 'relative',
            textAlign: 'left',
            marginTop: '-24px',
          }}
        >
          <strong
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              display: 'inline-block',
              fontStyle: 'italic',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              opacity: 0.8,
            }}
          >
            LOOTBOX&nbsp;
            <img
              src={LOGO_URL}
              alt="Lootbox Fan Tickets"
              style={{
                marginTop: '-4px',
                height: '22px',
                width: '22px',
                fontSize: '16px',
                fontWeight: 'normal',
              }}
            />
          </strong>
          <p
            style={{
              margin: '0',
              position: 'absolute',
              top: '24px',
              left: '0px',
              display: 'inline-block',
              opacity: 0.8,
              fontSize: '12px',
            }}
          >
            Gamers win you stuff
          </p>
        </div>

        {(props.eventName || props.hostName) && (
          <span
            style={{
              opacity: 0.8,
              width: '60%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textAlign: 'right',
              fontSize: '18px',
            }}
          >
            {props.eventName || props.hostName}
          </span>
        )}
      </div>

      <LogoSection logoUrls={props.sponsorLogos} backgroundColor={props.themeColor} />
    </div>
  );
};

export default SimpleTicket;
