import { Col, Row, Statistic } from 'antd';
import { TournamentID } from '@wormgraph/helpers';
import BaseStats from './components/baseStatistics';

export interface EventAnalyticsProps {
  eventID: TournamentID;
}

const EventAnalytics: React.FC<EventAnalyticsProps> = ({ eventID }) => {
  return (
    <>
      <BaseStats eventID={eventID} />
    </>
  );
};

export default EventAnalytics;
