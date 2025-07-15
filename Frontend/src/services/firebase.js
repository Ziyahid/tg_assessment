import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "e-commerce-824a0.firebaseapp.com",
  projectId: "e-commerce-824a0",
  storageBucket: "e-commerce-824a0.firebasestorage.app",
  messagingSenderId: "1062943728391",
  appId: "1:1062943728391:web:413511bec30c86135a9ba2",
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


export const db = getFirestore(app);

export default app;
