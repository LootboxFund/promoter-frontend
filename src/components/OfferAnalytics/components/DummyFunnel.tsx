import { FunctionComponent } from 'react';
import { Funnel, FunnelConfig } from '@ant-design/plots';

const DummyFunnel: FunctionComponent = () => {
  const data = [
    {
      stage: 'Demo Top Of Funnel Activation',
      number: 183,
    },
    {
      stage: 'Demo Middle Of Funnel Activation',
      number: 87,
    },
    {
      stage: 'Demo Bottom Of Funnel Activation',
      number: 59,
    },
  ];
  const config: FunnelConfig = {
    data: data,
    xField: 'stage',
    yField: 'number',
    shape: 'pyramid',
    theme: {
      colors10: ['#BFBFBF', '#9B9B9B', '#757575', '#535353'],
    },
    legend: false,
  };
  return <Funnel {...config} />;
};

export default DummyFunnel;
