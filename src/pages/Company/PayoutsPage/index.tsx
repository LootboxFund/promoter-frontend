import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { $InfoDescription } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { Empty } from 'antd';
import React from 'react';

const PayoutsPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        This is where you can see your historical affiliate earnings and get paid out to your
        blockchain wallet. To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };
  return (
    <PageContainer>
      {renderHelpText()}
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Coming Soon"
        style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
      />
    </PageContainer>
  );
};

export default PayoutsPage;
