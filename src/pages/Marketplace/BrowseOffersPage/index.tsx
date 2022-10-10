import type {
  AffiliatePublicViewResponse,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { useAffiliateUser } from '@/components/AuthGuard/affiliateUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { BROWSE_ACTIVE_OFFERS } from './api.gql';
import styles from './index.less';
import {
  BrowseActiveOffersResponse,
  MarketplacePreviewOffer,
} from '../../../api/graphql/generated/types';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import {
  Button,
  Card,
  Input,
  message,
  Table,
  Image,
  Space,
  Avatar,
  Popover,
  Popconfirm,
} from 'antd';
import { Link } from '@umijs/max';
import Meta from 'antd/lib/card/Meta';
import { ColumnsType } from 'antd/lib/table';
import { AdvertiserID, OfferID } from '@wormgraph/helpers';

type DataType = {
  advertiserAvatar: string;
  advertiserID: AdvertiserID;
  advertiserName: string;
  description: string;
  id: OfferID;
  image: string;
  lowerEarn: number;
  title: string;
  upperEarn: number;
};

const BrowseOffersPage: React.FC = () => {
  const { affiliateUser } = useAffiliateUser();
  const { id: affiliateID } = affiliateUser;
  const [searchString, setSearchString] = useState('');
  const [activeOffers, setActiveOffers] = useState<MarketplacePreviewOffer[]>([]);
  const { data, loading, error } = useQuery<{ browseActiveOffers: BrowseActiveOffersResponse }>(
    BROWSE_ACTIVE_OFFERS,
    {
      onCompleted: (data) => {
        if (data?.browseActiveOffers.__typename === 'BrowseActiveOffersResponseSuccess') {
          const offers = data.browseActiveOffers.offers;
          console.log(offers);
          setActiveOffers(offers);
        }
      },
    },
  );
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.browseActiveOffers.__typename === 'ResponseError') {
    return <span>{data?.browseActiveOffers.error?.message || ''}</span>;
  }
  const filterBySearchString = (offer: MarketplacePreviewOffer) => {
    return (
      offer.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      offer.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '',
      dataIndex: 'advertiserAvatar',
      key: 'advertiserAvatar',
      render: (_, record) => <Avatar src={record.advertiserAvatar} size="default" />,
    },
    {
      title: 'Offer Revenue',
      dataIndex: 'advertiserID',
      key: 'advertiserID',
      render: (_, record) => (
        <$Vertical>
          <b style={{ fontSize: '1rem' }}>{record.title}</b>
          <span>{record.advertiserName}</span>
        </$Vertical>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      render: (_, record) => {
        return (
          <Popover content={record.description} title={record.title}>
            <span>{record.description.slice(0, 200)}</span>
          </Popover>
        );
      },
    },
    {
      title: 'Low',
      dataIndex: 'lowerEarn',
      key: 'lowerEarn',
      render: (_, record) => <span>{`$${record.lowerEarn.toFixed(2)}`}</span>,
    },
    {
      title: 'High',
      dataIndex: 'upperEarn',
      key: 'upperEarn',
      render: (_, record) => <span>{`$${record.upperEarn.toFixed(2)}`}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        return (
          <Space size="middle">
            <Popconfirm
              title="Currently this offer is only available to promoters on a whitelist basis. You must request access from the advertiser."
              onConfirm={() => {
                message.success(
                  "Request sent! We'll let you know if the advertiser has approved you.",
                );
              }}
              okText="Request Access"
              cancelText="Cancel"
            >
              <a onClick={() => console.log('clicked')}>Add Revenue</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        This is where you can find affiliate products and services to promote. Advertisers list
        their offers and pay you on a performance basis. It is similar to how YouTubers & Twitch
        streamers get paid, available for anyone without needing connections. To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
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
            placeholder="Filter Offers"
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
              dataSource={activeOffers.filter(filterBySearchString).map((offer) => {
                return {
                  advertiserAvatar: offer.advertiserAvatar,
                  advertiserID: offer.advertiserID,
                  advertiserName: offer.advertiserName,
                  description: offer.description || '',
                  id: offer.id,
                  image: offer.image || '',
                  lowerEarn: offer.lowerEarn,
                  title: offer.title,
                  upperEarn: offer.upperEarn,
                };
              })}
            />
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default BrowseOffersPage;
