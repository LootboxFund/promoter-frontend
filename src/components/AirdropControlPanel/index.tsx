import {
  ListPotentialAirdropClaimersResponse,
  PotentialAirdropClaimer,
  QueryListPotentialAirdropClaimersArgs,
} from '@/api/graphql/generated/types';
import { useQuery } from '@apollo/client';
import type { OfferID, TournamentID } from '@wormgraph/helpers';
import { Button } from 'antd';
import { useState } from 'react';
import { $Horizontal, $InfoDescription, $Vertical } from '../generics';
import { LIST_POTENTIAL_AIRDROP_CLAIMERS } from './index.gql';

export type TemplateComponentProps = {
  tournamentID: TournamentID;
  offerID: OfferID;
};

const AirdropControlPanel: React.FC<TemplateComponentProps> = ({ tournamentID, offerID }) => {
  const [potentialClaimers, setPotentialClaimers] = useState<PotentialAirdropClaimer[]>([]);
  const { data, loading, error } = useQuery<
    { listPotentialAirdropClaimers: ListPotentialAirdropClaimersResponse },
    QueryListPotentialAirdropClaimersArgs
  >(LIST_POTENTIAL_AIRDROP_CLAIMERS, {
    variables: {
      payload: {
        offerID,
        tournamentID,
      },
    },
    onCompleted: (data) => {
      if (
        data?.listPotentialAirdropClaimers.__typename ===
        'ListPotentialAirdropClaimersResponseSuccess'
      ) {
        const potentialClaimers = data.listPotentialAirdropClaimers.potentialClaimers;
        console.log(potentialClaimers);
        setPotentialClaimers(potentialClaimers);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listPotentialAirdropClaimers.__typename === 'ResponseError') {
    return <span>{data?.listPotentialAirdropClaimers.error?.message || ''}</span>;
  }
  console.log(`--- potentialClaimers ---`, potentialClaimers);
  return (
    <div style={{ width: '100%', padding: '5px' }}>
      <$Horizontal justifyContent="space-between">
        <$Vertical>
          <span style={{ color: 'gray', fontWeight: 600 }}>Airdrop</span>
          <h2>Title of Airdrop</h2>
          <$InfoDescription>
            Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
          </$InfoDescription>
        </$Vertical>
        <Button>Download CSV</Button>
      </$Horizontal>
      <$Vertical>
        <$Horizontal>Info Bar</$Horizontal>
        {/* <Table
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
                /> */}
      </$Vertical>
    </div>
  );
};

export default AirdropControlPanel;
