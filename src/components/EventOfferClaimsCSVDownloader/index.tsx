import { Button, message, notification } from 'antd';
import { useMutation } from '@apollo/client';
import { MutationOfferEventClaimsCsvArgs } from '@/api/graphql/generated/types';
import { OfferEventClaimsCSVResponseFE, OFFER_EVENT_CLAIMS_FOR_EVENT } from './api.gql';
import { OfferID, TournamentID } from '@wormgraph/helpers';
import { ButtonType } from 'antd/lib/button';

export type EventCSVDownloaderProps = {
  eventID: TournamentID;
  offerID: OfferID;
  text?: string;
  type?: ButtonType;
};
const OfferEventClaimsCSVDownloader: React.FC<EventCSVDownloaderProps> = (props) => {
  const [generateEventClaimsCSV, { loading: loadingClaimerCSVData }] = useMutation<
    OfferEventClaimsCSVResponseFE,
    MutationOfferEventClaimsCsvArgs
  >(OFFER_EVENT_CLAIMS_FOR_EVENT);

  const handleEventClaimsCSV = async () => {
    if (loadingClaimerCSVData) return;
    const loadingMessge = message.loading('Generating CSV file...', 0);
    try {
      const { data } = await generateEventClaimsCSV({
        variables: {
          payload: {
            eventID: props.eventID,
            offerID: props.offerID,
          },
        },
      });

      if (data?.offerEventClaimsCSV.__typename === 'ResponseError') {
        throw new Error(data.offerEventClaimsCSV.error.message);
      }

      loadingMessge();
      notification.success({
        message: 'CSV file generated successfully',
        placement: 'top',
        duration: 0,
        description: (
          <a
            href={
              data && 'csvDownloadURL' in data?.offerEventClaimsCSV
                ? data?.offerEventClaimsCSV.csvDownloadURL
                : undefined
            }
            download
            style={{ fontStyle: 'italic' }}
          >
            <br />
            <Button type="primary">Download CSV</Button>
          </a>
        ),
      });
    } catch (e: any) {
      loadingMessge();
      message.error(e?.message || 'An error occured');
    }
  };

  return (
    <Button
      type={props.type || 'ghost'}
      loading={loadingClaimerCSVData}
      onClick={handleEventClaimsCSV}
    >
      {props.text || 'Download'}
    </Button>
  );
};

export default OfferEventClaimsCSVDownloader;
