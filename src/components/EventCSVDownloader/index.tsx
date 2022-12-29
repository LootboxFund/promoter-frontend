import { Button, Tabs } from 'antd';
import { $Horizontal, $InfoDescription, $ErrorMessage } from '@/components/generics';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { MutationClaimerCsvDataArgs } from '@/api/graphql/generated/types';
import { CreateClaimerCSVResponseFE, MUTATION_CREATE_CLAIMER_CSV } from './api.gql';
import { TournamentID } from '@wormgraph/helpers';

enum EventCSVDataMode {
  'ListOfFans' = 'ListOfFans',
}

export type EventCSVDownloaderProps = {
  eventID: TournamentID;
  initialMode?: EventCSVDataMode;
  onCancel: () => void;
};
const EventCSVDownloader: React.FC<EventCSVDownloaderProps> = ({
  eventID,
  initialMode = EventCSVDataMode.ListOfFans,
  onCancel,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [generateClaimerCSV, { data: eventClaimerCSVData, loading: loadingClaimerCSVData }] =
    useMutation<CreateClaimerCSVResponseFE, MutationClaimerCsvDataArgs>(
      MUTATION_CREATE_CLAIMER_CSV,
    );

  const handleEventClaimerCSV = async () => {
    if (loadingClaimerCSVData) return;
    setErrorMessage('');
    try {
      const { data } = await generateClaimerCSV({
        variables: {
          payload: {
            eventID,
          },
        },
      });

      if (data?.claimerCSVData.__typename === 'ResponseError') {
        throw new Error(data.claimerCSVData.error.message);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'An error occured');
    }
  };

  const downloadModes = [
    {
      label: 'List of Fans',
      initialMode: initialMode,
      key: EventCSVDataMode.ListOfFans,
      children: (
        <div>
          <h3>Download Analytics of your Fans</h3>
          <$InfoDescription fontSize="0.8rem">
            {`Generate a CSV file that contains detailed information about the fans for your event. This includes the fan's name, email, and the number of tickets they claimed. Note: email & phone number can only be provided if you set the "Privacy Scope" to "DataSharing" for this event. `}
            <a href="https://lootbox.fyi/3tYiGVs" target="_blank" rel="noreferrer">
              View Tutorial
            </a>
          </$InfoDescription>
          <br />
          <br />
          <br />
          <$Horizontal justifyContent="flex-end">
            <Button onClick={onCancel} style={{ marginRight: '5px' }}>
              Cancel
            </Button>

            {eventClaimerCSVData?.claimerCSVData &&
            'csvDownloadURL' in eventClaimerCSVData.claimerCSVData ? (
              <a
                href={eventClaimerCSVData.claimerCSVData.csvDownloadURL}
                download
                style={{ fontStyle: 'italic' }}
              >
                <Button
                  style={{ backgroundColor: '#4baf21', border: '0px solid white', color: 'white' }}
                >
                  Download CSV
                </Button>
              </a>
            ) : (
              <Button
                loading={loadingClaimerCSVData}
                onClick={handleEventClaimerCSV}
                type="primary"
              >
                Generate CSV
              </Button>
            )}
          </$Horizontal>
        </div>
      ),
    },
  ];

  return (
    <>
      <Tabs items={downloadModes} type="card" />
      {errorMessage ? (
        <$ErrorMessage style={{ paddingTop: '15px' }}>{errorMessage}</$ErrorMessage>
      ) : null}
    </>
  );
};

export default EventCSVDownloader;
