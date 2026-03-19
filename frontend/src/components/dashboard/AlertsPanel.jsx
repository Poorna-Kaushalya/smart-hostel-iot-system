import DashboardPanel from "./DashboardPanel";
import { AlertTriangle } from "lucide-react";

function AlertsPanel({ className = "", alerts = [] }) {
  return (
    <DashboardPanel title="Alerts" className={className} buttonText="">
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-xl bg-white p-4 text-sm text-emerald-700">
            No critical alerts available.
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl bg-white px-3 py-3"
            >
              <AlertTriangle size={16} className="mt-0.5 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-slate-700">{alert.title}</p>
                <p className="text-xs text-slate-500">{alert.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-right">
        <button className="text-xs font-medium text-[#4f75d6]">View All Alerts</button>
      </div>
    </DashboardPanel>
  );
}

export default AlertsPanel;