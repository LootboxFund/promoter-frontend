import {
  ActivationID,
  AffiliateID,
  AffiliateType,
  OfferID,
  RateQuoteID,
  TournamentID,
} from '@wormgraph/helpers';
import { Avatar, Button, InputNumber, message, Modal, Popconfirm, Table } from 'antd';
import { $Horizontal } from '@/components/generics';
import type { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  AddUpdatePromoterRateQuoteInTournamentResponse,
  MutationAddUpdatePromoterRateQuoteInTournamentArgs,
  MutationRemovePromoterFromTournamentArgs,
  RemovePromoterFromTournamentResponse,
  ResponseError,
} from '@/api/graphql/generated/types';
import {
  ADD_UPDATE_PROMOTER_RATEQUOTE_TOURNAMENT,
  REMOVE_PROMOTER_FROM_TOURNAMENT,
} from './index.gql';
import { VIEW_TOURNAMENT_AS_ORGANIZER } from '@/pages/Dashboard/EventPage/api.gql';

export type RateCardEditorModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  eventID: TournamentID;
  rateCard: RateCardModalInput | null;
};

export interface RateCardModalInput {
  tournamentID: TournamentID;
  promoterID: AffiliateID;
  promoterName?: string;
  promoterAvatar?: string;
  offerID: OfferID;
  offerName?: string;
  rateQuotes: RateQuoteInput[];
}
export type RateQuoteInput = {
  id?: RateQuoteID;
  offerID: OfferID;
  activationID: ActivationID;
  activationName?: string;
  activationDescription?: string;
  pricing: number;
  overTotalPricing: number;
  tournamentID: TournamentID;
  affiliateID: AffiliateID;
  affiliateType: AffiliateType;
};

const RateCardEditorModal: React.FC<RateCardEditorModalProps> = ({
  isOpen,
  closeModal,
  rateCard,
  eventID,
}) => {
  const [loading, setLoading] = useState(false);
  const [updatedRateCard, setUpdatedRateCard] = useState<RateCardModalInput>();
  useEffect(() => {
    if (rateCard) {
      setUpdatedRateCard(rateCard);
    }
  }, [rateCard]);

  // UPDATE WHITELIST
  const [addUpdatePromoterRateQuote] = useMutation<
    {
      addUpdatePromoterRateQuoteInTournament:
        | ResponseError
        | AddUpdatePromoterRateQuoteInTournamentResponse;
    },
    MutationAddUpdatePromoterRateQuoteInTournamentArgs
  >(ADD_UPDATE_PROMOTER_RATEQUOTE_TOURNAMENT, {
    refetchQueries: [
      { query: VIEW_TOURNAMENT_AS_ORGANIZER, variables: { tournamentID: eventID || '' } },
    ],
  });

  // KICK OUT PROMOTER
  const [kickOutPromoter] = useMutation<
    {
      removePromoterFromTournament: ResponseError | RemovePromoterFromTournamentResponse;
    },
    MutationRemovePromoterFromTournamentArgs
  >(REMOVE_PROMOTER_FROM_TOURNAMENT, {
    refetchQueries: [
      { query: VIEW_TOURNAMENT_AS_ORGANIZER, variables: { tournamentID: eventID || '' } },
    ],
  });

  const columns: ColumnsType<RateQuoteInput> = [
    {
      title: 'Activation',
      dataIndex: 'activationName',
      key: 'activationName',
      render: (_, record) => <span>{record.activationName}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'activationDescription',
      key: 'activationDescription',
      render: (_, record) => <span>{record.activationDescription}</span>,
    },
    {
      title: 'Revenue Share',
      dataIndex: 'pricing',
      key: 'pricing',
      colSpan: 8,
      render: (_, record) => {
        return (
          <InputNumber
            value={record.pricing}
            min={0}
            max={record.overTotalPricing}
            step={0.05}
            formatter={(value) => `$ ${value}`}
            onChange={(value) => {
              // @ts-ignore
              setUpdatedRateCard({
                ...updatedRateCard,
                rateQuotes: (updatedRateCard?.rateQuotes || []).map((rateQuote) => {
                  if (rateQuote.id === record.id) {
                    return {
                      ...rateQuote,
                      pricing: value as number,
                    };
                  }
                  return rateQuote;
                }),
              });
            }}
            addonAfter={
              <span>{` ${((record.pricing / record.overTotalPricing) * 100).toFixed(0)}% of $${
                record.overTotalPricing
              }`}</span>
            }
            style={{ width: '250px' }}
          />
        );
      },
    },
  ];
  const confirmAndExecute = async () => {
    setLoading(true);
    if (rateCard && rateCard.tournamentID && updatedRateCard && updatedRateCard.rateQuotes) {
      const payload = {
        tournamentID: eventID,
        promoterID: rateCard.promoterID,
        offerID: rateCard.offerID,
        rateQuotes: updatedRateCard.rateQuotes.map((rq) => {
          const x: any = {
            offerID: rateCard.offerID,
            activationID: rq.activationID,
            pricing: rq.pricing,
            tournamentID: eventID,
            affiliateID: rateCard.promoterID,
            affiliateType: AffiliateType.Promoter,
          };
          if (rq.id) {
            x.id = rq.id;
          }
          return x;
        }),
      };

      await addUpdatePromoterRateQuote({
        variables: {
          payload,
        },
      });
    }
    setLoading(false);
    message.success(`${rateCard?.promoterName || 'Promoter'} Rate Card Updated`);
    closeModal();
  };
  return (
    <Modal
      title={
        <$Horizontal justifyContent="space-between">
          <$Horizontal verticalCenter>
            <Avatar src={rateCard?.promoterAvatar} size="default" style={{ marginRight: '10px' }} />
            <h4>{`${rateCard?.promoterName || 'Promoter'} Rate Card`}</h4>
          </$Horizontal>

          <span style={{ color: 'gray', fontSize: '0.7rem', marginRight: '30px' }}>{`${
            rateCard?.offerName || 'Offer'
          }`}</span>
        </$Horizontal>
      }
      open={isOpen}
      confirmLoading={loading}
      onOk={confirmAndExecute}
      footer={
        <$Horizontal justifyContent="space-between">
          <Popconfirm
            title="Are you want to kick out this promoter from your event?"
            onConfirm={async () => {
              if (rateCard && rateCard.promoterID && eventID) {
                setLoading(true);
                await kickOutPromoter({
                  variables: {
                    payload: {
                      tournamentID: eventID,
                      promoterID: rateCard?.promoterID,
                    },
                  },
                });
                setLoading(false);
                message.success(
                  `${rateCard?.promoterName || 'Promoter'} was kicked out of your Event`,
                );
                closeModal();
              }
            }}
            okText="Confirm"
          >
            <Button>Kick Out</Button>
          </Popconfirm>
          <$Horizontal>
            <Button key="cancel" onClick={closeModal}>
              Cancel
            </Button>
            <Button key="confirm" type="primary" loading={loading} onClick={confirmAndExecute}>
              Confirm
            </Button>
          </$Horizontal>
        </$Horizontal>
      }
      onCancel={closeModal}
      style={{
        width: '100%',
        maxWidth: '1000px',
        minWidth: '800px',
      }}
    >
      <div
        style={{
          maxHeight: '50vh',
          overflowY: 'scroll',
        }}
      >
        <Table
          columns={columns}
          dataSource={updatedRateCard?.rateQuotes || []}
          pagination={false}
        />
      </div>
    </Modal>
  );
};

export default RateCardEditorModal;
