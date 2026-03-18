const { cert } = require("firebase-admin/app");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "firebaseKey.json"));
const credential = cert(serviceAccount);

credential
  .getAccessToken()
  .then((token) => {
    console.log("Access token created successfully");
    console.log(token);
  })
  .catch((error) => {
    console.log("Access token error:", error.message);
  });