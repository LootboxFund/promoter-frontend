import type {
  QueryViewMyTournamentsAsOrganizerArgs,
  Tournament,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { $Horizontal, $Vertical } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { AffiliateID } from '@wormgraph/helpers';
import { Button, Card, Input } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { VIEW_TOURNAMENTS_AS_ORGANIZER } from './api.gql';
import styles from './index.less';
import { ViewMyTournamentsAsOrganizerResponse } from '../../../api/graphql/generated/types';

const affiliateID = 'rMpu8oZN3EjEe5XL3s50' as AffiliateID;

const EventsPage: React.FC = () => {
  const [searchString, setSearchString] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const { data, loading, error } = useQuery<
    { viewMyTournamentsAsOrganizer: ViewMyTournamentsAsOrganizerResponse },
    QueryViewMyTournamentsAsOrganizerArgs
  >(VIEW_TOURNAMENTS_AS_ORGANIZER, {
    variables: { affiliateID },
    onCompleted: (data) => {
      if (
        data?.viewMyTournamentsAsOrganizer.__typename ===
        'ViewMyTournamentsAsOrganizerResponseSuccess'
      ) {
        const tournaments = data.viewMyTournamentsAsOrganizer.tournaments;
        console.log(tournaments);
        setTournaments(tournaments);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewMyTournamentsAsOrganizer.__typename === 'ResponseError') {
    return <span>{data?.viewMyTournamentsAsOrganizer.error?.message || ''}</span>;
  }

  const filterBySearchString = (tournament: Tournament) => {
    return (
      tournament.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      tournament.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };

  return (
    <PageContainer>
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <$Vertical>
          <$Horizontal justifyContent="space-between">
            <Input.Search
              placeholder="Find Event"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Button>
              <Link to="/dashboard/events/create">Create Event</Link>
            </Button>
          </$Horizontal>
          <br />
          <div className={styles.content}>
            {tournaments.filter(filterBySearchString).map((tournament) => (
              <Link key={tournament.id} to={`/dashboard/events/id/${tournament.id}`}>
                <Card
                  hoverable
                  className={styles.card}
                  cover={
                    <img
                      alt="example"
                      src={tournament.coverPhoto || ''}
                      className={styles.cardImage}
                    />
                  }
                >
                  <Meta title={tournament.title} />
                </Card>
              </Link>
            ))}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default EventsPage;
