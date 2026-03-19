import DashboardPanel from "./DashboardPanel";

function OccupancyPanel({ className = "", occupancyText, power, current }) {
  return (
    <DashboardPanel title="Occupancy & Lighting" className={className} buttonText="">
      <div className="flex justify-end mb-3">
        <button className="rounded-lg bg-[#f5a623] px-3 py-1 text-xs font-semibold -mt-8 text-white hover:bg-[#e59b1f]">
          View Dashboard
        </button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-[#f6e7da] p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#b97b2e]">
              {occupancyText === "Occupied" ? "1" : "0"}
            </span>
            <span className="text-sm text-slate-600">Rooms Occupied</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 rounded ${
                  i % 5 === 0
                    ? "bg-[#dceadf]"
                    : i % 3 === 0
                    ? "bg-[#9ac69b]"
                    : "bg-[#cfe2d3]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-3 text-center">
            <p className="text-xs text-slate-500">Power</p>
            <p className="text-sm font-bold text-slate-800">{power ?? "--"} W</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center">
            <p className="text-xs text-slate-500">Current</p>
            <p className="text-sm font-bold text-slate-800">{current ?? "--"} A</p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default OccupancyPanel;