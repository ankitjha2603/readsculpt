// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD44dE2HaFSjrrjCOapBZoTiUeYCdxPYsc",
  authDomain: "readsculpt.firebaseapp.com",
  databaseURL:
    "https://readsculpt-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "readsculpt",
  storageBucket: "readsculpt.appspot.com",
  messagingSenderId: "676484880586",
  appId: "1:676484880586:web:ac4df751f9cdc3c435bc33",
  measurementId: "G-78DC5WW60M",
};
const app = initializeApp(firebaseConfig);
export default app;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
