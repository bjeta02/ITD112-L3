import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"; // Added getDocs import

// Firebase configuration (replace with your own credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDRoyT4ovi1NhsnTQDZ_OUaaSCqth-EstU",
  authDomain: "itd112lab3-4b7b3.firebaseapp.com",
  projectId: "itd112lab3-4b7b3",
  storageBucket: "itd112lab3-4b7b3.firebasestorage.app",
  messagingSenderId: "437810206391",
  appId: "1:437810206391:web:8d79e3da563aab234f9f32",
  measurementId: "G-TMY1DLBWRB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore methods
export { db, collection, addDoc, getDocs }; // Added getDocs export
