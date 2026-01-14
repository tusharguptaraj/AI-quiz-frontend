// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./auth/firebaseConfig";


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
