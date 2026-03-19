import DashboardPanel from "./DashboardPanel";
import { riskFromStatus } from "./helpers";

function RiskBar({ number, title, tag, progress, color }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4f75d6] text-sm font-bold text-white">
        {number}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-semibold text-slate-700">{title}</p>
          <span className="text-sm text-slate-500">{tag}</span>
        </div>
        <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200">
          <div
            className={`h-2.5 rounded-full ${color}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SensorRiskPanel({ className = "", tempStatus, humidityStatus, airStatus, powerStatus }) {
  return (
    <DashboardPanel title="Rooms per sensor" className={className} buttonText="">
      <div className="mb-3 flex items-center justify-end gap-4 text-sm text-slate-500">
        <span>Avg</span>
        <span>Risk</span>
      </div>

      <div className="space-y-3">
        <RiskBar
          number="1"
          title="Temperature"
          tag={tempStatus.label}
          progress={riskFromStatus(tempStatus.type)}
          color="bg-amber-400"
        />
        <RiskBar
          number="2"
          title="Humidity"
          tag={humidityStatus.label}
          progress={riskFromStatus(humidityStatus.type)}
          color="bg-blue-400"
        />
        <RiskBar
          number="3"
          title="Air Quality"
          tag={airStatus.label}
          progress={riskFromStatus(airStatus.type)}
          color="bg-blue-500"
        />
        <RiskBar
          number="4"
          title="Power"
          tag={powerStatus.label}
          progress={riskFromStatus(powerStatus.type)}
          color="bg-orange-400"
        />
      </div>
    </DashboardPanel>
  );
}

export default SensorRiskPanel;