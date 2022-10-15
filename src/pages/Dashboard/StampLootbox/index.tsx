import type {
  AffiliatePublicViewResponse,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import StampLootbox_Classic from '@/components/StampLootbox/StampLootbox_Classic';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useRef, useState } from 'react';
import { GET_AFFILIATE } from './api.gql';
import styles from './index.less';
import { $Horizontal, $Vertical } from '@/components/generics';
import { Button, Card, Input } from 'antd';

const StampLootbox: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const [teamName, setTeamName] = useState('Team Rayster');
  const { id: affiliateID } = affiliateUser;

  const { data, loading, error } = useQuery<
    { affiliatePublicView: AffiliatePublicViewResponse },
    QueryAffiliatePublicViewArgs
  >(GET_AFFILIATE, {
    variables: { affiliateID },
    onCompleted: (data) => {
      if (data?.affiliatePublicView.__typename === 'AffiliatePublicViewResponseSuccess') {
        const affiliate = data.affiliatePublicView.affiliate;
        console.log(affiliate);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.affiliatePublicView.__typename === 'ResponseError') {
    return <span>{data?.affiliatePublicView.error?.message || ''}</span>;
  }

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
              <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </$Vertical>
            <$Vertical style={{ flex: 3, alignItems: 'center' }}>
              <StampLootbox_Classic teamName={teamName} />
              <br />
              <br />
              <StampLootbox_Classic teamName={teamName} />
              <br />
              <br />
              <StampLootbox_Classic teamName={teamName} />
            </$Vertical>
          </$Horizontal>
        </div>
      )}
    </PageContainer>
  );
};

export default StampLootbox;
