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

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeValue(value, unit = "", decimals = 1) {
  if (value === null || value === undefined || value === "") return "--";
  return `${safeNum(value).toFixed(decimals)}${unit}`;
}

function calculateHealthScore(temp, hum, airPpm) {
  let score = 100;

  if (temp > 35) score -= 35;
  else if (temp > 32) score -= 20;
  else if (temp > 30) score -= 10;

  if (hum > 85) score -= 25;
  else if (hum > 75) score -= 15;

  if (airPpm > 200) score -= 25;
  else if (airPpm > 100) score -= 10;

  return Math.max(score, 0);
}

function calculateHealthLabel(score) {
  if (score >= 80) return "Healthy";
  if (score >= 50) return "Moderate";
  return "Unhealthy";
}

function EnvironmentHealthPanel({
  className = "",
  healthScore,
  environmentalHealth,
  temperature,
  humidity,
  mq135Voltage,
  airQualityPpm,
  current,
  power,
  powerUsage,
}) {
  const calculatedAirPpm =
    airQualityPpm !== null && airQualityPpm !== undefined && airQualityPpm !== ""
      ? safeNum(airQualityPpm)
      : safeNum(mq135Voltage) * 100;

  // Latest Power in Watts
  const calculatedPower =
  power !== undefined && power !== null && power !== ""
    ? Number(power)
    : current !== undefined && current !== null && current !== ""
    ? Number(current) * 12
    : powerUsage !== undefined && powerUsage !== null && powerUsage !== ""
    ? Number(powerUsage)
    : 0;

const safePower = Number.isFinite(calculatedPower) ? calculatedPower : 0;

  const calculatedScore =
    typeof healthScore === "number"
      ? healthScore
      : calculateHealthScore(
          safeNum(temperature),
          safeNum(humidity),
          calculatedAirPpm
        );

  const healthLabel =
    environmentalHealth || calculateHealthLabel(calculatedScore);

  const healthType = getHealthType(calculatedScore);

  return (
    <DashboardPanel
      title="Hostel Environment Health"
      className={className}
      buttonText=""
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Temperature</span>
            <span className="text-sm font-semibold">
              {safeValue(temperature, "°C")}
            </span>
          </div>

          <div className="flex justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Humidity</span>
            <span className="text-sm font-semibold">
              {safeValue(humidity, "%")}
            </span>
          </div>

          <div className="flex justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Air Quality</span>
            <span className="text-sm font-semibold">
              {calculatedAirPpm.toFixed(1)} ppm
            </span>
          </div>

          <div className="flex justify-between rounded-xl bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Power Usage</span>
            <span className="text-sm font-semibold">
              {safePower.toFixed(2)} W 
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-xl bg-white p-4">
          <div className="flex h-44 w-44 items-center justify-center rounded-full border-[14px] border-[#f1c94f] bg-[#fff9e6] shadow-inner">
            <div className="text-center">
              <p className="text-5xl font-bold text-[#39476b]">
                {safeNum(calculatedScore).toFixed(0)}
              </p>

              <p
                className={`mt-2 text-lg font-semibold ${statusColor(
                  healthType
                )}`}
              >
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