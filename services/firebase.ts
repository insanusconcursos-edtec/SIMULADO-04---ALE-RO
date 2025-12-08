
// This tells TypeScript that the 'firebase' object exists on the global scope
declare var firebase: any;

// Your web app's Firebase configuration
// ATUALIZADO PARA O PROJETO SIMULADO 04
// Using the new keys provided to ensure isolation from Simulado 03
const firebaseConfig = {
  apiKey: "AIzaSyBvNLO53e1RjE8a53xKIVo8xCEKnPLVc3c",
  authDomain: "simulado-04-ale-ro.firebaseapp.com",
  projectId: "simulado-04-ale-ro",
  storageBucket: "simulado-04-ale-ro.firebasestorage.app",
  messagingSenderId: "21249246924",
  appId: "1:21249246924:web:271f716295cfcb64166469",
  measurementId: "G-GNMYHHPW99"
};

// Initialize Firebase
// We check if firebase is already initialized to prevent errors during hot reloads
const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service using the compat API
export const db = app.firestore();
