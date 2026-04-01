import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBF7AjhFaHR73vtwCD5mwWwm7CCSdY3qd4",
  authDomain: "eventmanagement-bb104.firebaseapp.com",
  projectId: "eventmanagement-bb104",
  storageBucket: "eventmanagement-bb104.firebasestorage.app",
  messagingSenderId: "827406676356",
  appId: "1:827406676356:web:ec4cddec623a1d9936edd1",
  measurementId: "G-SGC5XJLVK5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
