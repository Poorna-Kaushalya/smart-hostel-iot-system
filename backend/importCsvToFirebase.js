const fs = require("fs");
const csv = require("csv-parser");
const { db, admin } = require("./firebase");

const filePath = "./data/smart_hostel_iot_ml_dataset_cleaned.csv";

async function importCsvToFirebase() {
  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", async () => {
      console.log(`Found ${rows.length} rows`);

      for (const row of rows) {
        await db.collection("sensorData").add({
          adapterConnected: Number(row.adapterConnected),
          createdAt: row.createdAt,
          roomId: row.roomId,

          temperature: Number(row.temperature),
          humidity: Number(row.humidity),
          mq135Voltage: Number(row.mq135Voltage),
          air_quality_ppm: Number(row.air_quality_ppm),
          dust_density_ug_m3: Number(row.dust_density_ug_m3),
          light_intensity_lux: Number(row.light_intensity_lux),

          pir: Number(row.pir),
          occupancy: row.occupancy,
          ldr: Number(row.ldr),
          current: Number(row.current),
          power: Number(row.power),
          energy_kWh: Number(row.energy_kWh),

          deviceTimestamp: row.deviceTimestamp,
          timestamp: row.timestamp,
          hour: Number(row.hour),
          dayOfWeek: Number(row.dayOfWeek),

          health_score: Number(row.health_score),
          environmental_health: row.environmental_health,
          energy_waste: Number(row.energy_waste),
          anomaly_type: row.anomaly_type,

          importedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      console.log("CSV data imported successfully!");
      process.exit();
    });
}

importCsvToFirebase();