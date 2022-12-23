import { QueryOfferActivationsForEventArgs } from '@/api/graphql/generated/types';
import { Funnel, FunnelConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { OfferID, TournamentID } from '@wormgraph/helpers';
import { Button, Col, Divider, Result, Row, Statistic, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';
import { OfferActivationsForEventFE, OFFER_ACTIVATIONS_FOR_EVENT } from '../api.gql';
import { $InfoDescription } from '../../generics';

interface ActivationFunnelProps {
  eventID: TournamentID;
  offerID: OfferID;
  onInviteFanModalToggle: () => void;
}

const YDataLabel = 'activationName';
const XDataLabel = 'adEventCount';

const ActivationFunnel: React.FC<ActivationFunnelProps> = (props) => {
  const { data, loading, error } = useQuery<
    OfferActivationsForEventFE,
    QueryOfferActivationsForEventArgs
  >(OFFER_ACTIVATIONS_FOR_EVENT, {
    variables: {
      payload: {
        eventID: props.eventID,
        offerID: props.offerID,
      },
    },
  });

  const { data: parsedData } = useMemo(() => {
    if (
      !data?.offerActivationsForEvent ||
      data?.offerActivationsForEvent?.__typename === 'ResponseError'
    ) {
      return {
        data: [],
      };
    }

    return {
      data:
        'data' in data.offerActivationsForEvent
          ? data.offerActivationsForEvent.data.map((row) => {
              return {
                [XDataLabel]: row.activationName,
                [YDataLabel]: row.adEventCount,
                description: row.activationDescription,
              };
            })
          : [],
    };
  }, [data?.offerActivationsForEvent]);

  const config: FunnelConfig = {
    data: parsedData,
    xField: XDataLabel,
    yField: YDataLabel,
    legend: false,
    shape: 'pyramid',
    loading,
  };

  if (error || data?.offerActivationsForEvent?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  const isEmptyData =
    !loading && (parsedData.length === 0 || parsedData.every((row) => row[YDataLabel] === 0));

  return (
    <div>
      <h2>Activation Funnel</h2>
      <$InfoDescription>
        Promote fan tickets for your event to increase revenue and earn commission on successful
        conversions for this offer. Monetize your platform and provide value to followers.
      </$InfoDescription>
      <Divider />
      <Row>
        <Col sm={24} md={18}>
          {isEmptyData ? (
            <Result
              status="info"
              title="Invite Fans"
              subTitle="View detailed analytics for your offer by inviting fans to your event."
              extra={[
                <Button onClick={props.onInviteFanModalToggle} type="primary">
                  Invite Fans
                </Button>,
              ]}
            />
          ) : (
            <Funnel {...config} />
          )}
        </Col>
        <Col
          sm={24}
          md={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading && [
            <Statistic key="loading1" loading={true} />,
            <Statistic key="loading2" loading={true} />,
            <Statistic key="loading3" loading={true} />,
          ]}
          {parsedData.map((row, idx) => {
            return (
              <Tooltip
                key={`Statistic${idx}`}
                placement="top"
                title={`This is a monetizable activation for this offer. You can earn revenue by driving completions to it from your event. ${
                  row.description
                    ? `The description of this activation is: "${row.description}"`
                    : ''
                }`}
              >
                <Statistic loading={loading} title={row[XDataLabel]} value={row[YDataLabel]} />
              </Tooltip>
            );
          })}
        </Col>
      </Row>
    </div>
  );
};

export default ActivationFunnel;
