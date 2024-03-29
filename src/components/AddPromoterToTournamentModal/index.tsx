import { useLazyQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { AffiliateID, formatBigNumber } from '@wormgraph/helpers';
import { Button, Card, Input, Modal, Spin } from 'antd';
import Meta from 'antd/lib/card/Meta';
import { useState } from 'react';
import { $Horizontal, $InfoDescription } from '../generics';
import { GET_AFFILIATE } from './index.gql';

export type AddPromoterToTournamentModalProps = {
  isModalOpen: boolean;
  closeModal: () => void;
  setChosenPromoter: (promoter: ChosenPromoter) => void;
};

export type ChosenPromoter = {
  affiliateID: AffiliateID;
  affiliateName: string;
  affiliateAvatar?: string;
};

const AddPromoterToTournamentModal: React.FC<AddPromoterToTournamentModalProps> = ({
  isModalOpen,
  closeModal,
  setChosenPromoter,
}) => {
  const [addPartnerPending, setAddPartnerPending] = useState(false);

  // LAZY GET PARTNER
  const [getPartner, { loading: loadingPartner, error: errorPartner, data: dataPartner }] =
    useLazyQuery(GET_AFFILIATE);
  const searchedPartner = dataPartner?.affiliatePublicView?.affiliate;

  return (
    <Modal
      title="Add Promoter to Event"
      open={isModalOpen}
      onCancel={closeModal}
      footer={[
        <Button key="cancel" onClick={() => closeModal()}>
          Cancel
        </Button>,
      ]}
    >
      <$InfoDescription>
        Invite a player or influencer to help your distribute tickets and earn affiliate revenue. To
        find the ID of a partner, <Link to="/marketplace/recruit">visit the marketplace.</Link> Or{' '}
        <a href="https://lootbox.fyi/3Vk57vC" target="_blank" rel="noreferrer">
          Watch Tutorial.
        </a>
      </$InfoDescription>
      <Input.Search
        placeholder="Search Partner by ID"
        onSearch={(value: string) => {
          getPartner({ variables: { affiliateID: value } });
        }}
        style={{ width: '100%' }}
        enterButton="Search"
      />
      <br />
      <$Horizontal verticalCenter style={{ margin: '20px 0px' }}>
        {loadingPartner && <Spin style={{ margin: 'auto' }} />}
        {!errorPartner && searchedPartner && (
          <div>
            <Card
              key={searchedPartner.id}
              hoverable
              style={{ flex: 1, maxWidth: '250px' }}
              cover={
                <img
                  alt="example"
                  src={searchedPartner.avatar || ''}
                  style={{ width: '250px', height: '150px', objectFit: 'cover' }}
                />
              }
              actions={[
                <Button
                  type="primary"
                  onClick={async () => {
                    setAddPartnerPending(true);
                    await setChosenPromoter({
                      affiliateID: searchedPartner.id,
                      affiliateName: searchedPartner.name,
                      affiliateAvatar: searchedPartner.avatar,
                    });
                    setAddPartnerPending(false);
                  }}
                  key={`view-${searchedPartner.id}`}
                  style={{ width: '80%' }}
                >
                  {addPartnerPending ? <Spin /> : 'Add'}
                </Button>,
              ]}
            >
              <Meta
                title={searchedPartner.name}
                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                description={`${formatBigNumber(searchedPartner.audienceSize, 1)} Audience`}
              />
            </Card>
          </div>
        )}
      </$Horizontal>
    </Modal>
  );
};

export default AddPromoterToTournamentModal;
