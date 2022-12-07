import { UserID } from '@wormgraph/helpers';

export const truncateUID = (uid: UserID): string => {
  return uid.slice(0, 5) + '...';
};
