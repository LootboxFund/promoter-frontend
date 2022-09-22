import { gql } from '@apollo/client';

export const VIEW_TOURNAMENT_AS_ORGANIZER = gql`
  query ViewTournamentAsOrganizer($payload: ViewTournamentAsOrganizerInput!) {
    viewTournamentAsOrganizer(payload: $payload) {
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
          offers {
            id
            status
            rateQuotes
            activeAdSets
            inactiveAdSets
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
