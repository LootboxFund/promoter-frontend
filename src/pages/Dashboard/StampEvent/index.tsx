import type {
  AffiliatePublicViewResponse,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React from 'react';
import { GET_AFFILIATE } from './api.gql';
import styles from './index.less';

const StampEvent: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
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
          <span>StampEvent</span>
        </div>
      )}
    </PageContainer>
  );
};

export default StampEvent;
