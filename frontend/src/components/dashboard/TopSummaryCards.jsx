import {
  Building2,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  AlertTriangle,
} from "lucide-react";
import SummaryCard from "./SummaryCard";

function TopSummaryCards({
  latest,
  occupancyText,
  tempStatus,
  humidityStatus,
  airStatus,
  powerStatus,
  alertsCount,
}) {
  return (
    <div className="mt-2 mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
      <SummaryCard
        title="Occupied Rooms"
        value={occupancyText === "Occupied" ? "1/1" : "0/1"}
        subtitle={occupancyText}
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
        title="Air Quality Index"
        value={latest.mq135Voltage ?? "--"}
        unit="V"
        subtitle={airStatus.label}
        icon={<Wind size={22} className="text-emerald-600" />}
        bg="bg-[#dcf3ec]"
        iconBg="bg-emerald-100"
      />

      <SummaryCard
        title="Power Usage"
        value={
          latest.power !== undefined
            ? (latest.power /3600 ).toFixed(4)
            : "--"
        }
        unit="×10⁻³ kWh"
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