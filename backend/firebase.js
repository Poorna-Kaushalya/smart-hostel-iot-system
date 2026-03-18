const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "firebaseKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

module.exports = { admin, db };