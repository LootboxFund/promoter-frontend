import type {
  AddOfferAdSetToTournamentResponse,
  AdSetPreview,
  ListConquestPreviewsResponse,
  MutationAddOfferAdSetToTournamentArgs,
  QueryListConquestPreviewsArgs,
  QueryViewMyTournamentsAsOrganizerArgs,
  ResponseError,
  Tournament,
  ViewMyTournamentsAsOrganizerResponse,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { VIEW_TOURNAMENTS_AS_ORGANIZER } from '@/pages/Dashboard/EventsPage/api.gql';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { AffiliateID, OfferID, TournamentID } from '@wormgraph/helpers';
import { Button, Card, Input, message, Modal } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { $Horizontal, $Vertical } from '../generics';
import { ADD_OFFER_ADSET_TO_TOURNAMENT } from './index.gql';
import styles from './index.less';

const affiliateID = 'rMpu8oZN3EjEe5XL3s50' as AffiliateID;

interface AdSetToTournamentModalProps {
  offerID: OfferID;
  adSet: AdSetPreview | null;
  isOpen: boolean;
  closeModal: () => void;
}
const AdSetToTournamentModal: React.FC<AdSetToTournamentModalProps> = ({
  offerID,
  adSet,
  isOpen,
  closeModal,
}) => {
  const [searchString, setSearchString] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [chosenTournament, setChosenTournament] = useState<TournamentID | null>(null);
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
  const [addOfferAdSetToTournamentMutation] = useMutation<
    { createConquest: ResponseError | AddOfferAdSetToTournamentResponse },
    MutationAddOfferAdSetToTournamentArgs
  >(ADD_OFFER_ADSET_TO_TOURNAMENT, {
    refetchQueries: [],
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
  console.log(`---- tournaments`);
  console.log(tournaments);
  return (
    <Modal
      title="Include Ad to Event"
      open={isOpen}
      onCancel={() => closeModal()}
      width="100%"
      footer={<Button onClick={() => closeModal()}>Cancel</Button>}
      style={{ width: '100%', maxWidth: '1000px' }}
    >
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
                  actions={[
                    <Button
                      type="primary"
                      key={`add-${tournament.id}`}
                      onClick={async (e) => {
                        e.preventDefault();
                        if (adSet?.id) {
                          setChosenTournament(tournament.id as TournamentID);
                          await addOfferAdSetToTournamentMutation({
                            variables: {
                              payload: {
                                adSetID: adSet.id,
                                offerID: offerID,
                                organizerID: affiliateID,
                                tournamentID: tournament.id,
                              },
                            },
                          });
                          setChosenTournament(null);
                          message.success('Ad Set added to Event');
                        }
                      }}
                      style={{ width: '90%' }}
                      loading={chosenTournament === tournament.id}
                    >
                      Add To Event
                    </Button>,
                  ]}
                >
                  <Meta title={tournament.title} />
                </Card>
              </Link>
            ))}
          </div>
        </$Vertical>
      )}
    </Modal>
  );
};

export default AdSetToTournamentModal;
