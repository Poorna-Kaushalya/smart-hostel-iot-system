import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import TopSummaryCards from "../components/dashboard/TopSummaryCards";
import OccupancyPanel from "../components/dashboard/OccupancyPanel";
import TempHumidityPanel from "../components/dashboard/TempHumidityPanel";
import AirQualityPanel from "../components/dashboard/AirQualityPanel";
import DustLevelPanel from "../components/dashboard/DustLevelPanel";
import EnvironmentHealthPanel from "../components/dashboard/EnvironmentHealthPanel";
import SensorRiskPanel from "../components/dashboard/SensorRiskPanel";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import BottomNav from "../components/dashboard/BottomNav";
import Chatbot from "../components/dashboard/Chatbot";

import {
  getTempStatus,
  getHumidityStatus,
  getAirStatus,
  getPowerStatus,
  buildAlerts,
} from "../components/dashboard/helpers";

import {
  FaHome,
  FaThermometerHalf,
  FaWind,
  FaBolt,
  FaUsers,
  FaCog,
  FaBell,
  FaSmog,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [records, setRecords] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mlHealth, setMlHealth] = useState(null);
  const [searchRoom, setSearchRoom] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "sensorData"),
      orderBy("createdAt", "desc"),
      limit(100)
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

  const filteredRecords = useMemo(() => {
    const keyword = searchRoom.trim().toLowerCase();

    if (!keyword) return records;

    return records.filter((r) =>
      String(r.roomId || r.roomid || "")
        .toLowerCase()
        .includes(keyword)
    );
  }, [records, searchRoom]);

  const latest = filteredRecords[0] || {};

  useEffect(() => {
    const getMLHealth = async () => {
      if (!latest.temperature) {
        setMlHealth(null);
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:5000/api/ml/predict-health",
          {
            temperature: Number(latest.temperature),
            humidity: Number(latest.humidity),
            air_quality_ppm: Number(latest.air_quality_ppm),
            dust_density_ug_m3: Number(latest.dust_density_ug_m3),
            light_intensity_lux: Number(latest.light_intensity_lux),
            hour: Number(latest.hour) || new Date().getHours(),
          }
        );

        setMlHealth(res.data);
      } catch (error) {
        console.error("ML health prediction failed:", error);
        setMlHealth(null);
      }
    };

    getMLHealth();
  }, [latest]);

  const temperatureSeries = useMemo(
    () => [...filteredRecords].reverse().map((r) => Number(r.temperature) || 0),
    [filteredRecords]
  );

  const humiditySeries = useMemo(
    () => [...filteredRecords].reverse().map((r) => Number(r.humidity) || 0),
    [filteredRecords]
  );

  const airSeries = useMemo(
    () =>
      [...filteredRecords]
        .reverse()
        .map((r) => Number(r.air_quality_ppm) || 0),
    [filteredRecords]
  );

  const powerSeries = useMemo(
    () => [...filteredRecords].reverse().map((r) => Number(r.power) || 0),
    [filteredRecords]
  );

  const currentSeries = useMemo(
    () => [...filteredRecords].reverse().map((r) => Number(r.current) || 0),
    [filteredRecords]
  );

  const occupancyText =
    latest.pir === 1 || latest.pir === true
      ? "Occupied"
      : latest.pir === 0 || latest.pir === false
      ? "Empty"
      : "--";

  const tempStatus = getTempStatus(Number(latest.temperature));
  const humidityStatus = getHumidityStatus(Number(latest.humidity));
  const airStatus = getAirStatus(Number(latest.air_quality_ppm));
  const powerStatus = getPowerStatus(Number(latest.power));

  const alerts = buildAlerts(latest);

  const navItems = [
    { icon: <FaHome />, label: "Dashboard", path: "/" },
    { icon: <FaThermometerHalf />, label: "Temperature", path: "/temperature-humidity" },
    { icon: <FaWind />, label: "Air Quality", path: "/air-quality" },
    { icon: <FaSmog />, label: "Dust Level", path: "/dust" },
    { icon: <FaBolt />, label: "Occupancy", path: "/occupancy" },
    { icon: <FaUsers />, label: "Users" },
    { icon: <FaCog />, label: "Settings" },
    { icon: <FaBell />, label: "Alerts" },
  ];

  return (
    <div className="flex min-h-screen bg-[#eef1fb] text-blue-700">
      <div
        className={`bg-blue-900 text-white flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-[200px]" : "w-[60px]"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <span className={`${!sidebarOpen && "hidden"}`}>
            <div className="font-bold text-lg">RoomIQ</div>
            <div className="text-xs text-blue-300">
              Hostel Monitoring System
            </div>
          </span>

          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "×" : "☰"}
          </button>
        </div>

        <nav className="flex-1 mt-4">
          {navItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center gap-3 p-4 cursor-pointer ${
                item.path && location.pathname === item.path
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <DashboardHeader
          searchRoom={searchRoom}
          setSearchRoom={setSearchRoom}
        />

        <main className="mx-auto max-w-8xl px-4 py-2 lg:px-8">
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
            <EnvironmentHealthPanel
              className="xl:col-span-5"
              healthScore={mlHealth?.health_score}
              environmentalHealth={mlHealth?.environmental_health}
              temperature={latest.temperature}
              humidity={latest.humidity}
              mq135Voltage={latest.mq135Voltage}
              airQualityPpm={latest.air_quality_ppm}
              power={latest.power}
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

          <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <OccupancyPanel
              className="xl:col-span-3"
              occupancyText={occupancyText}
              roomId={latest.roomId || latest.roomid}
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
              airQualityPpm={latest.air_quality_ppm}
              airStatus={airStatus}
              airSeries={airSeries}
            />

            <DustLevelPanel
              className="xl:col-span-3"
              dust={latest.dust_density_ug_m3}
              records={filteredRecords}
            />
          </div>
        </main>

        <BottomNav />
      </div>

      <Chatbot latestData={latest} allRoomsData={filteredRecords} />
    </div>
  );
}

export default Dashboard;