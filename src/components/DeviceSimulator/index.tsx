import React from 'react';
import styles from './index.less';

interface DeviceSimulatorProps {
  mode: 'iframe' | 'dom';
}
const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ mode }) => {
  return (
    <div className={styles.smartphone}>
      <div className={styles.viewPort}>
        <iframe
          src="https://go.lootbox.fund/r?r=0178JimEB6"
          style={{ width: '100%', border: 'none', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default DeviceSimulator;
