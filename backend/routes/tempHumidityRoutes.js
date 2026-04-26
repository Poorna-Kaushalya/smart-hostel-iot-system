const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

function getRoomId(r) {
  return r.roomId || r.roomid || "Unknown";
}

function getTimestamp(r) {
  return Number(r.timestamp || r.deviceTimestamp || 0);
}

function getTemp(r) {
  return Number(r.temperature || 0);
}

function getHumidity(r) {
  return Number(r.humidity || 0);
}

function getComfortStatus(temp, humidity) {
  if (temp >= 22 && temp <= 30 && humidity >= 40 && humidity <= 70) {
    return "Comfortable";
  }

  if (temp > 34 || temp < 18 || humidity > 80 || humidity < 30) {
    return "Hot";
  }

  return "Moderate";
}

function buildRoomMap(records) {
  const roomMap = {};

  records.forEach((r) => {
    const room = getRoomId(r);
    if (!roomMap[room]) roomMap[room] = [];
    roomMap[room].push(r);
  });

  return roomMap;
}

function buildRoomComparison(records) {
  const roomMap = buildRoomMap(records);

  return Object.keys(roomMap).map((room) => {
    const list = roomMap[room];

    const avgT =
      list.reduce((sum, r) => sum + getTemp(r), 0) / (list.length || 1);

    const avgH =
      list.reduce((sum, r) => sum + getHumidity(r), 0) / (list.length || 1);

    return {
      room,
      temperature: Number(avgT.toFixed(1)),
      humidity: Number(avgH.toFixed(1)),
    };
  });
}

function buildComfortRows(records) {
  const roomMap = buildRoomMap(records);

  return Object.keys(roomMap).map((room) => {
    const list = roomMap[room];

    const morning = list.filter(
      (r) => Number(r.hour) >= 6 && Number(r.hour) < 12
    );

    const noon = list.filter(
      (r) => Number(r.hour) >= 12 && Number(r.hour) < 15
    );

    const afternoon = list.filter(
      (r) => Number(r.hour) >= 15 && Number(r.hour) < 18
    );

    const evening = list.filter(
      (r) => Number(r.hour) >= 18 || Number(r.hour) < 6
    );

    function avgStatus(arr) {
      if (!arr.length) return "Comfortable";

      const t = arr.reduce((s, r) => s + getTemp(r), 0) / arr.length;
      const h = arr.reduce((s, r) => s + getHumidity(r), 0) / arr.length;

      return getComfortStatus(t, h);
    }

    return {
      room,
      Morning: avgStatus(morning),
      Noon: avgStatus(noon),
      Afternoon: avgStatus(afternoon),
      Evening: avgStatus(evening),
    };
  });
}

function buildAlerts(records) {
  const alerts = [];

  records.forEach((r) => {
    const room = getRoomId(r);
    const temp = getTemp(r);
    const humidity = getHumidity(r);

    if (temp > 31) {
      alerts.push({
        type: "danger",
        message: `${room} overheating at ${temp.toFixed(1)}°C`,
      });
    }

    if (humidity > 75) {
      alerts.push({
        type: "warning",
        message: `${room} has high humidity at ${humidity.toFixed(1)}%`,
      });
    }
  });

  return alerts.slice(0, 5);
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

    // Top cards + main trend chart use filtered data
    const topRecords = filteredRecords;

    // Bottom charts always use all room data
    const chartRecords = allRecords;

    const avgTemp =
      topRecords.length > 0
        ? topRecords.reduce((sum, r) => sum + getTemp(r), 0) /
          topRecords.length
        : 0;

    const avgHumidity =
      topRecords.length > 0
        ? topRecords.reduce((sum, r) => sum + getHumidity(r), 0) /
          topRecords.length
        : 0;

    const trendData = topRecords.map((r) => ({
      time: `${r.hour ?? ""}:00`,
      temperature: getTemp(r),
      humidity: getHumidity(r),
    }));

    const maxTemp =
      topRecords.length > 0 ? Math.max(...topRecords.map(getTemp)) : 0;

    const peak = topRecords.find((r) => getTemp(r) === maxTemp);

    res.json({
      selectedRoom: roomId || "All",

      // filtered values
      avgTemp: Number(avgTemp.toFixed(1)),
      avgHumidity: Math.round(avgHumidity),
      comfortLevel: getComfortStatus(avgTemp, avgHumidity),
      peakHeatPeriod: peak ? `${peak.hour ?? "--"}:00` : "--",
      trendData,
      totalRecords: topRecords.length,

      // always all rooms
      roomComparison: buildRoomComparison(chartRecords),
      comfortRows: buildComfortRows(chartRecords),
      alerts: buildAlerts(chartRecords),
    });
  } catch (error) {
    console.error("Temp humidity analysis error:", error);

    res.status(500).json({
      error: "Temp humidity analysis failed",
      details: error.message,
    });
  }
});

module.exports = router;