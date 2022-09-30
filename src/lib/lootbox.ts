import { LootboxCreatedNonce } from '@wormgraph/helpers';
import { v4 as uuidV4 } from 'uuid';

export const generateCreateLootboxNonce = (): LootboxCreatedNonce => {
  const nonce = uuidV4() as LootboxCreatedNonce;
  return nonce;
};
