import { gql } from '@apollo/client';

export const VIEW_TOURNAMENTS_AS_ORGANIZER = gql`
  query ViewMyTournamentsAsOrganizer($affiliateID: ID!) {
  viewMyTournamentsAsOrganizer(affiliateID: $affiliateID) {
    ... on ViewMyTournamentsAsOrganizerResponseSuccess {
      tournaments {
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
