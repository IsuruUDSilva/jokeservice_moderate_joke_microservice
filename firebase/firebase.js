// firebase/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase only if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://jokeservice-joke-delivery.firebaseio.com" // Replace with your actual database URL
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
