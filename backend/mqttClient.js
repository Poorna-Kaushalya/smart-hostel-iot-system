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
      const payload = JSON.parse(message.toString());

      if (!validateSensorData(payload)) {
        console.log("Invalid sensor data");
        return;
      }

      await saveSensorData(payload);
      console.log("Saved:", payload.roomId);
    } catch (error) {
      console.log("MQTT message error");
    }
  });

  client.on("error", () => {
    console.log("MQTT connection error");
  });

  return client;
}

module.exports = { startMqttClient };