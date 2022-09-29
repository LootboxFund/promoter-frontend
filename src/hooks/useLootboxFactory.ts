import { chainIdToHex } from '@/lib/chain';
import { manifest } from '@/manifest';
import LootboxFactoryABI from '@wormgraph/helpers/lib/abi/LootboxCosmicFactory.json';
import { Contract } from 'ethers';
import { useMemo } from 'react';
import { useWeb3 } from './useWeb3';

interface useLootboxFactoryResult {
  lootboxFactory: Contract | null;
}

export const useLootboxFactory = (): useLootboxFactoryResult => {
  const { library, network } = useWeb3();

  const factoryAddress = useMemo(() => {
    if (!network?.chainId) return undefined;

    const chain = manifest.chains.find(
      (chain) => chain.chainIdHex === chainIdToHex(network.chainId),
    );

    if (!chain) {
      return undefined;
    }

    return manifest.lootbox.contracts[chain.chainIdHex].LootboxCosmicFactory.address;
  }, [network]);

  const lootboxFactory = factoryAddress
    ? new Contract(factoryAddress, LootboxFactoryABI, library?.getSigner())
    : null;

  return { lootboxFactory };
};
