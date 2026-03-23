import DashboardPanel from "./DashboardPanel";
import { riskFromStatus } from "./helpers";

function RiskBar({ number, title, tag, progress, color }) {
  return (
    <div className="flex items-center gap-3  px-3 py-2">


      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-semibold text-slate-700">{title}</p>
          <span className="text-sm text-slate-500">{tag}</span>
        </div>
        <div className="mt-0 h-1 w-full rounded-full">
          <div
            className={`h-2 rounded-full ${color}`}
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

      <div className="space-y-2">
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