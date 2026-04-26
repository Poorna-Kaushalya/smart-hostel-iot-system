import DashboardPanel from "./DashboardPanel";

function statusColor(type) {
  if (type === "good") return "text-emerald-600";
  if (type === "warn") return "text-amber-500";
  return "text-red-500";
}

function getHealthType(score) {
  if (score >= 80) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

function EnvironmentHealthPanel({
  className = "",
  healthScore,
  environmentalHealth,
  temperature,
  humidity,
  mq135Voltage,
  airQualityPpm,
  power,
}) {
  const score = healthScore ?? "--";
  const healthLabel = environmentalHealth || "--";
  const healthType =
    typeof healthScore === "number" ? getHealthType(healthScore) : "warn";

  const mlStatus = {
    label: healthLabel,
    type: healthType,
  };

  const powerWatts = power != null ? Number(power).toFixed(2) : "--";

  return (
    <DashboardPanel
      title="Hostel Environment Health"
      className={className}
      buttonText=""
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
            <span className="text-sm text-slate-600">Temperature</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {temperature ?? "--"}°C
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Humidity</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{humidity ?? "--"}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Air Quality</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {airQualityPpm ?? "--"} PPM
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Power Usage</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{powerWatts} W</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-xl bg-white p-4">
          <div className="flex h-44 w-44 items-center justify-center rounded-full border-[14px] border-[#f1c94f] bg-[#fff9e6] shadow-inner">
            <div className="text-center">
              <p className="text-5xl font-bold text-[#39476b]">{score}</p>

              <p className={`mt-2 text-lg font-semibold ${statusColor(healthType)}`}>
                {healthLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default EnvironmentHealthPanel;