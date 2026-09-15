// Configuration Firebase - Projet jaetemoignage
const firebaseConfig = {
  apiKey: "AIzaSyDzMcQOoOAT_wjh7wTB-wnsDiazg2o78RA",
  authDomain: "jaetemoignage.firebaseapp.com",
  projectId: "jaetemoignage",
  storageBucket: "jaetemoignage.firebasestorage.app",
  messagingSenderId: "458242825388",
  appId: "1:458242825388:web:1ff5a57de82752a07a1309"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
