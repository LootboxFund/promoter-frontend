import { AirdropBase, LootboxID, OfferID, TournamentID, UserID } from '@wormgraph/helpers';
import { $Vertical, $InfoDescription, $Horizontal } from '@/components/generics';
import { Button, Form, message, Statistic, Steps, Tabs } from 'antd';
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
        },
        {
          key: 'oneLiner',
          label: 'One-Liner',
          tooltip:
            'Shown to airdrop recipients as what you want them to do in order to get this airdrop reward',
          initialValue: airdropMetadata.oneLiner,
        },
        {
          key: 'instructionsLink',
          label: 'Instructions',
          tooltip: 'The batch name shown to your internal team',
          initialValue: airdropMetadata.instructionsLink,
        },
      ],
    };
    return meta;
  };
  const createLootbox = async (
    request: CreateLootboxRequest,
  ): Promise<{ lootboxID: LootboxID }> => {
    console.log(`

      request.payload.name = ${request.payload.name}
      request.payload.name.slice(0, 11) = ${request.payload.name.slice(0, 11)}
      request.payload.maxTickets = ${request.payload.maxTickets}

      `);

    const res = await createLootboxMutation({
      variables: {
        payload: {
          name: request.payload.name,
          description: request.payload.description,
          logo: request.payload.logoImage,
          backgroundImage: request.payload.backgroundImage,
          nftBountyValue: request.payload.nftBountyValue,
          joinCommunityUrl: request.payload.joinCommunityUrl,
          maxTickets: request.payload.maxTickets,
          themeColor: request.payload.themeColor,
          tournamentID: tournamentID,
          type: LootboxType.Airdrop,
          airdropMetadata: {
            batch: batchNumber,
            offerID: offerID,
            title: airdropMetadata.title,
            oneLiner: airdropMetadata.oneLiner,
            value: request.payload.nftBountyValue,
            instructionsLink: airdropMetadata.instructionsLink,
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

      next();
      return { lootboxID: lid };
    }

    throw new Error('An error occured!');
  };
  return (
    <div style={{ width: '100%' }}>
      <$Vertical>
        <Steps current={phase}>
          <Steps.Step title="Prepare Airdrop" />
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
        {phase === 1 && (
          <$Vertical>
            <b>Step 2 - Prepare Lootbox</b>
            <$InfoDescription fontSize="0.8rem" marginBottom="0px">
              Lorem ipsum solar descartes
            </$InfoDescription>
            <br />
            <AirdropCreateLootbox
              onSubmitCreate={createLootbox}
              mode="create"
              airdropParams={{
                tournamentID: tournamentID,
                numClaimers: selectedClaimers.length,
                teamName: airdropMetadata.title,
                value: value,
              }}
            />
          </$Vertical>
        )}
        {phase === 2 && (
          <$Vertical>
            <b>Step 3 - Deposit Rewards</b>
            <$InfoDescription fontSize="0.8rem" marginBottom="0px">
              Lorem ipsum solar descartes
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
