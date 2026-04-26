const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

function getRoomId(r) {
  return r.roomId || r.roomid || "Unknown";
}

router.get("/analysis", async (req, res) => {
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
        (r) => getRoomId(r).toLowerCase() === roomId.toLowerCase()
      );
    }

    const activeRooms = new Set(
      records
        .filter((r) => r.pir === 1 || r.pir === true || r.pir === "1")
        .map((r) => getRoomId(r))
    ).size;

    const avgLight =
      records.length > 0
        ? Math.round(
            records.reduce(
              (sum, r) => sum + Number(r.light_intensity_lux || 0),
              0
            ) / records.length
          )
        : 0;

    const alerts = records.filter(
      (r) =>
        (r.pir === 0 || r.pir === false || r.pir === "0") &&
        Number(r.light_intensity_lux || 0) > 200
    );

    const heatmapMap = {};

    records.forEach((r) => {
      const room = getRoomId(r);
      const hour = Number(r.hour ?? 0);

      if (!heatmapMap[room]) heatmapMap[room] = Array(24).fill(0);

      if (r.pir === 1 || r.pir === true || r.pir === "1") {
        heatmapMap[room][hour] += 1;
      }
    });

    const heatmapData = Object.entries(heatmapMap).map(([room, hours]) => ({
      room,
      hours,
    }));

    const peak = heatmapData.map((r) => ({
      room: r.room,
      hours: r.hours.reduce((a, b) => a + b, 0),
    }));

    const scatterData = records.map((r) => ({
      occupancy: r.pir === 1 || r.pir === true || r.pir === "1" ? 1 : 0,
      light: Number(r.light_intensity_lux || 0),
      waste:
        (r.pir === 0 || r.pir === false || r.pir === "0") &&
        Number(r.light_intensity_lux || 0) > 200,
    }));

    res.json({
      activeRooms,
      avgLight,
      alertCount: alerts.length,
      alerts: alerts.slice(0, 10),
      heatmapData,
      peak,
      scatterData,
      totalRecords: records.length,
    });
  } catch (error) {
    console.error("Occupancy analysis error:", error);
    res.status(500).json({
      error: "Occupancy analysis failed",
      details: error.message,
    });
  }
});

module.exports = router;