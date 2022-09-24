import { gql } from '@apollo/client';

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
