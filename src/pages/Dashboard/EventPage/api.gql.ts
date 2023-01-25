import {
  CreativeType,
  LootboxTournamentStatus,
  LootboxType,
  ResponseError,
  TournamentPrivacyScope,
  TournamentVisibility,
} from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';
import {
  ActivationID,
  Address,
  AdID,
  AdSetID,
  AdSetInTournamentStatus,
  AffiliateID,
  AspectRatio,
  EventInviteSlug,
  LootboxID,
  LootboxTournamentSnapshotID,
  OfferID,
  RateQuoteID,
  TournamentID,
  UserID,
} from '@wormgraph/helpers';

export interface AdFE {
  adID: AdID;
  creativeType: CreativeType;
  creativeLinks: string[];
  callToAction: string;
  aspectRatio: AspectRatio;
  themeColor: string;
}

export interface AdSetPreviewInDealConfigFE {
  id: AdSetID;
  name?: string | null;
  status: AdSetInTournamentStatus;
  placement?: string | null;
  thumbnail?: string | null;
  ad?: AdFE | null;
}

export interface RateQuoteConfigFE {
  rateQuoteID: RateQuoteID;
  activationID: ActivationID;
  activationName: string;
  activationOrder: number;
  description?: string;
  pricing: number;
  affiliateID: AffiliateID;
  affiliateName: string;
  affiliateAvatar?: string;
}

export interface DealConfigsFE {
  tournamentID: TournamentID;
  offerID: OfferID;
  offerName: string;
  advertiserID: AffiliateID;
  advertiserName: string;
  advertiserAvatar?: string;
  strategy: string;
  adSets: AdSetPreviewInDealConfigFE[];
  rateQuoteConfigs: RateQuoteConfigFE[];
}

export interface OrganizerProfileFE {
  id: AffiliateID;
  name?: string;
  avatar?: string;
}

export interface InviteMetadataFE {
  slug: EventInviteSlug;
  playerDestinationURL: string | null;
  promoterDestinationURL: string | null;
  maxPlayerLootbox: number;
  maxPromoterLootbox: number;
}

export interface TournamentFE {
  id: TournamentID;
  title: string;
  description?: string;
  tournamentLink?: string;
  creatorId: UserID;
  magicLink?: string;
  tournamentDate?: number;
  prize?: string;
  coverPhoto?: string;
  communityURL?: string;
  organizer?: AffiliateID;
  promoters: AffiliateID[];
  privacyScope: TournamentPrivacyScope[];
  visibility: TournamentVisibility;
  playbookUrl?: string;
  safetyFeatures?: {
    maxTicketsPerUser?: number;
    seedMaxLootboxTicketsPerUser?: number;
  };
  timestamps: {
    createdAt: number;
  };
  dealConfigs: DealConfigsFE[];
  isPostCosmic: boolean;
  organizerProfile: OrganizerProfileFE;
  inviteMetadata: InviteMetadataFE;
}

export interface TournamentAsOrganizerResponseFE {
  viewTournamentAsOrganizer:
    | {
        __typename: 'ViewTournamentAsOrganizerResponseSuccess';
        tournament: TournamentFE;
      }
    | ResponseError;
}

export const VIEW_TOURNAMENT_AS_ORGANIZER = gql`
  query ViewTournamentAsOrganizer($tournamentID: ID!) {
    viewTournamentAsOrganizer(tournamentID: $tournamentID) {
      ... on ViewTournamentAsOrganizerResponseSuccess {
        tournament {
          id
          title
          description
          tournamentLink
          creatorId
          magicLink
          tournamentDate
          prize
          coverPhoto
          communityURL
          organizer
          promoters
          privacyScope
          visibility
          playbookUrl
          inviteMetadata {
            slug
            playerDestinationURL
            promoterDestinationURL
            maxPlayerLootbox
            maxPromoterLootbox
          }
          safetyFeatures {
            maxTicketsPerUser
            seedMaxLootboxTicketsPerUser
          }
          timestamps {
            createdAt
          }
          dealConfigs {
            tournamentID
            offerID
            offerName
            advertiserID
            advertiserName
            advertiserAvatar
            strategy
            adSets {
              id
              name
              status
              placement
              thumbnail
              ad {
                adID
                creativeType
                creativeLinks
                callToAction
                aspectRatio
                themeColor
              }
            }
            rateQuoteConfigs {
              rateQuoteID
              activationID
              activationName
              activationOrder
              description
              pricing
              affiliateID
              affiliateName
              affiliateAvatar
            }
          }
          isPostCosmic
          organizerProfile {
            id
            name
            avatar
          }
        }
      }
      ... on ResponseError {
        error {
          code
          message
        }
      }
    }
  }
`;

