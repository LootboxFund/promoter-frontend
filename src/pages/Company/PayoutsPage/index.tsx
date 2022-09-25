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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </$InfoDescription>
    );
  };
  return (
    <PageContainer>
      {renderHelpText()}
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Coming Soon"
        style={{ padding: '100px' }}
      />
    </PageContainer>
  );
};

export default PayoutsPage;
