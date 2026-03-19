import { Bell, Menu, Search, ShieldCheck } from "lucide-react";
import logoImg from "../../assets/logo.png";

function DashboardHeader() {
  const formattedDate = new Date().toLocaleDateString();
  const formattedTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="border-b border-slate-200 bg-blue-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-8xl items-center justify-between px-4 py-2 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/100">
              <img src={logoImg} alt="Logo" className="w-14 h-14" /> 
            </div>
            <div>
              <h1 className="text-lg font-semibold lg:text-xl">
                Smart Hostel Monitoring System
              </h1>
              <p className="text-xs text-blue-100">
                Real-time hostel environment analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Bell size={18} />
            </button>
            <button className="rounded-full bg-white/10 p-2 hover:bg-white/20">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-8xl flex-col gap-2 px-4 py-2 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-700">
            Hostel Environment Analytics Dashboard
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 rounded-full bg-white px-8 py-3 shadow-sm ring-1 ring-slate-200">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Room No - Room 101"
              className="bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200">
            <span>{formattedDate}</span>
            <span className="text-slate-300">|</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardHeader;