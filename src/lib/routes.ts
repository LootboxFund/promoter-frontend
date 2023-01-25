import { EventInviteSlug, EventInviteType } from '@wormgraph/helpers';

export const buildPlayerInviteLinkForEvent = (slug: EventInviteSlug) => {
  return `${'http://localhost:3000/join'}?code=${slug}&type=${EventInviteType.PLAYER}`;
};

export const buildPromoterInviteLinkForEvent = (slug: EventInviteSlug) => {
  return `${'http://localhost:3000/join'}?code=${slug}&type=${EventInviteType.PROMOTER}`;
};
