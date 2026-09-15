// Configuration Firebase - Projet jaetemoignage (nouvelle clé)
const firebaseConfig = {
  apiKey: "AIzaSyDzMcQOoOAT_wjh7wTB-wnsDiazg2o78RA",
  authDomain: "jaetemoignage.firebaseapp.com",
  projectId: "jaetemoignage",
  storageBucket: "jaetemoignage.firebasestorage.app",
  messagingSenderId: "458242825388",
  appId: "1:458242825388:web:00d86477e9214bbc7a1309"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
