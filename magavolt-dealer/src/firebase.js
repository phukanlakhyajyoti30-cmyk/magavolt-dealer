
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFcVNLD-mJ6uH86aQ3o58VeCspI9Eife",
  authDomain: "magavolt.firebaseapp.com",
  projectId: "magavolt",
  storageBucket: "magavolt.firebasestorage.app",
  messagingSenderId: "332463548219",
  appId: "1:332463548219:web:5e9c5bf278164aac77f91e",
  measurementId: "G-GP8ZWJ3LTQ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
