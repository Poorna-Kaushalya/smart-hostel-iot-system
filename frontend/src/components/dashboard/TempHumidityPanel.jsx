import { useNavigate } from "react-router-dom";
import DashboardPanel from "./DashboardPanel";
import Sparkline from "./Sparkline";

function TempHumidityPanel({
  className = "",
  temperature,
  humidity,
  temperatureSeries,
  humiditySeries,
}) {
  const navigate = useNavigate();

  return (
    <DashboardPanel
      title="Temperature & Humidity"
      className={className}
      buttonText=""
    >
      <div className="mb-2 flex justify-end">
        <button
          onClick={() => navigate("/temperature-humidity")}
          className="-mt-8 rounded-lg bg-[#5a83dc] px-3 py-1 text-xs font-semibold text-white hover:bg-[#4a74cf]"
        >
          View
        </button>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl bg-[#e9eefc] p-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="mx-5 text-lg font-bold text-[#334a85]">
                {temperature ?? "--"}°C
              </p>
              <p className="mx-5 text-xs text-slate-500">Temperature</p>
            </div>

            <div>
              <p className="mx-5 text-lg font-bold text-[#334a85]">
                {humidity ?? "--"}%
              </p>
              <p className="mx-5 text-xs text-slate-500">Humidity</p>
            </div>
          </div>
        </div>

        <Sparkline data={temperatureSeries} color="#4b7bec" />
        <Sparkline data={humiditySeries} color="#67a6ff" />
      </div>
    </DashboardPanel>
  );
}

export default TempHumidityPanel;