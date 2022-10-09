import type {
  AffiliatePublicViewResponse,
  CreateTournamentPayload,
  CreateTournamentResponseSuccess,
  MutationCreateTournamentArgs,
  QueryAffiliatePublicViewArgs,
  ResponseError,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import CreateEventForm from '@/components/CreateEventForm';
import { $InfoDescription } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import { AffiliateID } from '@wormgraph/helpers';
import { history, Link } from '@umijs/max';

import Spin from 'antd/lib/spin';
import React from 'react';
import { VIEW_TOURNAMENTS_AS_ORGANIZER } from '../EventsPage/api.gql';
import { CREATE_TOURNAMENT } from './api.gql';
import styles from './index.less';

const EventCreatePage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const [createTournamentMutation] = useMutation<
    { createTournament: ResponseError | CreateTournamentResponseSuccess },
    MutationCreateTournamentArgs
  >(CREATE_TOURNAMENT, {
    refetchQueries: [{ query: VIEW_TOURNAMENTS_AS_ORGANIZER, variables: { affiliateID } }],
  });

  const createTournament = async (payload: CreateTournamentPayload) => {
    const res = await createTournamentMutation({
      variables: {
        payload: {
          title: payload.title || 'Untitled Tournament',
          description: payload.description,
          tournamentLink: payload.tournamentLink || '',
          coverPhoto: payload.coverPhoto || '',
          prize: payload.prize || '',
          tournamentDate: payload.tournamentDate,
          communityURL: payload.communityURL || '',
          organizer: affiliateID,
        },
      },
    });
    if (!res?.data || res?.data?.createTournament?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.createTournament?.error?.message || words.anErrorOccured);
    }
    if (res?.data?.createTournament?.__typename === 'CreateTournamentResponseSuccess') {
      history.push(`/dashboard/events/id/${res?.data?.createTournament?.tournament?.id}`);
    }
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        LOOTBOX only handles fan ticketing & affiliate revenue. For event management, you can use
        EventBrite, CommunityGaming or Twitch. LOOTBOX is compatible with all of them. To learn
        more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };
  return (
    <PageContainer>
      {renderHelpText()}
      <div style={{ maxWidth: '800px' }}>
        <CreateEventForm
          onSubmitCreate={createTournament}
          mode="create"
          affiliateID={affiliateID as AffiliateID}
        />
      </div>
    </PageContainer>
  );
};

export default EventCreatePage;
