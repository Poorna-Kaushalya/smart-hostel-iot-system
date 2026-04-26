require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const mlRoutes = require("./routes/mlRoutes");
const dustRoutes = require("./routes/dustRoutes");
const powerRoutes = require("./routes/powerRoutes");
const occupancyRoutes = require("./routes/occupancyRoutes");
const tempHumidityRoutes = require("./routes/tempHumidityRoutes");
const airQualityRoutes = require("./routes/airQualityRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const { startMqttClient } = require("./mqttClient");
const { db } = require("./firebase");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/sensors", authMiddleware, sensorRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/dust", dustRoutes);
app.use("/api/power", powerRoutes);
app.use("/api/occupancy", occupancyRoutes);
app.use("/api/temp-humidity", tempHumidityRoutes);
app.use("/api/air-quality", airQualityRoutes);

async function startServer() {
  try {
    await db.collection("test").add({
      message: "Firebase connected",
      createdAt: new Date(),
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