import { ReportTotalEarningsForAffiliateResponse } from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { $InfoDescription } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Empty } from 'antd';
import React, { useState } from 'react';
import { REPORT_TOTAL_EARNINGS } from './api.gql';

const PayoutsPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const [earningsSum, setEarningsSum] = useState(0);

  // REPORT EARNINGS
  const {
    data: earningsData,
    loading: earningsLoading,
    error: earningsError,
  } = useQuery<{ reportTotalEarningsForAffiliate: ReportTotalEarningsForAffiliateResponse }>(
    REPORT_TOTAL_EARNINGS,
    {
      onCompleted: (data) => {
        if (
          data?.reportTotalEarningsForAffiliate.__typename ===
          'ReportTotalEarningsForAffiliateResponseSuccess'
        ) {
          const sum = data.reportTotalEarningsForAffiliate.sum;
          setEarningsSum(sum);
        }
      },
    },
  );

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        This is where you can see your historical affiliate earnings and get paid out to your
        blockchain wallet. To learn more,{' '}
        <span>
          <a href="https://lootbox.fyi/3h7Rv78" target="_blank" rel="noreferrer">
            click here for a tutorial.
          </a>
        </span>
      </$InfoDescription>
    );
  };
  return (
    <PageContainer>
      {renderHelpText()}
      {!earningsLoading && (
        <b style={{ color: 'gray' }}>{`Total $${earningsSum.toFixed(2)} USD Earned`}</b>
      )}
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Coming Soon"
        style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
      />
    </PageContainer>
  );
};

export default PayoutsPage;
