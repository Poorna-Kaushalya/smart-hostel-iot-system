import {
  Building2,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  AlertTriangle,
} from "lucide-react";
import SummaryCard from "./SummaryCard";

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function TopSummaryCards({
  latest = {},
  occupancyText,
  tempStatus = { label: "--" },
  humidityStatus = { label: "--" },
  airStatus = { label: "--" },
  powerStatus = { label: "--" },
  alertsCount = 0,
}) {
  const airQualityPpm =
    latest.air_quality_ppm !== undefined && latest.air_quality_ppm !== null
      ? safeNum(latest.air_quality_ppm)
      : safeNum(latest.mq135Voltage) * 100;

  const power =
    latest.power !== undefined && latest.power !== null
      ? safeNum(latest.power)
      : safeNum(latest.current) * 12;

  const displayOccupancy =
    occupancyText || latest.occupancy || (Number(latest.pir) === 1 ? "Occupied" : "Not Occupied");

  return (
    <div className="mt-2 mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
      <SummaryCard
        title="Occupied Rooms"
        value={displayOccupancy === "Occupied" ? "1/1" : "0/1"}
        subtitle={displayOccupancy}
        unit=""
        icon={<Building2 size={22} className="text-blue-600" />}
        bg="bg-[#eef1fb]"
        iconBg="bg-blue-100"
      />

      <SummaryCard
        title="Temperature"
        value={latest.temperature ?? "--"}
        unit="°C"
        subtitle={tempStatus.label}
        icon={<Thermometer size={22} className="text-orange-500" />}
        bg="bg-[#f7eddc]"
        iconBg="bg-orange-100"
      />

      <SummaryCard
        title="Humidity"
        value={latest.humidity ?? "--"}
        unit="%"
        subtitle={humidityStatus.label}
        icon={<Droplets size={22} className="text-blue-500" />}
        bg="bg-[#e7ecfb]"
        iconBg="bg-blue-100"
      />

      <SummaryCard
        title="Air Quality"
        value={airQualityPpm.toFixed(1)}
        unit="PPM"
        subtitle={airStatus.label}
        icon={<Wind size={22} className="text-emerald-600" />}
        bg="bg-[#dcf3ec]"
        iconBg="bg-emerald-100"
      />

      <SummaryCard
        title="Power Usage"
        value={power.toFixed(2)}
        unit="W"
        subtitle={powerStatus.label}
        icon={<Zap size={22} className="text-amber-600" />}
        bg="bg-[#f8eddc]"
        iconBg="bg-amber-100"
      />

      <SummaryCard
        title="Energy Alerts"
        value={alertsCount}
        unit=""
        subtitle={alertsCount > 0 ? "Alerts" : "Normal"}
        icon={<AlertTriangle size={22} className="text-red-500" />}
        bg="bg-[#f7e5ea]"
        iconBg="bg-red-100"
        valueColor="text-red-500"
      />
    </div>
  );
}

export default TopSummaryCards;