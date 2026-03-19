const { db, admin } = require("../firebase");

async function saveSensorData(data) {
  const payload = {
    ...data,
    deviceTimestamp: data.timestamp ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await db.collection("sensorData").add(payload);
  return { id: docRef.id, ...payload };
}

async function getLatestSensorData(limit = 20) {
  const snapshot = await db
    .collection("sensorData")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = { saveSensorData, getLatestSensorData };