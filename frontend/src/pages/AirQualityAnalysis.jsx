import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Settings,
  Wind,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Clock,
  Filter,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

function aqiColor(value) {
  if (value <= 100) return "#22c55e";
  if (value <= 150) return "#facc15";
  if (value <= 200) return "#fb923c";
  return "#ef4444";
}

function heatColor(value) {
  if (!value) return "#f1f5f9";
  if (value <= 100) return "#86efac";
  if (value <= 150) return "#fde047";
  if (value <= 200) return "#fb923c";
  return "#ef4444";
}

export default function AirQualityAnalysis() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [now, setNow] = useState(new Date());
  const [calendarYear, setCalendarYear] = useState(2025);
  const [calendarMonth, setCalendarMonth] = useState(4);

  const [data, setData] = useState({
    avgAQI: 0,
    highestAQI: 0,
    highestRoom: "--",
    status: "--",
    trendData: [],
    roomComparison: [],
    heatmapRows: [],
    insights: [],
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/air-quality/analysis", {
        params: searchRoom ? { roomId: searchRoom } : {},
      })
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [searchRoom]);

  const daysInMonth = useMemo(() => {
    return new Date(calendarYear, calendarMonth, 0).getDate();
  }, [calendarYear, calendarMonth]);

  const monthLabel = new Date(calendarYear, calendarMonth - 1).toLocaleString(
    "default",
    { month: "long", year: "numeric" }
  );

  const changeMonth = (direction) => {
    let m = calendarMonth + direction;
    let y = calendarYear;

    if (m < 1) {
      m = 12;
      y -= 1;
    }

    if (m > 12) {
      m = 1;
      y += 1;
    }

    setCalendarMonth(m);
    setCalendarYear(y);
  };

  const periods = ["Morning", "Afternoon", "Evening", "Night"];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="flex h-[60px] items-center justify-between bg-[#3f73bd] px-6 text-white">
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

      <section className="flex h-[48px] items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-black hover:bg-slate-100"
          >
            <ArrowLeft size={15} />
          </button>

          <h1 className="text-xl font-bold text-[#3f73bd]">
            Air Quality Analysis
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-8 w-[280px] items-center gap-3 rounded-full bg-[#eee7f1] px-4">
            <Menu size={16} />

            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearchRoom(searchInput.trim());
              }}
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

      <section className="flex justify-end gap-5 px-6 pb-3 text-sm">
        <strong>Selected Room - {searchRoom || "All"}</strong>
        <span className="text-slate-300">|</span>
        <strong className="text-blue-700">Last 24 Hours</strong>
      </section>

      <main className="grid grid-cols-1 gap-4 px-8  lg:grid-cols-[1fr_320px]">
        <section className="grid grid-cols-1 gap-1 rounded bg-[#3f73bd] p-1 lg:grid-cols-2">
          <div className="rounded bg-white p-4">
            <h3 className="text-center font-bold text-[#2d3e69]">
              Air Quality Trend Over Time
            </h3>

            <ResponsiveContainer width="95%" height={220}>
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`${value} PPM`, "AQI"]} />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded bg-white p-4">
            <h3 className="text-center font-bold text-[#2d3e69]">
              Air Quality Comparison by Room
            </h3>

            <ResponsiveContainer width="95%" height={220}>
              <BarChart data={data.roomComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="room" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
                  {data.roomComparison.map((entry, index) => (
                    <Cell key={index} fill={aqiColor(entry.aqi)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded bg-white p-4">
            <h3 className="text-center font-bold text-[#2d3e69]">
              Current Air Quality
            </h3>

            <div className="mx-auto mt-6 flex h-60 w-60 items-center justify-center rounded-full border-[25px] border-yellow-400 bg-slate-50 shadow-inner">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-slate-700">
                  {data.avgAQI}
                </h2>
                <p className="mt-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold">
                  {data.status}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded bg-white p-4">
            <h3 className="text-center font-bold text-[#2d3e69]">
              Air Quality Heatmap
            </h3>

            <table className="mt-4 w-full border-collapse text-center text-xs">
              <thead>
                <tr>
                  <th className="border p-2">Rooms</th>
                  {periods.map((p) => (
                    <th className="border p-2" key={p}>
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.heatmapRows.map((row) => (
                  <tr key={row.room}>
                    <td className="border p-2">{row.room}</td>
                    {periods.map((p) => (
                      <td
                        key={p}
                        className="border p-2 font-semibold"
                        style={{ background: heatColor(row[p]) }}
                      >
                        {row[p] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 flex justify-center gap-3 text-xs">
              <span className="inline-block h-3 w-3 bg-green-300" /> Good
              <span className="inline-block h-3 w-3 bg-yellow-300" /> Moderate
              <span className="inline-block h-3 w-3 bg-orange-400" /> Poor
              <span className="inline-block h-3 w-3 bg-red-400" /> Hazardous
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <strong>{monthLabel}</strong>
              <div className="flex gap-3 text-sky-500">
                <button onClick={() => changeMonth(-1)}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => changeMonth(1)}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <span
                  key={d}
                  className={
                    d === now.getDate()
                      ? "rounded-full bg-sky-100 p-1 font-bold text-sky-600"
                      : "p-1"
                  }
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded bg-emerald-50 p-3 text-center shadow">
              <Wind className="mx-auto text-emerald-500" />
              <p className="text-sm font-bold">Avg. AQI</p>
              <h2 className="text-3xl font-bold text-emerald-600">
                {data.avgAQI}
              </h2>
              <p className="rounded-full bg-emerald-200 px-2 py-1 text-sm font-bold">
                {data.status}
              </p>
            </div>

            <div className="rounded bg-red-50 p-3 text-center shadow">
              <TrendingDown className="mx-auto text-red-500" />
              <p className="text-sm font-bold">Highest AQI</p>
              <h2 className="text-3xl font-bold text-red-600">
                {data.highestAQI}
              </h2>
              <p className="rounded-full bg-red-200 px-2 py-1 text-sm font-bold">
                {data.highestRoom}
              </p>
            </div>
          </div>

          <div className="rounded bg-[#fff7ed] p-3 shadow">
            <h3 className="mb-3 flex items-center gap-2 font-bold">
              <Lightbulb className="text-orange-400" />
              Insights & Recommendations
            </h3>

            <div className="space-y-2">
              {data.insights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded bg-white p-2 text-sm shadow-sm"
                >
                  {index === 0 ? (
                    <AlertTriangle className="text-red-500" size={18} />
                  ) : index === 1 ? (
                    <Clock className="text-red-400" size={18} />
                  ) : (
                    <Filter className="text-sky-500" size={18} />
                  )}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className="mt-5 bg-[#3f73bd] px-8 py-4 text-right font-semibold text-white">
        Smart Hostel Monitoring System
      </footer>
    </div>
  );
}