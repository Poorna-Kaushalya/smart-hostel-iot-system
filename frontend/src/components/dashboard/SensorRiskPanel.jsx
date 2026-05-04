import DashboardPanel from "./DashboardPanel";
import { riskFromStatus } from "./helpers";

const defaultStatus = { label: "No Data", type: "warn" };

function RiskBar({ title, tag, progress, color }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-semibold text-slate-700">{title}</p>
          <span className="text-sm text-slate-500">{tag}</span>
        </div>

        <div className="mt-1 h-1 w-full rounded-full bg-slate-100">
          <div
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SensorRiskPanel({
  className = "",
  tempStatus = defaultStatus,
  humidityStatus = defaultStatus,
  airStatus = defaultStatus,
  powerStatus = defaultStatus,
}) {
  return (
    <DashboardPanel title="Rooms per sensor" className={className} buttonText="">
      <div className="space-y-2">
        <RiskBar
          title="Temperature"
          progress={riskFromStatus(tempStatus.type)}
          color="bg-amber-400"
        />

        <RiskBar
          title="Humidity"
          progress={riskFromStatus(humidityStatus.type)}
          color="bg-blue-400"
        />

        <RiskBar
          title="Air Quality"
          progress={riskFromStatus(airStatus.type)}
          color="bg-blue-500"
        />

        <RiskBar
          title="Power"
          progress={riskFromStatus(powerStatus.type)}
          color="bg-orange-400"
        />
      </div>
    </DashboardPanel>
  );
}

export default SensorRiskPanel;