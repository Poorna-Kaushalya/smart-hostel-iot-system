const { getLatestSensorData } = require("../services/sensorService");

async function getSensors(req, res) {
  try {
    const data = await getLatestSensorData(20);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sensor data" });
  }
}

module.exports = { getSensors };