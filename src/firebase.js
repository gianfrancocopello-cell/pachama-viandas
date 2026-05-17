import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJ5B_ZZSkBI-B-WOoW9__m204b8eYlx8g",
  authDomain: "pachama-viandas.firebaseapp.com",
  projectId: "pachama-viandas",
  storageBucket: "pachama-viandas.firebasestorage.app",
  messagingSenderId: "156982878097",
  appId: "1:156982878097:web:b3ce36d437607962dfc430"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { doc, setDoc, onSnapshot };