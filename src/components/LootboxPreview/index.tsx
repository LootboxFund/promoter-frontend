import { manifest } from '@/manifest';
import { LootboxID } from '@wormgraph/helpers';
import { FunctionComponent } from 'react';
import styles from './index.less';

interface LootboxPreviewProps {
  logoImage: string;
  backgroundImage: string;
  themeColor: string;
  name: string;
  lootboxID?: LootboxID;
}

const LootboxPreview: FunctionComponent<LootboxPreviewProps> = ({
  name,
  logoImage,
  backgroundImage,
  themeColor,
  lootboxID,
}) => {
  return (
    <article className={styles.design4Article} id="lootbox-card">
      <img className={styles.rectangleIcon} alt="" src={backgroundImage} />
      <img
        className={styles.maskGroupIcon}
        alt=""
        src={logoImage}
        style={{
          filter: `drop-shadow(0px 4px 50px ${themeColor})`,
        }}
      />
      <div className={styles.groupDiv} id="lootbox-name">
        <div className={styles.rectangleDiv} id="lootbox-name-container">
          <h1 className={styles.oceansGriffinH1} id="lootbox-name">
            {name}
          </h1>
        </div>
      </div>
      <div className={styles.groupDiv1} id="details-footer-container">
        <div className={styles.rectangleDiv1} />
        <a
          className={styles.detailsAtHttpslootboxfun}
          href={`${manifest.microfrontends.webflow.cosmicLootboxPage}?lid=${lootboxID}`}
          target="_blank"
          rel="noreferrer"
        >
          {`${manifest.microfrontends.webflow.cosmicLootboxPage}?lid=${lootboxID}`}
        </a>
      </div>
      <div className={styles.groupDiv2} id="fan-rewards-banner">
        <div className={styles.rectangleDiv2} />
        <div className={styles.fanRewardsPoweredByLOOT}>
          <span>Fan Rewards Powered by</span>
          <b>{` 🎁 `}</b>
          <span className={styles.lOOTBOXSpan}>LOOTBOX</span>
        </div>
      </div>
    </article>
  );
};

export default LootboxPreview;
