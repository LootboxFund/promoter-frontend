import { LootboxTournamentStatus } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';
import { Address, LootboxID, LootboxTournamentSnapshotID } from '@wormgraph/helpers';

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
  impressionPriority: number;
  timestamps: {
    createdAt: number;
  };
}

export interface PaginateEventLootboxesFE {
  __typename: 'TournamentResponseSuccess';
  tournament: {
    paginateLootboxSnapshots: {
      edges: {
        node: LootboxTournamentSnapshotFE;
        cursor: number; // Created at timestamp
      }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: {
          impression: number;
          createdAt: number;
        } | null;
      };
    };
  };
}

export const parsePaginatedLootboxEventSnapshots = (
  response: PaginateEventLootboxesFE | undefined,
): LootboxTournamentSnapshotFE[] => {
  return response?.tournament?.paginateLootboxSnapshots?.edges?.map((edge) => edge.node) || [];
};

export const PAGINATE_EVENT_LOOTBOXES = gql`
  query PaginateLootboxSnapshots($tournamentID: ID!, $first: Int!, $after: InputCursor) {
    tournament(id: $tournamentID) {
      ... on TournamentResponseSuccess {
        tournament {
          paginateLootboxSnapshots(first: $first, after: $after) {
            edges {
              node {
                id
                address
                lootboxID
                stampImage
                status
                name
                impressionPriority
                timestamps {
                  createdAt
                }
              }
              cursor {
                impression
                createdAt
              }
            }
            pageInfo {
              hasNextPage
              endCursor {
                impression
                createdAt
              }
            }
          }
        }
      }
    }
  }
`;

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
