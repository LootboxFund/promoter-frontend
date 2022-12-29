import { Button, message, notification } from 'antd';
import { useMutation } from '@apollo/client';
import { MutationClaimerCsvDataArgs } from '@/api/graphql/generated/types';
import { CreateClaimerCSVResponseFE, MUTATION_CREATE_CLAIMER_CSV } from './api.gql';
import { TournamentID } from '@wormgraph/helpers';
import { ButtonType } from 'antd/lib/button';

export type EventCSVDownloaderProps = {
  eventID: TournamentID;
  text?: string;
  type?: ButtonType;
};
const EventCSVDownloader: React.FC<EventCSVDownloaderProps> = (props) => {
  const [generateClaimerCSV, { loading: loadingClaimerCSVData }] = useMutation<
    CreateClaimerCSVResponseFE,
    MutationClaimerCsvDataArgs
  >(MUTATION_CREATE_CLAIMER_CSV);

  const handleEventClaimerCSV = async () => {
    if (loadingClaimerCSVData) return;
    const loadingMessge = message.loading('Generating CSV file...', 0);
    try {
      const { data } = await generateClaimerCSV({
        variables: {
          payload: {
            eventID: props.eventID,
          },
        },
      });

      if (data?.claimerCSVData.__typename === 'ResponseError') {
        throw new Error(data.claimerCSVData.error.message);
      }

      loadingMessge();
      notification.success({
        message: 'CSV file generated successfully',
        placement: 'top',
        duration: 0,
        description: (
          <a
            href={
              data && 'csvDownloadURL' in data?.claimerCSVData
                ? data?.claimerCSVData.csvDownloadURL
                : undefined
            }
            download
            style={{ fontStyle: 'italic' }}
          >
            <Button type="link">Download CSV</Button>
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
      onClick={handleEventClaimerCSV}
    >
      {props.text || 'Download'}
    </Button>
  );
};

export default EventCSVDownloader;
