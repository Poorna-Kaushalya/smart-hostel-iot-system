const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

function getRoomId(r) {
  return r.roomId || r.roomid || "Unknown";
}

function getTimestamp(r) {
  return Number(r.timestamp || r.deviceTimestamp || 0);
}

function getAQI(r) {
  return Number(r.air_quality_ppm || r.aqi || 0);
}

function getAQIStatus(value) {
  if (value <= 100) return "Good";
  if (value <= 150) return "Moderate";
  if (value <= 200) return "Poor";
  return "Hazardous";
}

router.get("/analysis", async (req, res) => {
  try {
    const roomId = req.query.roomId || "";

    const snapshot = await db
      .collection("sensorData")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    let allRecords = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    allRecords = allRecords.sort((a, b) => getTimestamp(a) - getTimestamp(b));

    let filteredRecords = [...allRecords];

    if (roomId) {
      const keyword = roomId.toLowerCase().trim();

      filteredRecords = filteredRecords.filter((r) =>
        getRoomId(r).toLowerCase().includes(keyword)
      );
    }

    const trendData = filteredRecords.map((r) => ({
      time: `${r.hour ?? ""}:00`,
      aqi: getAQI(r),
    }));

    const avgAQI =
      filteredRecords.length > 0
        ? Math.round(
            filteredRecords.reduce((sum, r) => sum + getAQI(r), 0) /
              filteredRecords.length
          )
        : 0;

    const highestRecord = filteredRecords.reduce((max, r) => {
      return getAQI(r) > getAQI(max || {}) ? r : max;
    }, null);

    const highestAQI = highestRecord ? getAQI(highestRecord) : 0;

    const roomMap = {};

    allRecords.forEach((r) => {
      const room = getRoomId(r);
      if (!roomMap[room]) roomMap[room] = [];
      roomMap[room].push(r);
    });

    const roomComparison = Object.keys(roomMap).map((room) => {
      const list = roomMap[room];
      const avg =
        list.reduce((sum, r) => sum + getAQI(r), 0) / (list.length || 1);

      return {
        room,
        aqi: Math.round(avg),
      };
    });

    const periods = {
      Morning: [6, 12],
      Afternoon: [12, 18],
      Evening: [18, 22],
      Night: [22, 30],
    };

    const heatmapRows = Object.keys(roomMap).map((room) => {
      const list = roomMap[room];

      const row = { room };

      Object.keys(periods).forEach((period) => {
        const [start, end] = periods[period];

        const records = list.filter((r) => {
          const h = Number(r.hour || 0);
          if (period === "Night") return h >= 22 || h < 6;
          return h >= start && h < end;
        });

        const avg =
          records.length > 0
            ? Math.round(
                records.reduce((sum, r) => sum + getAQI(r), 0) /
                  records.length
              )
            : 0;

        row[period] = avg;
      });

      return row;
    });

    const insights = [];

    if (highestAQI > 150) {
      insights.push(`High AQI in ${getRoomId(highestRecord)}. Check ventilation.`);
    }

    const eveningRecords = allRecords.filter(
      (r) => Number(r.hour || 0) >= 18 && Number(r.hour || 0) <= 21
    );

    const eveningAvg =
      eveningRecords.length > 0
        ? Math.round(
            eveningRecords.reduce((sum, r) => sum + getAQI(r), 0) /
              eveningRecords.length
          )
        : 0;

    if (eveningAvg > avgAQI) {
      insights.push("Evening hours show AQI increase.");
    }

    insights.push("Improve airflow in rooms with high AQI.");
    insights.push("Filter cleaning due soon.");

    res.json({
      selectedRoom: roomId || "All",
      avgAQI,
      highestAQI,
      highestRoom: highestRecord ? getRoomId(highestRecord) : "--",
      status: getAQIStatus(avgAQI),
      trendData,
      roomComparison,
      heatmapRows,
      insights,
      totalRecords: filteredRecords.length,
    });
  } catch (error) {
    console.error("Air quality analysis error:", error);
    res.status(500).json({
      error: "Air quality analysis failed",
      details: error.message,
    });
  }
});

module.exports = router;