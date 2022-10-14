import { BLOCKCHAINS, ChainIDHex, chainIdHexToSlug, ChainSlugs } from '@wormgraph/helpers';

export const chainIdToHex = (chainID: number): string => {
  return `0x${chainID.toString(16)}`;
};

export const getBlockExplorerUrl = (chainIDHex: ChainIDHex) => {
  const chainSlug = chainIdHexToSlug(chainIDHex);
  if (chainSlug && BLOCKCHAINS[chainSlug]) {
    return BLOCKCHAINS[chainSlug].blockExplorerUrls[0];
  }
  return ChainSlugs.POLYGON_MAINNET; // Default polygon
};
