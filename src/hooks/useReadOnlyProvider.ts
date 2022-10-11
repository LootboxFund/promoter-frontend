import { manifest } from '@/manifest';
import { ChainIDHex } from '@wormgraph/helpers';
import { providers } from 'ethers';
import { useMemo } from 'react';

interface ReadOnlyProviderParams {
  chainIDHex: ChainIDHex;
}
export const useReadOnlyProvider = ({ chainIDHex }: ReadOnlyProviderParams) => {
  const provider = useMemo<providers.JsonRpcProvider | null>(() => {
    const chainInfo = manifest.chains.find((chain) => chain.chainIdHex === chainIDHex);

    if (!chainInfo) {
      return null;
    }

    return new providers.JsonRpcProvider(chainInfo.rpcUrls[0]);
  }, [chainIDHex]);

  return { provider };
};

export default useReadOnlyProvider;
