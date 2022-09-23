import { gql } from '@apollo/client';

export const ADD_OFFER_ADSET_TO_TOURNAMENT = gql`
  mutation AddOfferAdSetToTournament($payload: AddOfferAdSetToTournamentPayload!) {
    addOfferAdSetToTournament(payload: $payload) {
      ... on AddOfferAdSetToTournamentResponseSuccess {
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
