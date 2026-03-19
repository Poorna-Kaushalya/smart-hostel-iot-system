import DashboardPanel from "./DashboardPanel";
import Sparkline from "./Sparkline";

function TempHumidityPanel({
  className = "",
  temperature,
  humidity,
  tempStatus,
  humidityStatus,
  temperatureSeries,
  humiditySeries,
}) {
  return (
    <DashboardPanel title="Temperature & Humidity" className={className} buttonText="">
      <div className="flex justify-end mb-2">
        <button className="rounded-lg bg-[#5a83dc] px-3 py-1 -mt-8 text-xs font-semibold text-white hover:bg-[#4a74cf]">
          View Dashboard
        </button>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl bg-[#e9eefc] p-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg mx-5 font-bold text-[#334a85]">{temperature ?? "--"}°C</p>
              <p className="text-xs mx-5 text-slate-500">Temperature</p>
            </div>
            <div>
              <p className="text-lg mx-5 font-bold text-[#334a85]">{humidity ?? "--"}%</p>
              <p className="text-xs mx-5 text-slate-500">Humidity</p>
            </div>
          </div>
        </div>

        <Sparkline data={temperatureSeries} color="#4b7bec" />
        <Sparkline data={humiditySeries} color="#67a6ff" />

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 text-center">
            <p className="text-xs text-slate-500">Temp Status</p>
            <p className="text-sm font-semibold text-slate-800">{tempStatus.label}</p>
          </div>
          <div className="p-2 text-center">
            <p className="text-xs text-slate-500">Humidity Status</p>
            <p className="text-sm font-semibold text-slate-800">{humidityStatus.label}</p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default TempHumidityPanel;