const { db, admin } = require("./firebase");
const sensorData = require("./sampleSensorData.json");

async function importSensorData() {
  try {
    for (const item of sensorData) {
      await db.collection("sensorData").add({
        ...item,
        deviceTimestamp: item.timestamp || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log("Sensor data imported successfully!");
    process.exit();
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

importSensorData();