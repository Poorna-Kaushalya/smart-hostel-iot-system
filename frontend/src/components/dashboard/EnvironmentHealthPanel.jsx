import DashboardPanel from "./DashboardPanel";

function statusColor(type) {
  if (type === "good") return "text-emerald-600";
  if (type === "warn") return "text-amber-500";
  return "text-red-500";
}

function EnvironmentHealthPanel({
  className = "",
  healthScore,
  temperature,
  humidity,
  mq135Voltage,
  power,
  tempStatus,
  humidityStatus,
  airStatus,
  powerStatus,
}) {
  return (
    <DashboardPanel title="Hostel Environment Health" className={className} buttonText="">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
            <span className="text-sm text-slate-600">Temperature</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{temperature ?? "--"}°C</span>
              <span className={`text-sm font-semibold ${statusColor(tempStatus.type)}`}>
                {tempStatus.label}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Humidity</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{humidity ?? "--"}%</span>
              <span className={`text-sm font-semibold ${statusColor(humidityStatus.type)}`}>
                {humidityStatus.label}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Air Quality</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{mq135Voltage ?? "--"}V</span>
              <span className={`text-sm font-semibold ${statusColor(airStatus.type)}`}>
                {airStatus.label}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Power Usage</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {power != null ? (power/3600).toFixed(2) : "--"} ×10⁻³ kW
              </span>
              <span className={`text-sm font-semibold ${statusColor(powerStatus?.type)}`}>
                {powerStatus?.label || "--"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-xl bg-white p-4">
          <div className="flex h-44 w-44 items-center justify-center rounded-full border-[14px] border-[#f1c94f] bg-[#fff9e6] shadow-inner">
            <div className="text-center">
              <p className="text-5xl font-bold text-[#39476b]">{healthScore}</p>
              <p className="mt-1 text-sm text-slate-500">{healthScore} / 100 good</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default EnvironmentHealthPanel;