export interface LootboxTournamentSnapshotFE {
  id: LootboxTournamentSnapshotID;
  address: Address;
  lootboxID: LootboxID;
  stampImage: string;
  status: LootboxTournamentStatus;
  name: string;
  type: LootboxType;
  impressionPriority: number;
  timestamps: {
    createdAt: number;
  };
}

export type TournamentLootboxesResponseSuccessFE = {
  __typename: 'TournamentResponseSuccess';
  tournament: {
    lootboxSnapshots: LootboxTournamentSnapshotFE[];
  };
};

export type TournamentLootboxesResponseFE = TournamentLootboxesResponseSuccessFE | ResponseError;

export const GET_TOURNAMENT_LOOTBOXES = gql`
  query Query($id: ID!) {
    tournament(id: $id) {
      ... on TournamentResponseSuccess {
        tournament {
          lootboxSnapshots {
            id
            address
            lootboxID
            stampImage
            status
            name
            impressionPriority
            type
            timestamps {
              createdAt
            }
          }
        }
      }
      ... on ResponseError {
        error {
          code
          message
        }
      }
    }
  }
`;

// export interface PaginateEventLootboxesFE {
//   __typename: 'TournamentResponseSuccess';
//   tournament: {
//     paginateLootboxSnapshots: {
//       edges: {
//         node: LootboxTournamentSnapshotFE;
//         cursor: number; // Created at timestamp
//       }[];
//       pageInfo: {
//         hasNextPage: boolean;
//         endCursor: {
//           impression: number;
//           createdAt: number;
//         } | null;
//       };
//     };
//   };
// }

// export const parsePaginatedLootboxEventSnapshots = (
//   response: PaginateEventLootboxesFE | undefined,
// ): LootboxTournamentSnapshotFE[] => {
//   return response?.tournament?.paginateLootboxSnapshots?.edges?.map((edge) => edge.node) || [];
// };

// export const PAGINATE_EVENT_LOOTBOXES = gql`
//   query PaginateLootboxSnapshots($tournamentID: ID!, $first: Int!, $after: InputCursor) {
//     tournament(id: $tournamentID) {
//       ... on TournamentResponseSuccess {
//         tournament {
//           paginateLootboxSnapshots(first: $first, after: $after) {
//             edges {
//               node {
//                 id
//                 address
//                 lootboxID
//                 stampImage
//                 status
//                 name
//                 impressionPriority
//                 timestamps {
//                   createdAt
//                 }
//               }
//               cursor {
//                 impression
//                 createdAt
//               }
//             }
//             pageInfo {
//               hasNextPage
//               endCursor {
//                 impression
//                 createdAt
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;

export const EDIT_TOURNAMENT_AS_ORGANIZER = gql`
  mutation EditTournament($payload: EditTournamentPayload!) {
    editTournament(payload: $payload) {
      ... on EditTournamentResponseSuccess {
        tournament {
          id
          title
          description
          tournamentLink
          creatorId
          magicLink
          tournamentDate
          prize
          coverPhoto
          communityURL
          organizer
          privacyScope
          playbookUrl
          organizerProfile {
            id
            name
            avatar
          }
          promoters
        }
      }
      ... on ResponseError {
        error {
          code
          message
        }
      }
    }
  }
`;

export const REMOVE_ADSET_FROM_TOURNAMENT = gql`
  mutation RemoveOfferAdSetFromTournament($payload: RemoveOfferAdSetFromTournamentPayload!) {
    removeOfferAdSetFromTournament(payload: $payload) {
      ... on RemoveOfferAdSetFromTournamentResponseSuccess {
        tournament {
          id
          title
          description
          tournamentLink
          creatorId
          magicLink
          tournamentDate
          prize
          coverPhoto
          communityURL
          organizer
          organizerProfile {
            id
            name
            avatar
          }
          promoters
          dealConfigs {
            tournamentID
            offerID
            offerName
            advertiserID
            advertiserName
            advertiserAvatar
            adSets {
              id
              name
              status
              placement
              thumbnail
            }
            rateQuoteConfigs {
              rateQuoteID
              activationID
              activationName
              activationOrder
              description
              pricing
              affiliateID
              affiliateName
              affiliateAvatar
            }
          }
          isPostCosmic
        }
      }
      ... on ResponseError {
        error {
          code
          message
        }
      }
    }
  }
`;

export const BULK_EDIT_LOOTBOX_TOURNAMENT_SNAPSHOTS = gql`
  mutation BulkEditLootboxTournamentSnapshots(
    $payload: BulkEditLootboxTournamentSnapshotsPayload!
  ) {
    bulkEditLootboxTournamentSnapshots(payload: $payload) {
      ... on BulkEditLootboxTournamentSnapshotsResponseSuccess {
        lootboxTournamentSnapshotIDs
      }
      ... on ResponseError {
        error {
          code
          message
        }
      }
    }
  }
`;
