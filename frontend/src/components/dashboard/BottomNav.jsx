import { LayoutDashboard, Lightbulb, Thermometer, Wind, Zap, Menu } from "lucide-react";

function BottomNav() {
  return (
    <footer className="mt-3 bg-blue-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium">
            <LayoutDashboard size={15} />
            Dashboard
          </button>
          <button className="rounded-md px-4 py-2 text-sm text-white/90 hover:bg-white/10">
            Occupancy & Lighting
          </button>
          <button className="rounded-md px-4 py-2 text-sm text-white/90 hover:bg-white/10">
            Temperature & Humidity
          </button>
          <button className="rounded-md px-4 py-2 text-sm text-white/90 hover:bg-white/10">
            Air Quality
          </button>
          <button className="rounded-md px-4 py-2 text-sm text-white/90 hover:bg-white/10">
            Power Monitoring
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Zap size={16} />
          <Menu size={16} />
        </div>
      </div>

      <div className="border-t border-white/20 py-2 text-center text-sm">
        Smart Hostal Monitoring System
      </div>
    </footer>
  );
}

export default BottomNav;