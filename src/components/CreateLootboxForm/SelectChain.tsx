import { Button, Dropdown, Menu, Radio, RadioChangeEvent, Space } from 'antd';
import { manifest } from '@/manifest';
import { useEffect } from 'react';
import { chainIdToHex } from '@/lib/chain';
import { ChainIDHex } from '@wormgraph/helpers';
import useWeb3 from '@/hooks/useWeb3';
import { DownOutlined } from '@ant-design/icons';

export const SelectChain = ({
  value,
  onChange,
}: {
  value: ChainIDHex;
  onChange: (e: RadioChangeEvent) => void;
}) => {
  const { network, switchNetwork } = useWeb3();

  useEffect(() => {
    if (!network?.chainId) {
      return;
    }
    const chainIdHex = chainIdToHex(network.chainId);
    if (chainIdHex) {
      onChange({ target: { value: chainIdHex } } as RadioChangeEvent);
    }
  }, [network?.chainId]);

  const options = manifest.chains.map((chain) => {
    return {
      label: chain.chainName,
      value: chainIdToHex(parseInt(chain.chainIdDecimal)),
    };
  });
  const chainTextToShow =
    manifest.chains.find(
      (chain) => chain.chainIdDecimal.toString() === (network?.chainId || '').toString(),
    )?.chainName || 'Select Network';

  const menu = (
    <Menu
      onClick={(e) => switchNetwork(e.key)}
      items={options.map((o) => ({
        label: o.label,
        key: o.value,
      }))}
    />
  );

  return (
    <Dropdown overlay={menu}>
      <Button>
        <Space>
          {chainTextToShow}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};
