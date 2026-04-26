const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { db } = require("../firebase");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    const { message, dashboardData, roomsData, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY missing in .env file",
      });
    }

    let latest = dashboardData;

    if (!latest) {
      const snapshot = await db
        .collection("sensorData")
        .where("roomId", "==", "Room101")
        .limit(1)
        .get();

      if (!snapshot.empty) {
        latest = snapshot.docs[0].data();
      }
    }

    if (!latest) {
      return res.json({
        reply: "No dashboard data is available right now.",
      });
    }

    let roomsSummary = "No multi-room occupancy data received.";

    if (roomsData && roomsData.length > 0) {
      // Get latest record per room only
      const latestRoomsMap = {};

      roomsData.forEach((room) => {
        const roomId = room.roomId || room.roomid;
        if (!roomId) return;

        if (
          !latestRoomsMap[roomId] ||
          new Date(room.createdAt || 0) >
          new Date(latestRoomsMap[roomId].createdAt || 0)
        ) {
          latestRoomsMap[roomId] = room;
        }
      });

      const latestRooms = Object.values(latestRoomsMap);

      const occupiedRooms = [
        ...new Set(
          latestRooms
            .filter(
              (room) =>
                room.pir === 1 ||
                room.pir === "1" ||
                room.occupancy === "Occupied"
            )
            .map((room) => room.roomId || room.roomid)
            .filter(Boolean)
        ),
      ];

      const lightsOnEmptyRooms = [
        ...new Set(
          latestRooms
            .filter(
              (room) =>
                (room.ldr === 1 || room.ldr === "1") &&
                !(
                  room.pir === 1 ||
                  room.pir === "1" ||
                  room.occupancy === "Occupied"
                )
            )
            .map((room) => room.roomId || room.roomid)
            .filter(Boolean)
        ),
      ];

      roomsSummary = `
Total Rooms: ${latestRooms.length}
Occupied Rooms: ${occupiedRooms.join(", ") || "None"}
Number of Occupied Rooms: ${occupiedRooms.length}
Rooms with lights ON but not occupied: ${lightsOnEmptyRooms.join(", ") || "None"}
`;
    }

    const dashboardText = `
Current Dashboard Data:
Room ID: ${latest.roomId || latest.roomid || "Room101"}
Temperature: ${latest.temperature} °C
Humidity: ${latest.humidity} %
Air Quality Index: ${latest.mq135Voltage || latest.air_quality_ppm}
Air Quality PPM: ${latest.air_quality_ppm || "N/A"}
Dust Density: ${latest.dust_density_ug_m3 || "N/A"}
Light Intensity: ${latest.light_intensity_lux || "N/A"}
Occupancy: ${latest.occupancy}
PIR: ${latest.pir ?? "N/A"}
LDR: ${latest.ldr ?? "N/A"}
Current: ${latest.current} A
Power: ${latest.power || "N/A"}
Energy Usage: ${latest.energy_kWh} kWh
Environmental Health: ${latest.environmental_health || latest.healthStatus || "Good"}
Health Score: ${latest.health_score || "100"}
Energy Waste: ${latest.energy_waste || 0}
Anomaly Type: ${latest.anomaly_type || "Normal"}
`;

    const historyText = (history || [])
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join("\n");

    const prompt = `
You are an AI chatbot for a Smart Hostel Environment Analytics Dashboard.

Use conversation history to understand follow-up questions like "why?", "how?", etc.

Conversation History:
${historyText}

Dashboard Data:
${dashboardText}

Room Occupancy Data:
${roomsSummary}

Answer clearly and contextually.

User question: ${message}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({
      reply,
      dashboardData: latest,
      roomsSummary,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      error: "Chatbot failed",
      details: error.message,
    });
  }
});

module.exports = router;