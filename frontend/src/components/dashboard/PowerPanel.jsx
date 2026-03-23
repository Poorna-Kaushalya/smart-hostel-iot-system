import DashboardPanel from "./DashboardPanel";
import SmallStatusRow from "./SmallStatusRow";
import { normalize } from "./helpers";

function SpeedMeter({ value = 0, unit = "kWh" }) {
  const clamped = Math.max(0, Math.min(value, 100));
  const angle = -90 + (clamped / 100) * 180;

  const getStatusColor = (v) => {
    if (v <= 30) return "#22c55e";
    if (v <= 65) return "#f59e0b";
    return "#ef4444";
  };

  const statusText =
    clamped <= 30 ? "Low" : clamped <= 65 ? "Moderate" : "High";

  return (
    <div className="rounded-xl bg-white p-4">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 220 130" className="w-full max-w-[260px]">
          <path
            d="M 30 110 A 80 80 0 0 1 75 40"
            fill="none"
            stroke="#22c55e"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 75 40 A 80 80 0 0 1 145 40"
            fill="none"
            stroke="#facc15"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 145 40 A 80 80 0 0 1 190 110"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="round"
          />

          <g transform={`rotate(${angle} 110 110)`}>
            <line
              x1="110"
              y1="110"
              x2="110"
              y2="42"
              stroke={getStatusColor(clamped)}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          <circle cx="110" cy="110" r="7" fill={getStatusColor(clamped)} />

          <text x="28" y="122" fontSize="10" fill="#64748b">
            Low
          </text>
          <text x="98" y="24" fontSize="10" fill="#64748b">
            Medium
          </text>
          <text x="176" y="122" fontSize="10" fill="#64748b">
            High
          </text>

          <text
            x="110"
            y="84"
            textAnchor="middle"
            fontSize="24"
            fontWeight="700"
            fill="#1e293b"
          >
           
          </text>
          <text
            x="110"
            y="100"
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
          >
            {statusText}
          </text>
        </svg>

        <p className="mt-1 text-sm text-slate-500">Power Level ({unit})</p>
      </div>
    </div>
  );
}

function PowerPanel({
  className = "",
  power,
  current,
  powerStatus,
}) {
  const badgeColor =
    powerStatus.type === "good"
      ? "bg-emerald-100 text-emerald-700"
      : powerStatus.type === "warn"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  const meterValue = normalize(Number(power / (1000 * 3600)), 0.0000, 0.1000);

  return (
    <DashboardPanel title="Power Consumption" className={className} buttonText="">
        <div className="flex justify-end mb-3">
        <button className="rounded-lg bg-[#5a83dc] px-3 py-1 text-xs font-semibold -mt-8 text-white hover:bg-[#4a74cf]">
          View
        </button>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl bg-[#f9eddd] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-[#8d5e1e]">{(power / (1000 * 3600)).toFixed(4) ?? "--"} kWh</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
              {powerStatus.label}
            </span>
          </div>
        </div>

        <SmallStatusRow label="Current" value={`${current ?? "--"} A`} badge="Live" />

        <SpeedMeter value={meterValue} unit="kWh" />
      </div>
    </DashboardPanel>
  );
}

export default PowerPanel;