import { useMemo } from "react";
import DashboardPanel from "./DashboardPanel";
import SmallStatusRow from "./SmallStatusRow";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getDustStatus(value) {
  if (value <= 50) return { label: "Good", color: "bg-emerald-100 text-emerald-700" };
  if (value <= 100) return { label: "Moderate", color: "bg-amber-100 text-amber-700" };
  return { label: "Unhealthy", color: "bg-red-100 text-red-700" };
}

function DustLevelPanel({
  className = "",
  dust = 0,
  records = [],
}) {
  const dustValue = Number(dust || 0);
  const dustStatus = getDustStatus(dustValue);

  const dailyDust = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayTotals = {
      Sun: { total: 0, count: 0 },
      Mon: { total: 0, count: 0 },
      Tue: { total: 0, count: 0 },
      Wed: { total: 0, count: 0 },
      Thu: { total: 0, count: 0 },
      Fri: { total: 0, count: 0 },
      Sat: { total: 0, count: 0 },
    };

    records.forEach((r) => {
      const dustValue = Number(r.dust_density_ug_m3 || 0);
      if (!dustValue) return;

      let dayName = "";

      if (r.dayOfWeek) {
        dayName = String(r.dayOfWeek).slice(0, 3);
      } else if (r.createdAt) {
        const date = new Date(String(r.createdAt).replace(" ", "T"));
        dayName = days[date.getDay()];
      } else if (r.timestamp) {
        const date = new Date(Number(r.timestamp) * 1000);
        dayName = days[date.getDay()];
      }

      if (!dayTotals[dayName]) return;

      dayTotals[dayName].total += dustValue;
      dayTotals[dayName].count += 1;
    });

    return days.map((day) => ({
      day,
      dust:
        dayTotals[day].count > 0
          ? Number((dayTotals[day].total / dayTotals[day].count).toFixed(1))
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
              {dustValue ? dustValue.toFixed(1) : "--"} µg/m³
            </p>

            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${dustStatus.color}`}>
              {dustStatus.label}
            </span>
          </div>
        </div>


        <div>
          <p className="text-sm font-semibold text-gray-600">
            Average Dust Level by Day (µg/m³)
          </p>

          <ResponsiveContainer width="115%" height={250} className="-mx-10 mt-3">
            <BarChart data={dailyDust}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} µg/m³`, "Dust"]} />
              <Bar dataKey="dust" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default DustLevelPanel;