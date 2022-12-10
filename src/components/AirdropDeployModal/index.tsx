import { AirdropBase, LootboxID, OfferID, TournamentID, UserID } from '@wormgraph/helpers';
import { $Vertical, $InfoDescription, $Horizontal } from '@/components/generics';
import { Button, Form, message, Statistic, Steps, Tabs, Image } from 'antd';
import { useEffect, useState } from 'react';
import FormBuilder from 'antd-form-builder';
import { Rule } from 'antd/lib/form';
import CreateLootboxForm, { CreateLootboxRequest } from '../CreateLootboxForm';
import { useMutation } from '@apollo/client';
import {
  CreateLootboxResponseFE,
  CREATE_LOOTBOX,
} from '@/pages/Dashboard/LootboxCreatePage/api.gql';
import { LootboxType, MutationCreateLootboxArgs } from '@/api/graphql/generated/types';
import AirdropCreateLootbox from '../AirdropCreateLootbox';
import { Link } from '@umijs/max';
import { GET_TOURNAMENT_LOOTBOXES } from '@/pages/Dashboard/EventPage/api.gql';
import { LIST_POTENTIAL_AIRDROP_CLAIMERS } from '../AirdropControlPanel/index.gql';

export type AirdropDeployModalProps = {
  offerID: OfferID;
  tournamentID: TournamentID;
  title: string;
  oneLiner: string;
  value: string;
  instructionsLink: string;
  // questionFields: { id?: string; question: string; type: AirdropQuestionFieldType }[];
  batchNumber: number;
  lootboxTemplateStamp: string;
  toggleModal: (bool: boolean) => void;
  selectedClaimers: UserID[];
  exitClear: () => void;
};

const AIRDROP_METADATA = {
  title: '',
  oneLiner: '',
  value: '',
  instructionsLink: '',
  tournamentID: '',
  organizerID: '',
  advertiserID: '',
  lootboxTemplateID: '',
  lootboxTemplateStamp: '',
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
  exitClear,
  instructionsLink,
  // questionFields,
  batchNumber,
  toggleModal,
  selectedClaimers,
  lootboxTemplateStamp,
}) => {
  console.log(`--- offerID `, offerID);
  const [form] = Form.useForm();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const [phase, setPhase] = useState(0);

  const [lootboxID, setLootboxID] = useState<LootboxID>();
  const [airdropMetadata, setAirdropMetadata] = useState({
    ...AIRDROP_METADATA,
    title: title || AIRDROP_METADATA.title,
    oneLiner: oneLiner || AIRDROP_METADATA.oneLiner,
    value: value || AIRDROP_METADATA.value,
    instructionsLink: instructionsLink || AIRDROP_METADATA.instructionsLink,
  });
  const [pending, setPending] = useState(false);
  const next = () => {
    setPhase(phase + 1);
  };
  const prev = () => {
    setPhase(phase - 1);
  };
  const [createLootboxMutation, { loading: loadingLootboxCreate }] = useMutation<
    CreateLootboxResponseFE,
    MutationCreateLootboxArgs
  >(CREATE_LOOTBOX, {
    refetchQueries: [
      {
        query: GET_TOURNAMENT_LOOTBOXES,
        variables: {
          id: tournamentID,
        },
      },
      {
        query: LIST_POTENTIAL_AIRDROP_CLAIMERS,
        variables: {
          payload: {
            offerID,
            tournamentID,
          },
        },
      },
    ],
  });
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
          initialValue: airdropMetadata.title,
        },
        {
          key: 'value',
          label: 'Reward',
          tooltip:
            'The value of the airdrop you are sending to users. Ideally this is denominated in an understandable currency such as fiat.',
          initialValue: airdropMetadata.value,
          widget: () => <span>{airdropMetadata.value}</span>,
        },
        {
          key: 'oneLiner',
          label: 'One-Liner',
          tooltip:
            'Shown to airdrop recipients as what you want them to do in order to get this airdrop reward',
          initialValue: airdropMetadata.oneLiner,
          widget: () => <span>{airdropMetadata.oneLiner}</span>,
        },
        {
          key: 'instructionsLink',
          label: 'Instructions',
          tooltip: 'The batch name shown to your internal team',
          initialValue: airdropMetadata.instructionsLink,
          widget: () => (
            <a
              href={airdropMetadata.instructionsLink}
              target="_blank"
              rel="noreferrer"
            >{`${airdropMetadata.instructionsLink.slice(0, 25)}..`}</a>
          ),
        },
      ],
    };
    return meta;
  };
  const createLootbox = async (
    request: CreateLootboxRequest,
  ): Promise<{ lootboxID: LootboxID }> => {
    setPending(true);
    const res = await createLootboxMutation({
      variables: {
        payload: {
          name: airdropMetadata.title,
          maxTickets: selectedClaimers.length,
          tournamentID: tournamentID,
          type: LootboxType.Airdrop,
          airdropMetadata: {
            batch: batchNumber,
            offerID: offerID,
            title: airdropMetadata.title,
            tournamentID: tournamentID,
            claimers: selectedClaimers,
          },
        },
      },
    });

    if (res?.data?.createLootbox.__typename === 'CreateLootboxResponseSuccess') {
      const lid = res.data.createLootbox.lootbox.id;
      console.log(`lootboxID = `, lid);
      setLootboxID(lid);
      message.success('Lootbox created successfully');
      setPending(false);
      next();
      return { lootboxID: lid };
    }

    throw new Error('An error occured!');
  };
  return (
    <div style={{ width: '100%' }}>
      <$Vertical>
        <Steps current={phase}>
          <Steps.Step title="Review Airdrop" />
          <Steps.Step title="Deploy" />
        </Steps>
        <br />
        <br />
        {phase === 0 && (
          <$Vertical>
            <$Horizontal justifyContent="space-between">
              <$Vertical>
                <b>Step 1 - Prepare Airdrop</b>
                <$InfoDescription fontSize="0.8rem">{`Most settings are based off the advertiser's pre-fills`}</$InfoDescription>
                <Form
                  layout="horizontal"
                  form={form}
                  onFinish={createLootbox}
                  onValuesChange={forceUpdate}
                >
                  <FormBuilder form={form} meta={getMeta1()} viewMode={false} />
                  <$Horizontal justifyContent="flex-end" style={{ width: '100%' }}>
                    <Form.Item className="form-footer">
                      <Button loading={pending} htmlType="submit" type="primary">
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
              <Image src={lootboxTemplateStamp} style={{ width: '250px', height: 'auto' }} />
            </$Horizontal>
          </$Vertical>
        )}
        {phase === 1 && (
          <$Vertical>
            <b>Step 3 - Deposit Rewards</b>
            <$InfoDescription fontSize="0.8rem" marginBottom="0px">
              Your Airdrop has been deployed and the fans have received their ticket claims. Now you
              must deposit the actual rewards into the Lootbox and send the email blast. Click the
              below button to view your Airdrop Lootbox.
            </$InfoDescription>
            <br />
            <div
              onClick={() => {
                setPhase(0);
                exitClear();
              }}
            >
              <Link to={`/dashboard/lootbox/id/${lootboxID}?tid=${tournamentID}`} target="_blank">
                <Button type="primary">View Lootbox</Button>
              </Link>
            </div>
          </$Vertical>
        )}
      </$Vertical>
    </div>
  );
};

export default AirdropDeployModal;
