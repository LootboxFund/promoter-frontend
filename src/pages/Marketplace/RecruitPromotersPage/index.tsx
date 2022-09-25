import type {
  BrowseAllAffiliatesResponse,
  MarketplacePreviewAffiliate,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { history } from '@umijs/max';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { $InfoDescription, $Vertical } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { Avatar, Button, Card, Input, message, Popconfirm, Popover, Space, Table } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { BROWSE_ALL_AFFILIATES } from './api.gql';
import styles from './index.less';
import { AffiliateID, formatBigNumber, rankInfoTable } from '@wormgraph/helpers';
import { ColumnsType } from 'antd/lib/table';
import { OrganizerRank } from '../../../api/graphql/generated/types';

type DataType = {
  avatar: string;
  description: string;
  id: AffiliateID;
  name: string;
  publicContactEmail: string;
  rank: OrganizerRank;
  website: string;
  audienceSize: number;
};

const RecruitPromotersPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const [searchString, setSearchString] = useState('');
  const [affiliates, setAffiliates] = useState<MarketplacePreviewAffiliate[]>([]);
  const { data, loading, error } = useQuery<{ browseAllAffiliates: BrowseAllAffiliatesResponse }>(
    BROWSE_ALL_AFFILIATES,
    {
      onCompleted: (data) => {
        if (data?.browseAllAffiliates.__typename === 'BrowseAllAffiliatesResponseSuccess') {
          const affiliates = data.browseAllAffiliates.affiliates;
          setAffiliates(affiliates);
        }
      },
    },
  );
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.browseAllAffiliates.__typename === 'ResponseError') {
    return <span>{data?.browseAllAffiliates.error?.message || ''}</span>;
  }

  const filterBySearchString = (affiliate: MarketplacePreviewAffiliate) => {
    return (
      affiliate.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      affiliate.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (_, record) => <Avatar src={record.avatar} size="default" />,
    },
    {
      title: 'Promoter',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <$Vertical>
          <span>{record.name}</span>
        </$Vertical>
      ),
    },
    {
      title: 'Audience',
      dataIndex: 'audienceSize',
      key: 'audienceSize',
      render: (_, record) => (
        <$Vertical>
          <span>{formatBigNumber(record.audienceSize, 1)}</span>
        </$Vertical>
      ),
    },
    {
      title: 'Biography',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      render: (_, record) => {
        return (
          <Popover content={record.description} title={record.name}>
            <span>{record.description.slice(0, 200)}</span>
          </Popover>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        console.log(record);
        return (
          <Space size="middle">
            <Popconfirm
              title={`To invite ${record.name} to your Event, copy their Promoter ID "${record.id}" and add them from your Event Page. Make sure you message them on social media to coordinate.`}
              onConfirm={() => {
                navigator.clipboard.writeText(record.id);
                message.success('Copied Promoter ID to clipboard');
              }}
              onCancel={() => {
                if (record.website) {
                  window.open(record.website, '_blank');
                }
              }}
              okText="Copy Promoter ID"
              cancelText={record.website ? 'Go To Socials' : 'Cancel'}
              style={{ maxWidth: '500px' }}
            >
              <a>Recruit Promoter</a>
            </Popconfirm>
            {record.website && (
              <a href={record.website} target="_blank" rel="noreferrer">
                View Socials
              </a>
            )}
          </Space>
        );
      },
    },
  ];

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
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <$Vertical>
          {renderHelpText()}
          <Input.Search
            placeholder="Filter Promoters"
            allowClear
            onChange={(e) => setSearchString(e.target.value)}
            onSearch={setSearchString}
            style={{ width: 200 }}
          />
          <br />
          <div className={styles.content}>
            <Table
              // @ts-ignore
              columns={columns}
              dataSource={affiliates.filter(filterBySearchString).map((affiliate) => {
                return {
                  avatar: affiliate.avatar || '',
                  description: affiliate.description || '',
                  id: affiliate.id,
                  name: affiliate.name,
                  publicContactEmail: affiliate.publicContactEmail || '',
                  rank: affiliate.rank || rankInfoTable.ClayRank1,
                  website: affiliate.website || '',
                  audienceSize: affiliate.audienceSize || 0,
                };
              })}
            />
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default RecruitPromotersPage;
