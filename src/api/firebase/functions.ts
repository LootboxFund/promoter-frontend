import { functions } from './app';
import { httpsCallable } from 'firebase/functions';
import {
  EnqueueLootboxDepositEmailRequest,
  EnqueueLootboxOnCreateCallableRequest,
} from '@wormgraph/helpers';

export const startLootboxCreatedListener = httpsCallable<
  EnqueueLootboxOnCreateCallableRequest,
  void
>(functions, 'enqueueLootboxOnCreate');

export const sendLootboxTournamentEmails = httpsCallable<EnqueueLootboxDepositEmailRequest, void>(
  functions,
  'enqueueLootboxDepositEmail',
);
