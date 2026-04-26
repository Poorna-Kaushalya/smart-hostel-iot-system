import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Bell,
  Lightbulb,
  Menu,
  Search,
  Settings,
  UserRound,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function heatColor(value) {
  if (value === 0) return "bg-slate-100";
  if (value <= 2) return "bg-green-100";
  if (value <= 4) return "bg-green-200";
  if (value <= 7) return "bg-green-400";
  return "bg-green-700";
}

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

export default function OccupancyAnalysis() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [searchRoom, setSearchRoom] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/occupancy/analysis", {
        params: searchRoom ? { roomId: searchRoom } : {},
      })
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [searchRoom]);

  const scatterData = useMemo(() => {
    if (!data?.scatterData) return [];
    return data.scatterData;
  }, [data]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef1fb]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="flex h-[48px] items-center justify-between bg-[#3f73bd] px-6 text-white">
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

      <section className="flex h-[50px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-xl font-bold text-[#3f73bd]">
            Occupancy & Lighting Analysis
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex h-9 w-[250px] items-center gap-3 rounded-full bg-[#eee7f1] px-4">
            <Menu size={16} />

            <input
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              placeholder="Search Room No"
              className="flex-1 bg-transparent text-xs outline-none"
            />

            <Search size={16} />
          </div>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs">
            {formatDate(now)}
          </span>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs">
            {formatTime(now)}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-2 px-3 sm:grid-cols-3 lg:grid-cols-[210px_210px_240px_1fr]">
        <div className="relative left-10 rounded-xl bg-[#9db8df] p-3 text-black">
          <div className="flex items-center gap-1 text-sm font-bold">
            <UserRound size={16} />
            Occupancy Status
          </div>

          <div className="flex items-end justify-center gap-2">
            <span className="text-4xl font-extrabold">
              {data.activeRooms}
            </span>

            <span className="mb-1 text-sm font-bold">
              Active <br /> Rooms
            </span>
          </div>
        </div>

        <div className="relative left-12 rounded-xl bg-[#fff1c9] p-3 text-black">
          <div className="flex items-center gap-1 text-sm font-bold">
            <Lightbulb size={17} className="text-yellow-500" />
            Light Status
          </div>

          <div className="flex items-end justify-center gap-2">
            <span className="text-4xl font-extrabold">{data.avgLight}</span>

            <span className="mb-1 text-sm font-bold">
              Light <br /> Lux
            </span>
          </div>
        </div>

        <div className="relative left-14 rounded-xl bg-[#c93c3f] p-3 text-black">
          <div className="flex items-center justify-center gap-2 text-sm font-bold">
            <AlertTriangle size={18} />
            Energy Alert
          </div>

          <div className="flex items-end justify-center gap-2">
            <span className="text-4xl font-extrabold">
              {data.alertCount}
            </span>

            <span className="mb-1 text-xs font-bold">
              Rooms <br /> Lights on without occupancy
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-8 text-sm">
          <button className="flex items-center gap-1 font-bold">
            Selected Room - {searchRoom || "All rooms"}
            <ChevronDown size={16} />
          </button>

          <span className="text-slate-300">|</span>

          <button className="flex items-center gap-1 font-bold text-blue-700">
            Last 24 Hours
            <ChevronDown size={16} />
          </button>
        </div>
      </section>

      <main className="grid grid-cols-1 gap-6 px-4 pt-3 lg:grid-cols-[1.35fr_0.8fr]">
        <section className="rounded bg-[#fafafa] p-3">
          <h2 className="text-center text-2xl font-semibold text-slate-600">
            Occupancy Heatmap – Daily Room Activity Pattern
          </h2>

          <div className="mt-5 overflow-x-auto">
            <div className="mx-auto w-fit">
              <div className="mb-3 ml-[90px] grid grid-cols-12 gap-1 text-center text-lg text-slate-500">
                {[
                  "00",
                  "02",
                  "04",
                  "06",
                  "08",
                  "10",
                  "12",
                  "14",
                  "16",
                  "18",
                  "20",
                  "22",
                ].map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>

              {data.heatmapData.slice(0, 5).map((row) => (
                <div key={row.room} className="mb-1 flex items-center gap-2">
                  <div className="w-[90px] text-lg text-slate-600">
                    {row.room}
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    {row.hours
                      .slice(0, 24)
                      .filter((_, i) => i % 2 === 0)
                      .map((v, i) => (
                        <div
                          key={i}
                          className={`h-8 w-9 ${heatColor(v)}`}
                          title={`${row.room}: ${v}`}
                        />
                      ))}
                  </div>
                </div>
              ))}

              <div className="mt-3 flex items-center justify-center gap-3 bg-white/80 p-2 text-slate-600">
                <span>No occupancy</span>
                <span className="h-6 w-8 bg-slate-100" />

                <span>Low</span>
                <span className="h-6 w-8 bg-green-100" />

                <span>Moderate</span>
                <span className="h-6 w-8 bg-green-300" />

                <span>High</span>
                <span className="h-6 w-8 bg-green-700" />

                <span>Very High</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded bg-[#fafafa] p-3">
          <h3 className="text-center text-sm font-medium text-slate-600">
            Light Intensity vs Occupancy – Identifying Energy Waste
          </h3>

          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="occupancy" name="Occupancy" />
              <YAxis dataKey="light" name="Light Intensity (Lux)" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />

              <Scatter data={scatterData} fill="#6aa892">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.waste ? "#e3843c" : "#6aa892"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </section>
      </main>

      <section className="grid grid-cols-1 gap-8 px-14 py-6 lg:grid-cols-2">
        <div>
          <h3 className="text-center text-sm">
            Peak Room Occupancy – Total Active Hours
          </h3>

          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={data.peak} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="room" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="hours" fill="#2b83ba" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded bg-[#fffaff] p-4">
          <h3 className="mb-4 text-center text-xl text-slate-600">
            Energy Wastage Detection
          </h3>

          <table className="w-full overflow-hidden rounded-xl text-center text-sm">
            <thead className="bg-slate-100 text-slate-500">
              <tr>
                <th className="p-2">Room</th>
                <th>Time</th>
                <th>Light</th>
                <th>Occupancy</th>
                <th>Alert</th>
              </tr>
            </thead>

            <tbody>
              {data.alerts.slice(0, 4).map((a, i) => (
                <tr key={i} className="border-b bg-white text-slate-600">
                  <td className="p-2">
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-sky-400" />
                    {a.roomId || a.roomid}
                  </td>

                  <td>{a.hour ?? "--"}:00</td>

                  <td>
                    <span className="rounded bg-orange-100 px-3 py-1 text-orange-500">
                      ON
                    </span>
                  </td>

                  <td>{a.pir ? "1" : "0"}</td>

                  <td className="font-semibold text-red-500">⚠ Waste</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-2 bg-[#3f73bd] px-8 py-3 text-right font-semibold text-white">
        Smart Hostel Monitoring System
      </footer>
    </div>
  );
}