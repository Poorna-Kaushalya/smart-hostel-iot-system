import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-y0X34wFJIebEip5OChnv8_NlQHPxLns",
  authDomain: "smart-hostel-iot.firebaseapp.com",
  projectId: "smart-hostel-iot",
  storageBucket: "smart-hostel-iot.firebasestorage.app",
  messagingSenderId: "662667362777",
  appId: "1:662667362777:web:cb0cedb7dcabc85dc099c8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

