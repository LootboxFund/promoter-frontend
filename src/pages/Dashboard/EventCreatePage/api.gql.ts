import { gql } from '@apollo/client';

export const CREATE_TOURNAMENT = gql`
  mutation CreateTournament($payload: CreateTournamentPayload!) {
    createTournament(payload: $payload) {
      ... on CreateTournamentResponseSuccess {
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
