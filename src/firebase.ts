import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZahSZjkNbedZiGlpSXZvr37ymY_r4Qoc",
  authDomain: "needle-drop-8b6b0.firebaseapp.com",
  projectId: "needle-drop-8b6b0",
  storageBucket: "needle-drop-8b6b0.firebasestorage.app",
  messagingSenderId: "94835525438",
  appId: "1:94835525438:web:5eb33a942bf461461d4e6f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
