import { AirdropBase, OfferID, TournamentID, UserID } from '@wormgraph/helpers';
import { $Vertical, $InfoDescription, $Horizontal } from '@/components/generics';
import { Button, Form, Statistic, Steps, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import FormBuilder from 'antd-form-builder';
import { Rule } from 'antd/lib/form';

export type AirdropDeployModalProps = {
  offerID: OfferID;
  tournamentID: TournamentID;
  title: string;
  oneLiner: string;
  value: string;
  instructionsLink: string;
  // questionFields: { id?: string; question: string; type: AirdropQuestionFieldType }[];
  batchNumber: number;
  toggleModal: (bool: boolean) => void;
  selectedClaimers: UserID[];
};

const AIRDROP_METADATA = {
  title: 'x',
  oneLiner: '',
  value: '',
  instructionsLink: '',
  tournamentID: '',
  organizerID: '',
  advertiserID: '',
  // questionFields: [
  //   {
  //     question: '',
  //     type: AirdropQuestionFieldType.Text,
  //   },
  //   {
  //     question: '',
  //     type: AirdropQuestionFieldType.Text,
  //   },
  // ],
};

const AirdropDeployModal: React.FC<AirdropDeployModalProps> = ({
  offerID,
  tournamentID,
  title,
  oneLiner,
  value,
  instructionsLink,
  // questionFields,
  batchNumber,
  toggleModal,
  selectedClaimers,
}) => {
  const [form] = Form.useForm();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const [phase, setPhase] = useState(0);
  const [airdropMetadata, setAirdropMetadata] = useState(AIRDROP_METADATA);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const updatedAirdropMetadata: any = {};
    if (title) {
      updatedAirdropMetadata.title = title;
    }
    if (oneLiner) {
      updatedAirdropMetadata.oneLiner = oneLiner;
    }
    if (value) {
      updatedAirdropMetadata.value = value;
    }
    if (instructionsLink) {
      updatedAirdropMetadata.instructionsLink = instructionsLink;
    }
    console.log(`updatedAirdropMetadata = `, updatedAirdropMetadata);
    setAirdropMetadata({
      ...airdropMetadata,
      ...updatedAirdropMetadata,
    });
  }, []);
  const next = () => {
    setPhase(phase + 1);
  };
  const prev = () => {
    setPhase(phase - 1);
  };
  const getMeta1 = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: airdropMetadata,
      fields: [
        {
          key: 'title',
          label: 'Title',
          required: true,
          tooltip: 'The batch name shown to your internal team',
        },
        {
          key: 'value',
          label: 'Reward',
          tooltip:
            'The value of the airdrop you are sending to users. Ideally this is denominated in an understandable currency such as fiat.',
        },
        {
          key: 'oneLiner',
          label: 'One-Liner',
          tooltip:
            'Shown to airdrop recipients as what you want them to do in order to get this airdrop reward',
        },
        {
          key: 'instructionsLink',
          label: 'Link to Instructions',
          tooltip: 'The batch name shown to your internal team',
        },
      ],
    };
    return meta;
  };
  const getMeta2 = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: airdropMetadata,
      fields: [
        {
          key: 'title',
          label: 'Title',
          required: true,
          tooltip: 'The batch name shown to your internal team',
        },
        {
          key: 'value',
          label: 'Reward',
          tooltip:
            'The value of the airdrop you are sending to users. Ideally this is denominated in an understandable currency such as fiat.',
        },
        {
          key: 'oneLiner',
          label: 'One-Liner',
          tooltip:
            'Shown to airdrop recipients as what you want them to do in order to get this airdrop reward',
        },
        {
          key: 'instructionsLink',
          label: 'Link to Instructions',
          tooltip: 'The batch name shown to your internal team',
        },
      ],
    };
    return meta;
  };
  return (
    <div style={{ width: '100%' }}>
      <$Vertical>
        <Steps current={phase}>
          <Steps.Step title="Prepare Airdrop" onClick={() => setPhase(0)} />
          <Steps.Step title="Prepare Lootbox" />
          <Steps.Step title="Deploy" />
        </Steps>
        <br />
        <br />
        {phase === 0 && (
          <$Vertical>
            <$Horizontal justifyContent="space-between">
              <$Vertical>
                <b>Step 1 - Prepare Airdrop</b>
                <$InfoDescription fontSize="0.8rem">Lorem ipsum solar descartes</$InfoDescription>
                <Form
                  layout="horizontal"
                  form={form}
                  onFinish={() => next()}
                  onValuesChange={forceUpdate}
                >
                  <FormBuilder form={form} meta={getMeta1()} viewMode={false} />

                  <$Horizontal justifyContent="flex-end" style={{ width: '100%' }}>
                    <Form.Item className="form-footer">
                      <Button htmlType="submit" type="primary">
                        Next
                      </Button>
                    </Form.Item>
                  </$Horizontal>
                </Form>
              </$Vertical>
              <$Vertical>
                <Statistic title="Selected Users" value={selectedClaimers.length} />
                <Statistic title="Airdrop Batch" value={batchNumber} />
              </$Vertical>
            </$Horizontal>
          </$Vertical>
        )}
        {phase === 1 && <span>Step 2</span>}
        {phase === 2 && <span>Step 3</span>}
      </$Vertical>
    </div>
  );
};

export default AirdropDeployModal;
