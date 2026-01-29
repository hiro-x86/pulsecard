import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLZdJckOQaduOevL1i-0Q2MCV6Luc_KNA",
  authDomain: "pulsecard-fc0ff.firebaseapp.com",
  projectId: "pulsecard-fc0ff",
  storageBucket: "pulsecard-fc0ff.firebasestorage.app",
  messagingSenderId: "162243033950",
  appId: "1:162243033950:web:215c3587b0c814eafbedcf",
  measurementId: "G-1W5BLJPB9T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);