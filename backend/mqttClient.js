const mqtt = require("mqtt");
const { validateSensorData } = require("./utils/validator");
const { saveSensorData } = require("./services/sensorService");

function startMqttClient() {
  const client = mqtt.connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  });

  client.on("connect", () => {
    console.log("MQTT connected");
    client.subscribe(process.env.MQTT_TOPIC);
  });

  client.on("message", async (topic, message) => {
    try {
      const raw = message.toString();
      console.log("Incoming topic:", topic);
      console.log("Incoming raw message:", raw);

      const payload = JSON.parse(raw);
      console.log("Parsed payload:", payload);

      const isValid = validateSensorData(payload);
      console.log("Validation result:", isValid);

      if (!isValid) {
        console.log("Invalid sensor data:", payload);
        return;
      }

      const saved = await saveSensorData(payload);
      console.log("Saved document:", saved.id);
    } catch (error) {
      console.log("MQTT message error:", error.message);
    }
  });

  client.on("error", (error) => {
    console.log("MQTT connection error:", error.message);
  });

  return client;
}

module.exports = { startMqttClient };