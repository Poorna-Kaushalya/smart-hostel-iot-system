import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Settings,
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

function scaleDust(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n < 1 ? n * 1000 : n;
}

function formatDust(value, decimals = 1) {
  const dust = scaleDust(value);
  return dust > 0 ? dust.toFixed(decimals) : "--";
}

function getStatus(value) {
  const dust = scaleDust(value);

  if (dust <= 50) return "Good";
  if (dust <= 100) return "Moderate";
  return "Unhealthy";
}

function heatColor(value) {
  const dust = scaleDust(value);

  if (dust === 0) return "#f1f5f9";
  if (dust <= 50) return "#bbf7d0";
  if (dust <= 100) return "#fde68a";
  return "#fecaca";
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export default function DustLevelAnalysis() {
  const navigate = useNavigate();

  const [searchRoom, setSearchRoom] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(3);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    latestDust: 0,
    avgDust: 0,
    trendData: [],
    roomDust: [],
    distributionData: [],
    heatRows: [],
    totalRecords: 0,
    selectedRoom: "All Rooms",
    selectedDate: "All Dates",
  });

  useEffect(() => {
    const fetchDustData = async () => {
      try {
        setLoading(true);

        const params = {};

        if (searchRoom.trim()) {
          params.roomId = searchRoom.trim();
        }

        if (selectedDate) {
          params.date = selectedDate;
        }

        const res = await axios.get("http://localhost:5000/api/dust/analysis", {
          params,
        });

        setData(res.data);
      } catch (error) {
        console.error("Dust data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDustData();
  }, [searchRoom, selectedDate]);

  const trendDataScaled = useMemo(() => {
    return data.trendData.map((item) => ({
      ...item,
      dust: scaleDust(item.dust),
    }));
  }, [data.trendData]);

  const roomDustScaled = useMemo(() => {
    return data.roomDust.map((item) => ({
      ...item,
      value: scaleDust(item.value),
    }));
  }, [data.roomDust]);

  const distributionDataScaled = useMemo(() => {
    return data.distributionData.map((item) => ({
      ...item,
      value: Number(item.value) || 0,
    }));
  }, [data.distributionData]);

  const heatRowsScaled = useMemo(() => {
    return data.heatRows.map((row) => {
      const newRow = { ...row };

      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
        newRow[day] = scaleDust(row[day]);
      });

      return newRow;
    });
  }, [data.heatRows]);

  const daysInMonth = useMemo(() => {
    return new Date(calendarYear, calendarMonth, 0).getDate();
  }, [calendarYear, calendarMonth]);

  const monthLabel = new Date(calendarYear, calendarMonth - 1).toLocaleString(
    "default",
    {
      month: "long",
      year: "numeric",
    }
  );

  const status = getStatus(data.latestDust);

  const clearFilters = () => {
    setSearchRoom("");
    setSelectedDate("");
  };

  const changeMonth = (direction) => {
    let newMonth = calendarMonth + direction;
    let newYear = calendarYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-[#eef1fb] font-sans text-slate-900">
      <header className="flex h-[50px] items-center justify-between bg-[#3f73bd] px-6 py-2 text-white">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">Smart Hostel Monitoring System</h2>
        </div>

        <div className="flex items-center gap-5">
          <Bell size={22} />
          <img
            className="h-8 w-8 rounded-full object-cover"
            src="https://i.pravatar.cc/80?img=47"
            alt="profile"
          />
          <Settings size={22} />
        </div>
      </header>

      <section className="flex h-[50px] items-center justify-between bg-white px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-xl font-bold text-[#3f73bd]">
            Dust Level Analysis
          </h1>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <strong>Room - {searchRoom || "All Rooms"}</strong>
          <span>|</span>
          <strong className="text-blue-600">
            Date - {selectedDate || "All Dates"}
          </strong>
        </div>
      </section>

      <main className="grid grid-cols-1 gap-5 px-7 py-5 lg:grid-cols-[300px_1fr_300px]">
        <section className="flex flex-col gap-3">
          <div className="flex h-10 items-center gap-3 rounded-full bg-[#ece5f2] px-4">
            <Menu size={18} />

            <input
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              placeholder="Search Room No"
              className="flex-1 bg-transparent text-sm outline-none"
            />

            <Search size={18} />
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);

              if (e.target.value) {
                const [y, m] = e.target.value.split("-").map(Number);
                setCalendarYear(y);
                setCalendarMonth(m);
              }
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
          />

          <button
            onClick={clearFilters}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Clear Filters
          </button>

          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#e7d9d0] bg-[#fff1df]">
            <div className="p-3">
              <p className="text-[10px] text-slate-600">Selected Room:</p>

              <h3 className="text-xl font-bold text-[#b57a22]">
                {searchRoom || "All"}
              </h3>
            </div>

            <div className="bg-[#eef0ff] p-3">
              <p className="text-[10px] text-slate-600">Dust Level</p>

              <h3 className="text-xl font-bold text-[#cf3c43]">
                {formatDust(data.latestDust)} µg/m³
              </h3>
            </div>
          </div>

          <div className="flex h-[104px] items-center gap-5 rounded-lg bg-gradient-to-r from-[#fff5de] to-white p-5">
            <div className="text-5xl text-amber-500">☁</div>

            <div>
              <p className="font-semibold text-[#9b5f24]">
                Average Dust Level
              </p>

              <h2 className="text-4xl font-bold text-[#a55313]">
                {formatDust(data.avgDust || data.latestDust)}{" "}
                <span className="text-xl font-normal">µg/m³</span>
              </h2>
            </div>
          </div>

        </section>

        <section className="rounded bg-white p-3">
          <h3 className="mb-3 text-lg font-bold">
            Dust Concentration Trend Over Time
          </h3>

          <div className="bg-[#f1f7ff] p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-[#1f4e79]"></h3>
              <button className="rounded border border-[#d5e2f4] bg-white px-2 py-1 text-xs text-[#4d77a3]">
                Filtered Data
              </button>
            </div>

            {loading ? (
              <div className="flex h-[230px] items-center justify-center text-slate-500">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="90%" height={230}>
                <LineChart data={trendDataScaled}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 150]} />
                  <Tooltip formatter={(value) => [`${value} µg/m³`, "Dust"]} />

                  <Line
                    type="monotone"
                    dataKey="dust"
                    stroke="#1684df"
                    strokeWidth={4}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <aside className="rounded-xl bg-white p-4">
          <p className="text-center font-bold text-[#2d3e69] text-xl mb-2">
            Calendar
          </p>

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

          <div className="mt-3 grid grid-cols-7 gap-3 text-center text-[10px] font-bold text-slate-400">
            {weekDays.map((d) => (
              <span key={d}>{d.toUpperCase()}</span>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-3 text-center">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const dateValue = formatDate(calendarYear, calendarMonth, d);
              const isSelected = selectedDate === dateValue;

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(dateValue)}
                  className={
                    isSelected
                      ? "rounded-full bg-sky-100 p-1 font-bold text-sky-600"
                      : "rounded-full p-1 hover:bg-slate-100"
                  }
                >
                  {d}
                </button>
              );
            })}
          </div>
        </aside>
      </main>

      <section className="grid grid-cols-1 gap-4 px-7 pb-5 lg:grid-cols-[1fr_1.25fr_1.25fr]">
        <div className="rounded-lg border border-slate-300 bg-[#f8f9ff] p-4">
          <h3 className="mb-3 font-bold text-[#2d3e69]">
            Dust Levels by Room
          </h3>

          {roomDustScaled.map((item) => (
            <div
              className="my-3 grid grid-cols-[80px_1fr_40px] items-center gap-2 text-sm"
              key={item.room}
            >
              <span>{item.room}</span>

              <div className="h-3 bg-blue-100">
                <div
                  className="h-3 bg-[#4f84d8]"
                  style={{ width: `${Math.min(item.value, 100)}%` }}
                />
              </div>

              <strong>{item.value.toFixed(0)}</strong>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-300 bg-[#f8f9ff] p-4">
          <h3 className="mb-3 font-bold text-[#2d3e69]">
            Dust Level Distribution
          </h3>

          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={distributionDataScaled}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {distributionDataScaled.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.level === "Good"
                        ? "#22c55e"
                        : entry.level === "Moderate"
                        ? "#fbbf24"
                        : "#ef4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-300 bg-[#f8f9ff] p-4">
          <h3 className="mb-3 font-bold text-[#2d3e69]">
            Dust Distribution by Day
          </h3>

          <table className="w-full border-collapse text-center text-[11px]">
            <thead>
              <tr>
                <th className="border p-1">ROOM</th>
                {weekDays.map((day) => (
                  <th className="border p-1" key={day}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {heatRowsScaled.length > 0 ? (
                heatRowsScaled.map((row) => (
                  <tr key={row.room}>
                    <td className="border p-1 font-semibold">{row.room}</td>

                    {weekDays.map((day) => (
                      <td
                        key={day}
                        className="border p-1"
                        style={{ background: heatColor(row[day]) }}
                      >
                        {row[day] ? row[day].toFixed(1) : 0}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border p-3 text-slate-400" colSpan={8}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-3 flex justify-center gap-3 text-xs text-slate-600">
            <span className="inline-block h-3 w-3 bg-green-200" /> Good
            <span className="inline-block h-3 w-3 bg-yellow-200" /> Moderate
            <span className="inline-block h-3 w-3 bg-red-200" /> Unhealthy
          </div>
        </div>
      </section>

      <footer className="bg-[#3f73bd] px-8 py-4 text-right font-semibold text-white">
        Smart Hostel Monitoring System
      </footer>
    </div>
  );
}