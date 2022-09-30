import { Radio, RadioChangeEvent } from 'antd';
import { manifest } from '@/manifest';
import { useEffect } from 'react';
import { chainIdToHex } from '@/lib/chain';
import { ChainIDHex } from '@wormgraph/helpers';
import useWeb3 from '@/hooks/useWeb3';

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

  const buttonClick = async (e: RadioChangeEvent) => {
    switchNetwork(e.target.value);
  };

  return (
    <Radio.Group
      options={options}
      onChange={buttonClick}
      value={value}
      optionType="button"
      buttonStyle="solid"
    />
  );
};
