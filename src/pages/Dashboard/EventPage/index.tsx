import type {
  ViewTournamentAsOrganizerResponse,
  QueryListConquestPreviewsArgs,
  QueryViewTournamentAsOrganizerArgs,
  Tournament,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { useParams } from '@umijs/max';
import { AffiliateID } from '@wormgraph/helpers';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { VIEW_TOURNAMENT_AS_ORGANIZER } from './api.gql';
import styles from './index.less';

const affiliateID = 'rMpu8oZN3EjEe5XL3s50' as AffiliateID;

const EventPage: React.FC = () => {
  const { eventID } = useParams();
  const [tournament, setTournament] = useState<Tournament>();
  const { data, loading, error } = useQuery<
    { viewTournamentAsOrganizer: ViewTournamentAsOrganizerResponse },
    QueryViewTournamentAsOrganizerArgs
  >(VIEW_TOURNAMENT_AS_ORGANIZER, {
    variables: {
      tournamentID: eventID || '',
    },
    onCompleted: (data) => {
      if (
        data?.viewTournamentAsOrganizer.__typename === 'ViewTournamentAsOrganizerResponseSuccess'
      ) {
        const tournament = data.viewTournamentAsOrganizer.tournament;
        console.log(tournament);
        setTournament(tournament);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewTournamentAsOrganizer.__typename === 'ResponseError') {
    return <span>{data?.viewTournamentAsOrganizer.error?.message || ''}</span>;
  }

  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Events', route: '/dashboard/events' },
    { title: tournament?.title || '', route: `/dashboard/events/id/${tournament?.id}` },
  ];

  return (
    <div>
      {loading || !tournament ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <h1>{tournament.title}</h1>
          <br />
          <p>{JSON.stringify(tournament, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

export default EventPage;
