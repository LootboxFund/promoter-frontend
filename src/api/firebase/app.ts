import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { manifest } from '@/manifest';

const firebaseConfig = manifest.firebase;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, manifest.cloudFunctions.region);
auth.useDeviceLanguage();
