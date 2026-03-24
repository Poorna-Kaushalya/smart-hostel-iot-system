import { useEffect, useState, useMemo } from "react";
import DashboardPanel from "./DashboardPanel";
import SmallStatusRow from "./SmallStatusRow";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

function PowerPanel({ className = "", powerStatus }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sensorData"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(data.sort((a, b) => b.timestamp - a.timestamp));
    });
    return () => unsub();
  }, []);

  const latest = records[0] || {};
  const current = Number(latest.current ?? 0);
  const power = Number(latest.power ?? 0);

  // Badge color 
  const badgeColor =
    powerStatus?.type === "good"
      ? "bg-emerald-100 text-emerald-700"
      : powerStatus?.type === "warn"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  // Calculate daily power usage
  const dailyPower = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayTotals = {};

    records.forEach((r) => {
      if (!r.timestamp || !r.power) return;
      const date = new Date(r.timestamp); 
      const day = days[date.getDay()];
      dayTotals[day] = (dayTotals[day] || 0) + (Number(r.power) * 5) / 3600; 
    });

    return days.map((d) => ({
      day: d,
      power: parseFloat((dayTotals[d] || 0).toFixed(3)),
    }));
  }, [records]);

  return (
    <DashboardPanel title="Power Consumption" className={className} buttonText="">
      <div className="flex justify-end mb-3">
        <button className="rounded-lg bg-[#5a83dc] px-3 py-1 text-xs font-semibold -mt-8 text-white hover:bg-[#4a74cf]">
          View
        </button>
      </div>

      <div className="space-y-3">
        {/* Total Power Usage */}
        <div className="rounded-xl bg-[#f9eddd] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-[#8d5e1e]">
                {power ? (power / 3600).toFixed(4) : "--"} ×10⁻³ kWh
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
              {powerStatus?.label ?? "--"}
            </span>
          </div>
        </div>

        {/* Current */}
        <SmallStatusRow label="Current" value={`${current ?? "--"} A`} badge="Live" />

        {/* Daily Power Usage Bar Chart */}
        <div>
          <p className="text-sm font-semibold text-gray-600">Power Usage by Day (kWh)</p>
          <ResponsiveContainer width="115%" height={180} className="-mx-10 mt-3">
            <BarChart data={dailyPower}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="power" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default PowerPanel;