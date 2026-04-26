import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  Droplets,
  Menu,
  Search,
  Settings,
  Sun,
  Thermometer,
  Waves,
  AlertTriangle,
  Fan,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function comfortColor(status) {
  if (status === "Comfortable") return "bg-sky-400";
  if (status === "Moderate") return "bg-amber-300";
  return "bg-red-400";
}

export default function TemperatureHumidityAnalysis() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [now, setNow] = useState(new Date());
  const [data, setData] = useState({
    avgTemp: 0,
    avgHumidity: 0,
    comfortLevel: "--",
    peakHeatPeriod: "--",
    trendData: [],
    roomComparison: [],
    comfortRows: [],
    alerts: [],
    selectedRoom: "All",
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/temp-humidity/analysis", {
        params: searchRoom ? { roomId: searchRoom } : {},
      })
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [searchRoom]);

  const humidityBars = useMemo(() => {
    return data.roomComparison.map((r) => ({
      room: r.room,
      humidity: r.humidity,
      temperature: r.temperature,
    }));
  }, [data.roomComparison]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="flex h-[48px] items-center justify-between bg-[#3f73bd] px-6 text-white">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">Smart Hostel Monitoring System</h2>
        </div>

        <div className="flex items-center gap-5">
          <Bell size={22} />
          <img
            className="h-10 w-10 rounded-full object-cover"
            src="https://i.pravatar.cc/80?img=47"
            alt="profile"
          />
          <Settings size={22} />
        </div>
      </header>

      <section className="flex h-[62px] items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-black hover:bg-slate-100"
          >
            <ArrowLeft size={15} />
          </button>

          <h1 className="text-xl font-bold text-[#3f73bd]">
            Temperature & Humidity Analysis
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-11 w-[280px] items-center gap-3 rounded-full bg-[#eee7f1] px-4">
            <Menu size={16} />

            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Room No"
              className="flex-1 bg-transparent text-xs outline-none"
            />

            <button onClick={() => setSearchRoom(searchInput.trim())}>
              <Search size={16} />
            </button>
          </div>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs">
            {formatDate(now)}
          </span>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs">
            {formatTime(now)}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 px-6 sm:grid-cols-2 lg:grid-cols-[150px_150px_150px_180px_1fr]">
        <div className="rounded-lg bg-[#e6ecfa] p-3 shadow-md relative left-10">
          <div className="flex items-center gap-3">
            <Thermometer className="text-blue-500" />
            <div>
              <p className="text-xs font-bold text-[#284273]">Average</p>
              <h3 className="text-lg font-bold text-[#173b7a]">
                {data.avgTemp}°C
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#e6ecfa] p-3 shadow-md relative left-10">
          <div className="flex items-center gap-3">
            <Droplets className="text-blue-500" />
            <div>
              <p className="text-xs font-bold text-[#284273]">Average</p>
              <h3 className="text-lg font-bold text-[#173b7a]">
                {data.avgHumidity}%
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#dcf6f4] p-3 shadow-md relative left-10">
          <div className="flex items-center gap-3">
            <Waves className="text-teal-500" />
            <div>
              <p className="text-xs font-bold text-[#284273]">Comfort Level</p>
              <h3 className="text-[11px] font-semibold text-[#173b7a]">
                {data.comfortLevel}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#dcf6f4] p-3 shadow-md relative left-10">
          <div className="flex items-center gap-3">
            <Sun className="text-amber-400" />
            <div>
              <p className="text-xs font-bold text-[#284273]">
                Peak Heat Period
              </p>
              <h3 className="text-sm font-bold text-[#173b7a]">
                {data.peakHeatPeriod}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-5 text-sm">
          <strong>Selected Room - {searchRoom || "All"}</strong>
          <span className="text-slate-300">|</span>
          <strong className="text-blue-700">Last 24 Hours</strong>
        </div>
      </section>

      <main className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg bg-[#f8f7ff] p-4 shadow">
          <div className="mb-2 flex justify-between">
            <h2 className="font-bold text-[#2d3e69]">
              Temperature & Humidity Trend
            </h2>
            <button className="rounded border bg-white px-3 py-1 text-xs text-[#3f73bd]">
              Last 24 Hours
            </button>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                fill="#bfdbfe"
                strokeWidth={3}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#67c3e7"
                strokeWidth={3}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="rounded-lg border bg-white p-3 shadow">
          <h3 className="mb-4 font-bold">Current Insights</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3 shadow">
              <div className="flex items-center gap-3">
                <Fan className="text-orange-400" />
                <strong className="text-sm">Ventilation | Moderate</strong>
              </div>
              <span className="text-sm font-bold">{data.avgTemp}°C</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 shadow">
              <div className="flex items-center gap-3">
                <Droplets className="text-blue-500" />
                <strong className="text-sm">Humidity Stability</strong>
              </div>
              <span className="text-sm font-bold text-blue-600">Stable</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3 shadow">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-400" />
                <strong className="text-sm">Action Priority</strong>
              </div>
              <span className="text-sm font-bold">Check Now</span>
            </div>
          </div>
        </section>
      </main>

      <section className="grid grid-cols-1 gap-4 px-6 pb-6 lg:grid-cols-[1fr_1fr_320px]">
        <div className="rounded-lg bg-[#f8f7ff] p-4 shadow">
          <h3 className="mb-3 font-bold text-[#2d3e69]">
            Comfort Heatmap by Room
          </h3>

          <table className="w-full text-center text-xs">
            <thead>
              <tr>
                <th></th>
                {["Morning", "Noon", "Afternoon", "Evening"].map((t) => (
                  <th key={t} className="p-2">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.comfortRows.map((row) => (
                <tr key={row.room}>
                  <td className="p-2 text-left">{row.room}</td>

                  {["Morning", "Noon", "Afternoon", "Evening"].map((period) => (
                    <td
                      key={period}
                      className={`${comfortColor(
                        row[period]
                      )} p-2 text-[10px]`}
                    >
                      {row[period]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex justify-center gap-4 text-xs">
            <span className="inline-block h-3 w-3 bg-sky-400" /> Comfortable
            <span className="inline-block h-3 w-3 bg-amber-300" /> Moderate
            <span className="inline-block h-3 w-3 bg-red-400" /> Hot
          </div>
        </div>

        <div className="rounded-lg bg-[#f8f7ff] p-4 shadow">
          <h3 className="mb-3 font-bold text-[#2d3e69]">
            Humidity Distribution
          </h3>

          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={humidityBars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="room" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="humidity" fill="#60a5fa">
                {humidityBars.map((entry, index) => (
                  <Cell key={index} fill="#60a5fa" />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#38bdf8"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <p className="mt-2 text-center text-xs text-slate-500">
            Room Temperature Comparison
          </p>
        </div>

        <div className="rounded-lg border bg-white p-3 shadow">
          <h3 className="mb-3 font-bold">Alerts & Recommendations</h3>

          <div className="space-y-3">
            {data.alerts.length > 0 ? (
              data.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 text-sm shadow ${
                    alert.type === "danger"
                      ? "bg-red-50"
                      : alert.type === "warning"
                      ? "bg-orange-50"
                      : "bg-emerald-50"
                  }`}
                >
                  <span className="mr-2">⚠</span>
                  {alert.message}
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-emerald-50 p-3 text-sm shadow">
                 Humidity and temperature are stable
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-[#3f73bd] px-8 py-4 text-right font-semibold text-white">
        Smart Hostel Monitoring System
      </footer>
    </div>
  );
}