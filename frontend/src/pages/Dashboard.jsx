import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import TopSummaryCards from "../components/dashboard/TopSummaryCards";
import OccupancyPanel from "../components/dashboard/OccupancyPanel";
import TempHumidityPanel from "../components/dashboard/TempHumidityPanel";
import AirQualityPanel from "../components/dashboard/AirQualityPanel";
import PowerPanel from "../components/dashboard/PowerPanel";
import EnvironmentHealthPanel from "../components/dashboard/EnvironmentHealthPanel";
import SensorRiskPanel from "../components/dashboard/SensorRiskPanel";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import BottomNav from "../components/dashboard/BottomNav";

import {
  getTempStatus,
  getHumidityStatus,
  getAirStatus,
  getPowerStatus,
  calculateHealthScore,
  buildAlerts,
} from "../components/dashboard/helpers";

function Dashboard() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "sensorData"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(list);
    });

    return () => unsub();
  }, []);

  const latest = records[0] || {};

  const temperatureSeries = useMemo(
    () => [...records].reverse().map((r) => Number(r.temperature) || 0),
    [records]
  );

  const humiditySeries = useMemo(
    () => [...records].reverse().map((r) => Number(r.humidity) || 0),
    [records]
  );

  const airSeries = useMemo(
    () => [...records].reverse().map((r) => Number(r.mq135Voltage) || 0),
    [records]
  );

  const powerSeries = useMemo(
    () => [...records].reverse().map((r) => Number(r.power) || 0),
    [records]
  );

  const currentSeries = useMemo(
    () => [...records].reverse().map((r) => Number(r.current) || 0),
    [records]
  );

  const occupancyText =
    latest.pir === 1 || latest.pir === true
      ? "Occupied"
      : latest.pir === 0 || latest.pir === false
      ? "Empty"
      : "--";

  const tempStatus = getTempStatus(Number(latest.temperature));
  const humidityStatus = getHumidityStatus(Number(latest.humidity));
  const airStatus = getAirStatus(Number(latest.mq135Voltage));
  const powerStatus = getPowerStatus(Number(latest.power));

  const healthScore = calculateHealthScore({
    temperature: Number(latest.temperature),
    humidity: Number(latest.humidity),
    mq135Voltage: Number(latest.mq135Voltage),
    power: Number(latest.power),
  });

  const alerts = buildAlerts(latest);

  return (
    <div className="min-h-screen bg-[#eef1fb] text-slate-800">
      <DashboardHeader />

      <main className="mx-auto max-w-8xl px-4 py-1 lg:px-8">
        <TopSummaryCards
          latest={latest}
          occupancyText={occupancyText}
          tempStatus={tempStatus}
          humidityStatus={humidityStatus}
          airStatus={airStatus}
          powerStatus={powerStatus}
          alertsCount={alerts.length}
        />

        <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
          <OccupancyPanel
            className="xl:col-span-3"
            occupancyText={occupancyText}
            power={latest.power}
            current={latest.current}
          />

          <TempHumidityPanel
            className="xl:col-span-3"
            temperature={latest.temperature}
            humidity={latest.humidity}
            tempStatus={tempStatus}
            humidityStatus={humidityStatus}
            temperatureSeries={temperatureSeries}
            humiditySeries={humiditySeries}
          />

          <AirQualityPanel
            className="xl:col-span-3"
            airValue={latest.mq135Voltage}
            airStatus={airStatus}
            airSeries={airSeries}
          />

          <PowerPanel
            className="xl:col-span-3"
            power={latest.power}
            current={latest.current}
            powerStatus={powerStatus}
            powerSeries={powerSeries}
            currentSeries={currentSeries}
          />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
          <EnvironmentHealthPanel
            className="xl:col-span-5"
            healthScore={healthScore}
            temperature={latest.temperature}
            humidity={latest.humidity}
            mq135Voltage={latest.mq135Voltage}
            power={latest.power}
            tempStatus={tempStatus}
            humidityStatus={humidityStatus}
            airStatus={airStatus}
            powerStatus={powerStatus}
          />

          <SensorRiskPanel
            className="xl:col-span-4"
            tempStatus={tempStatus}
            humidityStatus={humidityStatus}
            airStatus={airStatus}
            powerStatus={powerStatus}
          />

          <AlertsPanel className="xl:col-span-3" alerts={alerts} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default Dashboard;