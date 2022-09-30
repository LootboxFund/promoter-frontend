import { functions } from './app';
import { httpsCallable } from 'firebase/functions';
import { EnqueueLootboxOnCreateCallableRequest } from '@wormgraph/helpers';

export const startLootboxCreatedListener = httpsCallable<
  EnqueueLootboxOnCreateCallableRequest,
  void
>(functions, 'enqueueIndexLootboxOnCreateTasks');
