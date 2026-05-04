import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardPanel from "./DashboardPanel";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function scaleDust(value) {
  const dust = safeNum(value);
  return dust > 0 && dust < 1 ? dust * 1000 : dust;
}

function getRecordDate(record) {
  const rawTime =
    record.createdAt ||
    record.timestamp ||
    record.date ||
    record.deviceTimestamp ||
    null;

  if (!rawTime) return null;

  if (typeof rawTime === "object" && rawTime.seconds) {
    return new Date(rawTime.seconds * 1000);
  }

  const date = new Date(rawTime);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getTimeLabel(record, index) {
  const date = getRecordDate(record);
  if (!date) return `T${index + 1}`;

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPowerW(record) {
  if (record.power !== undefined && record.power !== null && record.power !== "") {
    return safeNum(record.power);
  }

  return safeNum(record.current) * 12;
}

function getAirPpm(record) {
  if (
    record.air_quality_ppm !== undefined &&
    record.air_quality_ppm !== null &&
    record.air_quality_ppm !== ""
  ) {
    return safeNum(record.air_quality_ppm);
  }

  return safeNum(record.mq135Voltage) * 100;
}

function ChartCard({ title, subtitle, viewPath, children }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#26385f]">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        {viewPath && (
          <button
            onClick={() => navigate(viewPath)}
            className="rounded-lg bg-[#5a83dc] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4a74cf]"
          >
            View
          </button>
        )}
      </div>

      {children}
    </div>
  );
}

function AdvancedAnalysisPanel({ className = "", records = [] }) {
  const [rangeMode, setRangeMode] = useState("25");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const allTimeData = useMemo(() => {
    return records
      .slice()
      .reverse()
      .map((r, index) => {
        const power = getPowerW(r);
        const date = getRecordDate(r);

        return {
          timestamp: date ? date.getTime() : index,
          time: getTimeLabel(r, index),
          temperature: safeNum(r.temperature),
          humidity: safeNum(r.humidity),
          airQuality: getAirPpm(r),
          power: Number(power.toFixed(2)),
          dust: Number(scaleDust(r.dust_density_ug_m3).toFixed(2)),
        };
      });
  }, [records]);

  const selectedData = useMemo(() => {
    let data = [...allTimeData];

    if (startDateTime) {
      const start = new Date(startDateTime).getTime();
      data = data.filter((d) => d.timestamp >= start);
    }

    if (endDateTime) {
      const end = new Date(endDateTime).getTime();
      data = data.filter((d) => d.timestamp <= end);
    }

    if (!startDateTime && !endDateTime && rangeMode !== "all") {
      data = data.slice(-Number(rangeMode));
    }

    return data;
  }, [allTimeData, rangeMode, startDateTime, endDateTime]);

  const clearRange = () => {
    setRangeMode("25");
    setStartDateTime("");
    setEndDateTime("");
  };

  return (
    <DashboardPanel
      title="Time-Based Environmental Analysis"
      className={className}
      buttonText=""
    >
      <div className="mb-4 rounded-2xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <select
            value={rangeMode}
            onChange={(e) => setRangeMode(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="10">Last 10</option>
            <option value="25">Last 25</option>
            <option value="50">Last 50</option>
            <option value="all">All</option>
          </select>

          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />

          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />

          <div className="text-center">
            <p className="text-xs text-gray-500">Records</p>
            <h3 className="text-xl font-bold">{selectedData.length}</h3>
          </div>

          <button
            onClick={clearRange}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm text-white"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Thermal Comfort Trend"
          subtitle="Temperature and humidity changes over selected time"
          viewPath="/temperature-humidity"
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={selectedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                dataKey="temperature"
                name="Temperature °C"
                stroke="#f97316"
                fill="#fde68a"
              />
              <Area
                dataKey="humidity"
                name="Humidity %"
                stroke="#3b82f6"
                fill="#bfdbfe"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Air Quality Variation"
          subtitle="Air quality ppm changes over selected time"
          viewPath="/air-quality"
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={selectedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="airQuality"
                name="Air Quality ppm"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Power Consumption Trend"
          subtitle="Power usage calculated from current readings"
          viewPath="/occupancy"
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={selectedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Area
                dataKey="power"
                name="Power W"
                stroke="#f59e0b"
                fill="#fde68a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Dust Level Trend"
          subtitle="Dust concentration changes over selected time"
          viewPath="/dust"
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={selectedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Area
                dataKey="dust"
                name="Dust µg/m³"
                stroke="#a16207"
                fill="#fef3c7"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardPanel>
  );
}

export default AdvancedAnalysisPanel;