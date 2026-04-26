const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

function getDayName(record) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (record.dayOfWeek) {
    return String(record.dayOfWeek).slice(0, 3);
  }

  if (record.createdAt) {
    const date = new Date(String(record.createdAt).replace(" ", "T"));
    return days[date.getDay()];
  }

  if (record.timestamp) {
    const date = new Date(Number(record.timestamp) * 1000);
    return days[date.getDay()];
  }

  return "Unknown";
}

router.get("/daily-consumption", async (req, res) => {
  try {
    const roomId = req.query.roomId || "";

    const snapshot = await db
      .collection("sensorData")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    let records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (roomId) {
      records = records.filter(
        (r) =>
          String(r.roomId || r.roomid || "").toLowerCase() ===
          roomId.toLowerCase()
      );
    }

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayTotals = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };

    records.forEach((r) => {
      const powerW = Number(r.power || 0);
      if (!powerW) return;

      const day = getDayName(r);

      if (!dayTotals[day]) return;

      // If one record represents 5 minutes:
      // Wh = W × hours = W × (5/60)
      dayTotals[day] += powerW * (5 / 60);
    });

    const dailyPower = days.map((day) => ({
      day,
      energyWh: Number(dayTotals[day].toFixed(2)),
    }));

    res.json({
      roomId: roomId || "All Rooms",
      dailyPower,
      totalRecords: records.length,
    });
  } catch (error) {
    console.error("Power daily consumption error:", error);
    res.status(500).json({
      error: "Power daily consumption failed",
      details: error.message,
    });
  }
});

module.exports = router;