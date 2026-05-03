import { useMemo } from "react";
import DashboardPanel from "./DashboardPanel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getDustStatus(value) {
  if (value <= 50) {
    return { label: "Good", color: "bg-emerald-100 text-emerald-700" };
  }
  if (value <= 100) {
    return { label: "Moderate", color: "bg-amber-100 text-amber-700" };
  }
  return { label: "Unhealthy", color: "bg-red-100 text-red-700" };
}

function getRecordDate(record) {
  if (record.createdAt?.toDate) return record.createdAt.toDate();

  if (record.createdAt) {
    const date = new Date(String(record.createdAt).replace(" ", "T"));
    if (!isNaN(date)) return date;
  }

  return new Date();
}

function DustLevelPanel({ className = "", dust = 0, records = [] }) {
  const dustValue = Number(dust || 0);

  // For chart visibility only
  const displayDustValue = dustValue * 1000;

  const dustStatus = getDustStatus(displayDustValue);

  const dailyDust = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayTotals = days.reduce((acc, day) => {
      acc[day] = { total: 0, count: 0 };
      return acc;
    }, {});

    records.forEach((record) => {
      const rawValue = Number(record.dust_density_ug_m3 || 0);
      if (rawValue <= 0) return;

      // Scale small sensor values for visible chart
      const value = rawValue * 1000;

      const date = getRecordDate(record);
      const dayName = days[date.getDay()];

      dayTotals[dayName].total += value;
      dayTotals[dayName].count += 1;
    });

    return days.map((day) => ({
      day,
      dust:
        dayTotals[day].count > 0
          ? Number((dayTotals[day].total / dayTotals[day].count).toFixed(2))
          : 0,
    }));
  }, [records]);

  return (
    <DashboardPanel title="Dust Levels" className={className} buttonText="">
      <div className="flex justify-end mb-3">
        <button className="rounded-lg bg-[#5a83dc] px-3 py-1 text-xs font-semibold -mt-8 text-white hover:bg-[#4a74cf]">
          View
        </button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-[#f9eddd] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-[#8d5e1e]">
              {displayDustValue
                ? displayDustValue.toFixed(2)
                : "--"}{" "}
              µg/m³
            </p>

          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600">
            Average Dust Level by Day (µg/m³)
          </p>

          <ResponsiveContainer width="100%" height={180} className="mt-3">
            <BarChart data={dailyDust}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, "auto"]} />
              <Tooltip
                formatter={(value) => [`${value} µg/m³`, "Dust"]}
              />
              <Bar dataKey="dust" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default DustLevelPanel;