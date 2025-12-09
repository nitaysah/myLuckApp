// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// Replace the object below with the one from your Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBcZBINsBBcqgyLxzz89oMa--M-RWGlEbw",
    authDomain: "celestial-fortune-7d9b4.firebaseapp.com",
    projectId: "celestial-fortune-7d9b4",
    storageBucket: "celestial-fortune-7d9b4.firebasestorage.app",
    messagingSenderId: "134332367848",
    appId: "1:134332367848:web:cd8eef9c687e19864dda5d",
    measurementId: "G-89VG6015VC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
