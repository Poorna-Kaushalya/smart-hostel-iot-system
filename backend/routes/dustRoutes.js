const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

function getRoomId(record) {
  return record.roomId || record.roomid || "Unknown";
}

function getTimestamp(record) {
  return Number(record.timestamp || record.deviceTimestamp || 0);
}

function getDust(record) {
  return Number(record.dust_density_ug_m3 || 0);
}

function getDay(record) {
  if (record.dayOfWeek) return record.dayOfWeek;

  if (record.createdAt) {
    return new Date(record.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
    });
  }

  return "Unknown";
}

function buildRoomDust(records) {
  const latestRoomMap = {};

  records.forEach((r) => {
    const rid = getRoomId(r);

    if (
      !latestRoomMap[rid] ||
      getTimestamp(r) > getTimestamp(latestRoomMap[rid])
    ) {
      latestRoomMap[rid] = r;
    }
  });

  return Object.values(latestRoomMap)
    .map((r) => ({
      room: getRoomId(r),
      value: getDust(r),
    }))
    .sort((a, b) => b.value - a.value);
}

function buildDistribution(records) {
  const counts = { Good: 0, Moderate: 0, Unhealthy: 0 };

  records.forEach((r) => {
    const dust = getDust(r);

    if (dust <= 50) counts.Good += 1;
    else if (dust <= 100) counts.Moderate += 1;
    else counts.Unhealthy += 1;
  });

  return [
    { level: "Good", value: counts.Good },
    { level: "Moderate", value: counts.Moderate },
    { level: "Unhealthy", value: counts.Unhealthy },
  ];
}

function buildDayHeatRows(records) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const roomDayMap = {};

  records.forEach((r) => {
    const rid = getRoomId(r);
    const day = getDay(r);
    const dust = getDust(r);

    if (!roomDayMap[rid]) roomDayMap[rid] = {};
    if (!roomDayMap[rid][day]) {
      roomDayMap[rid][day] = { total: 0, count: 0 };
    }

    roomDayMap[rid][day].total += dust;
    roomDayMap[rid][day].count += 1;
  });

  return Object.keys(roomDayMap)
    .sort()
    .map((room) => {
      const row = { room };

      days.forEach((day, index) => {
        const dayData = roomDayMap[room][day];

        row[shortDays[index]] = dayData
          ? Math.round(dayData.total / dayData.count)
          : 0;
      });

      return row;
    });
}

router.get("/analysis", async (req, res) => {
  try {
    const roomId = req.query.roomId || "";
    const date = req.query.date || "";

    let snapshot;

    if (date) {
      const start = `${date} 00:00:00`;
      const end = `${date} 23:59:59`;

      snapshot = await db
        .collection("sensorData")
        .where("createdAt", ">=", start)
        .where("createdAt", "<=", end)
        .orderBy("createdAt", "asc")
        .get();
    } else {
      snapshot = await db
        .collection("sensorData")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
    }

    const allRecords = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => getTimestamp(a) - getTimestamp(b));

    let filteredRecords = [...allRecords];

    if (roomId) {
      filteredRecords = filteredRecords.filter(
        (r) => getRoomId(r).toLowerCase() === roomId.toLowerCase()
      );
    }

    const latest = filteredRecords[filteredRecords.length - 1] || null;
    const latestDust = latest ? getDust(latest) : 0;

    const avgDust =
      filteredRecords.length > 0
        ? Math.round(
            filteredRecords.reduce((sum, r) => sum + getDust(r), 0) /
              filteredRecords.length
          )
        : 0;

    const trendData = filteredRecords.map((r) => ({
      time: `${r.hour ?? ""}:00`,
      dust: getDust(r),
    }));

    res.json({
      latest,
      latestDust,
      avgDust,
      trendData,

      // filtered card/chart counts
      totalRecords: filteredRecords.length,
      selectedRoom: roomId || "All Rooms",
      selectedDate: date || "All Dates",

      //  always all rooms, not room-filtered
      roomDust: buildRoomDust(allRecords),
      distributionData: buildDistribution(allRecords),
      heatRows: buildDayHeatRows(allRecords),
    });
  } catch (error) {
    console.error("Dust analysis error:", error);

    res.status(500).json({
      error: "Dust analysis failed",
      details: error.message,
    });
  }
});

module.exports = router;