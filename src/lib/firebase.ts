import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "sportpal-4a832",
  appId: "1:372993120423:web:6d774cfc44347d18caa382",
  apiKey: "AIzaSyBCdjshfIrRehSDxIDjUxyW-XtjZolALzU",
  authDomain: "sportpal-4a832.firebaseapp.com",
  storageBucket: "sportpal-4a832.firebasestorage.app",
  messagingSenderId: "372993120423",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { sendEmailVerification };

export enum OperationType {
  READ = 'read',
  WRITE = 'write',
  LIST = 'list',
  DELETE = 'delete'
}

export const handleFirestoreError = (error: any, operation: OperationType, path: string) => {
  console.error(`Firestore ${operation} error at ${path}:`, error);
  
  if (error.code === 'permission-denied') {
    console.warn('Insufficient permissions. Check your Firestore rules.');
  } else if (error.code === 'not-found' && error.message.includes('Database')) {
    console.warn('Database not found. Please ensure Firestore is initialized in the Firebase Console.');
  }
};
