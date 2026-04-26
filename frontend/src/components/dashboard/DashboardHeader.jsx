import { Search } from "lucide-react";

function DashboardHeader({ searchRoom, setSearchRoom }) {
  const formattedDate = new Date().toLocaleDateString();
  const formattedTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border-b border-slate-200 bg-blue-900 text-white shadow-sm">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-4 py-2 lg:px-6">
        <h2 className="text-2xl font-bold text-white">
          Hostel Environment Analytics Dashboard
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
            <Search size={16} className="text-slate-500" />
            <input
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              type="text"
              placeholder="Search Room No - Room101"
              className="bg-transparent text-xs outline-none text-gray-950 placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs shadow-sm ring-1 ring-slate-200 text-gray-600">
            <span>{formattedDate}</span>
            <span>|</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;