import { Ad } from '@/api/graphql/generated/types';
import { AdID, Placement } from '@wormgraph/helpers';
import { Avatar, Switch, Transfer } from 'antd';
import type { TransferDirection } from 'antd/es/transfer';
import React, { useEffect, useState } from 'react';
import { $Horizontal } from '@/components/generics';
import { Link } from '@umijs/max';
import { EyeOutlined } from '@ant-design/icons';

interface AdToAdSetPickerProps {
  listOfAds: Ad[];
  chosenPlacement: Placement;
  chosenAdSets: React.MutableRefObject<AdID[]>;
  disabled: boolean;
  initialSelectedKeys?: AdID[];
}
const AdToAdSetPicker: React.FC<AdToAdSetPickerProps> = ({
  chosenPlacement,
  listOfAds,
  chosenAdSets,
  disabled,
  initialSelectedKeys,
}) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchString, setSearchString] = useState<string>('');

  useEffect(() => {
    if (initialSelectedKeys && initialSelectedKeys.length > 0) {
      setSelectedKeys(initialSelectedKeys);
      setTargetKeys(initialSelectedKeys);
    }
  }, []);

  const handleChange = (
    newTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[],
  ) => {
    setTargetKeys(newTargetKeys);
    chosenAdSets.current = newTargetKeys as AdID[];
  };

  const handleSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const handleScroll = (
    direction: TransferDirection,
    e: React.SyntheticEvent<HTMLUListElement, Event>,
  ) => {
    // console.log('direction:', direction);
    // console.log('target:', e.target);
  };
  const adsToShow = listOfAds.map((ad) => {
    return {
      key: ad.id,
      title: ad.name,
      thumbnail: ad.creative.thumbnail,
      disabled: ad.placement !== chosenPlacement,
    };
  });

  return (
    <>
      <Transfer
        disabled={disabled}
        dataSource={adsToShow}
        titles={['Ad Creatives', 'Included in Ad Set']}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        showSearch
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        onScroll={handleScroll}
        onSearch={(_: any, value: any) => {
          setSearchString(value);
        }}
        filterOption={(input: any, option: any) => {
          return (
            option.key.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
            option.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
          );
        }}
        render={(item) => {
          return (
            <$Horizontal key={item.key} verticalCenter justifyContent="space-between">
              <$Horizontal verticalCenter>
                <Avatar shape="square" size="large" src={item.thumbnail} />
                <span style={{ paddingLeft: '10px', fontSize: '1rem' }}>{item.title}</span>
              </$Horizontal>
              <Link to={`/manage/ads/id/${item.key}`} target="_blank">
                <EyeOutlined onClick={(e) => e.stopPropagation()} style={{ color: '#a3a3a3' }} />
              </Link>
            </$Horizontal>
          );
        }}
        oneWay
        style={{ marginBottom: 16 }}
        listStyle={{ width: '350px', minWidth: '350px', height: '500px' }}
      />
    </>
  );
};

export default AdToAdSetPicker;
