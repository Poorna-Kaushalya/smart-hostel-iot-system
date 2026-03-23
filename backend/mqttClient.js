const mqtt = require("mqtt");
const { saveSensorData } = require("./services/sensorService");

let client;

function startMqttClient() {
  if (client) return client;

  client = mqtt.connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  });

  client.on("connect", () => {
    console.log("MQTT connected");
    client.subscribe(process.env.MQTT_TOPIC, (err) => {
      if (err) console.log("MQTT subscription error:", err.message);
    });
  });

  client.on("message", async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      console.log("Received MQTT message:", payload);

      const savedDoc = await saveSensorData(payload);
      console.log("Saved sensor data to Firestore with ID:", savedDoc.id);

    } catch (error) {
      console.log("MQTT message error:", error.message);
    }
  });

  client.on("error", (err) => console.log("MQTT error:", err.message));
  return client;
}

module.exports = { startMqttClient };