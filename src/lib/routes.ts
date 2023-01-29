import { EventInviteSlug, EventInviteType } from '@wormgraph/helpers';
import { manifest } from '../manifest';

export const buildPlayerInviteLinkForEvent = (slug: EventInviteSlug) => {
  return `${manifest.microfrontends.dashboard.playerOnboard}?code=${slug}&type=${EventInviteType.PLAYER}`;
};

export const buildPromoterInviteLinkForEvent = (slug: EventInviteSlug) => {
  return `${manifest.microfrontends.dashboard.playerOnboard}?code=${slug}&type=${EventInviteType.PROMOTER}`;
};
