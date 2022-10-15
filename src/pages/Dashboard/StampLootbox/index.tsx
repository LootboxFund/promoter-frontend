import type {
  AffiliatePublicViewResponse,
  QueryAffiliatePublicViewArgs,
  QueryGetLootboxByIdArgs,
  QueryListConquestPreviewsArgs,
  ResponseError,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import StampLootbox_Classic from '@/components/StampLootbox/StampLootbox_Classic';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GET_AFFILIATE } from './api.gql';
import styles from './index.less';
import { $Horizontal, $Vertical } from '@/components/generics';
import { Button, Card, Input } from 'antd';
import StampWrapper from '@/components/StampWrapper';
import { GetLootboxFE, GET_LOOTBOX, LootboxFE } from '../LootboxPage/api.gql';
import { useParams } from '@umijs/max';

const StampLootbox: React.FC = () => {
  const { lootboxID } = useParams();
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;

  const [teamName, setTeamName] = useState('');
  const [nftBountyValue, setNftBountyValue] = useState('');
  const [gamePlayed, setGamePlayed] = useState('Game TBD');
  const [tentativeDate, setTentativeDate] = useState('To Be Determined');
  const [tentativeTime, setTentativeTime] = useState('Hour TBD');
  const [tournamentTitle, setTournamentTitle] = useState('Gaming Competition');

  // VIEW Lootbox
  const { data, loading, error } = useQuery<
    { getLootboxByID: GetLootboxFE | ResponseError },
    QueryGetLootboxByIdArgs
  >(GET_LOOTBOX, {
    variables: { id: lootboxID || '' },
  });

  const lootbox: LootboxFE | undefined = useMemo(() => {
    return (data?.getLootboxByID as GetLootboxFE)?.lootbox;
  }, [data]);

  useEffect(() => {
    if (lootbox) {
      setTeamName(lootbox.name);
      setNftBountyValue(lootbox.nftBountyValue);
    }
  }, [lootbox]);

  return (
    <PageContainer>
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <$Horizontal>
            <$Vertical style={{ flex: 3, paddingRight: '30px' }}>
              <Card>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Team Name</label>
                  <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>
                    Advertised Ticket Value
                  </label>
                  <Input
                    value={nftBountyValue}
                    onChange={(e) => setNftBountyValue(e.target.value)}
                  />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Game Played</label>
                  <Input value={gamePlayed} onChange={(e) => setGamePlayed(e.target.value)} />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Tentative Date</label>
                  <Input value={tentativeDate} onChange={(e) => setTentativeDate(e.target.value)} />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Tentative Time</label>
                  <Input value={tentativeTime} onChange={(e) => setTentativeTime(e.target.value)} />
                </$Vertical>
                <$Vertical style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'gray', marginBottom: '5px' }}>Event Title</label>
                  <Input
                    value={tournamentTitle}
                    onChange={(e) => setTournamentTitle(e.target.value)}
                  />
                </$Vertical>
              </Card>
            </$Vertical>
            <$Vertical style={{ flex: 3, alignItems: 'center' }}>
              <StampWrapper
                stampTemplate={() => (
                  <StampLootbox_Classic
                    teamName={teamName}
                    lootboxImage={lootbox.stampImage}
                    themeColor={lootbox.themeColor}
                    nftBountyValue={nftBountyValue}
                    gameName={gamePlayed}
                    tentativeDate={tentativeDate}
                    tentativeTime={tentativeTime}
                    tournamentTitle={tournamentTitle}
                    scale={{
                      scale: 0.3,
                      height: 270,
                      width: 460,
                    }}
                  />
                )}
              />
            </$Vertical>
          </$Horizontal>
        </div>
      )}
    </PageContainer>
  );
};

export default StampLootbox;
