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

import { FaHome, FaThermometerHalf, FaWind, FaBolt, FaUsers, FaCog, FaBell } from "react-icons/fa";

function Dashboard() {
  const [records, setRecords] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Firestore listener
  useEffect(() => {
    const q = query(collection(db, "sensorData"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecords(list);
    });
    return () => unsub();
  }, []);

  const latest = records[0] || {};

  // Series for charts
  const temperatureSeries = useMemo(() => [...records].reverse().map((r) => Number(r.temperature) || 0), [records]);
  const humiditySeries = useMemo(() => [...records].reverse().map((r) => Number(r.humidity) || 0), [records]);
  const airSeries = useMemo(() => [...records].reverse().map((r) => Number(r.mq135Voltage) || 0), [records]);
  const powerSeries = useMemo(() => [...records].reverse().map((r) => Number(r.power) || 0), [records]);
  const currentSeries = useMemo(() => [...records].reverse().map((r) => Number(r.current) || 0), [records]);

  // Occupancy text
  const occupancyText =
    latest.pir === 1 || latest.pir === true
      ? "Occupied"
      : latest.pir === 0 || latest.pir === false
        ? "Empty"
        : "--";

  // Statuses
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

  // Sidebar items
  const navItems = [
    { icon: <FaHome />, label: "Dashboard" },
    { icon: <FaThermometerHalf />, label: "Temperature" },
    { icon: <FaWind />, label: "Air Quality" },
    { icon: <FaBolt />, label: "Power" },
    { icon: <FaUsers />, label: "Users" },
    { icon: <FaCog />, label: "Settings" },
    { icon: <FaBell />, label: "Alerts" },
  ];

  return (
    <div className="flex min-h-screen bg-[#eef1fb] text-blue-700">
      {/* Sidebar */}
      <div
        className={`bg-blue-900 text-white flex flex-col transition-all duration-300 ${sidebarOpen ? "w-[200px]" : "w-[50px]"
          }`}
      >
        <div className="flex items-center justify-between p-4">
          <span className={`font-bold text-lg ${!sidebarOpen && "hidden"}`}>
            RoomIQ
            <div className="text-xs text-blue-300 font-normal">
              Hostel Monitoring System
            </div>
          </span>
          <button
            className="text-white text-lg focus:outline-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "×" : "☰"}
          </button>
        </div>
        <nav className="flex-1 mt-4">
          {navItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 hover:bg-white/10 cursor-pointer"
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="mx-auto max-w-8xl px-4 py-1 lg:px-8">
          {/* Top Summary */}
          <TopSummaryCards
            latest={latest}
            occupancyText={occupancyText}
            tempStatus={tempStatus}
            humidityStatus={humidityStatus}
            airStatus={airStatus}
            powerStatus={powerStatus}
            alertsCount={alerts.length}
          />

          {/* First row */}
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

          {/* Second row */}
          <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <OccupancyPanel
              className="xl:col-span-3"
              occupancyText={occupancyText}
              roomId={latest.roomid}
              ldr={latest.ldr}
              pir={latest.pir}
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


        </main>

        <BottomNav />
      </div>
    </div>
  );
}

export default Dashboard;