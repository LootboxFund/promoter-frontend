import {
  AirdropBase,
  AirdropQuestionField,
  AirdropQuestionFieldType,
  OfferID,
  TournamentID,
  UserID,
} from '@wormgraph/helpers';
import { $Vertical } from '@/components/generics';

export type AirdropDeployModalProps = {
  offerID: OfferID;
  tournamentID: TournamentID;
  title: string;
  oneLiner: string;
  value: string;
  instructionsLink: string;
  questionFields: { question: string; type: AirdropQuestionFieldType }[];
  batchNumber: number;
  toggleModal: (bool: boolean) => void;
  selectedClaimers: UserID[];
};

const AirdropDeployModal: React.FC<AirdropDeployModalProps> = ({
  offerID,
  tournamentID,
  title,
  oneLiner,
  value,
  instructionsLink,
  questionFields,
  batchNumber,
  toggleModal,
  selectedClaimers,
}) => {
  return (
    <$Vertical>
      {title}
      {selectedClaimers}
    </$Vertical>
  );
};

export default AirdropDeployModal;
