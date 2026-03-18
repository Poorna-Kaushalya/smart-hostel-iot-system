const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sensorRoutes = require("./routes/sensorRoutes");
const { startMqttClient } = require("./mqttClient");
const { db } = require("./firebase");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.use("/api/sensors", sensorRoutes);

async function startServer() {
  try {
    console.log("Testing Firebase connection...");
    await db.collection("test").add({
      message: "Firebase connected",
      createdAt: new Date()
    });
    console.log("Firebase connected successfully");
  } catch (error) {
    console.log("Firebase connection error:", error.message);
  }

  startMqttClient();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();