const { getLatestSensorData } = require("../services/sensorService");

// get latest sensor data
async function getSensors(req, res) {
  try {
    const data = await getLatestSensorData(10); 
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching sensor data:", error.message);
    res.status(500).json({ message: "Failed to fetch sensor data" });
  }
}

module.exports = { getSensors };