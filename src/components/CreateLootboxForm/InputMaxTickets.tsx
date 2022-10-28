import { InputNumber, Button, Typography, Space } from 'antd';

export interface TargetMaxTicketsWidgetProps {
  _maxTickets: number | null;
  _runningClaims: number | null;
  targetMaxTickets: number | null;
}

const InputMaxTickets = ({
  value,
  onChange,
}: {
  value: TargetMaxTicketsWidgetProps;
  onChange: (e: Partial<TargetMaxTicketsWidgetProps>) => void;
}) => {
  const isValidInput =
    value._maxTickets != null && value._runningClaims != null && value.targetMaxTickets != null;
  return (
    <Space direction="vertical">
      <InputNumber
        value={value.targetMaxTickets}
        onChange={(e) =>
          onChange({
            targetMaxTickets: e ? Math.round(e) : null,
            _maxTickets: value._maxTickets,
            _runningClaims: value._runningClaims,
          })
        }
        addonAfter={
          <Button
            ghost
            type="text"
            size="small"
            onClick={() =>
              onChange({
                targetMaxTickets: value._maxTickets,
                _maxTickets: value._maxTickets,
                _runningClaims: value._runningClaims,
              })
            }
          >
            {value._maxTickets} Original
          </Button>
        }
      />
      {isValidInput &&
      value.targetMaxTickets != null &&
      value._maxTickets != null &&
      value.targetMaxTickets === value._maxTickets ? (
        <Typography.Text type="secondary">Keeping "Max Tickets" the same</Typography.Text>
      ) : isValidInput && value.targetMaxTickets === value._runningClaims ? (
        <Typography.Text type="warning">
          This will change Max Tickets to the current number of claims ({value._runningClaims}).
          Doing this will turn your LOOTBOX to Sold Out and prevent new claimers.
        </Typography.Text>
      ) : isValidInput &&
        value.targetMaxTickets != null &&
        value._runningClaims != null &&
        value.targetMaxTickets < value._runningClaims ? (
        <Typography.Text type="danger">
          🚨 Change "Max Tickets" to a number lower than the number of claims (
          {value._runningClaims})? {value._runningClaims - value.targetMaxTickets} claimers will not
          get their reward!
        </Typography.Text>
      ) : isValidInput ? (
        <Typography.Text type="warning">
          Change Max Tickets to {value.targetMaxTickets}?
        </Typography.Text>
      ) : null}
    </Space>
  );
};

export default InputMaxTickets;
