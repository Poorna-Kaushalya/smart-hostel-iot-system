import { useEffect, useState } from "react";
import DashboardPanel from "./DashboardPanel";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

function OccupancyPanel({ className = "", occupancyText }) {
  const [latestRooms, setLatestRooms] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "sensorData"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const latestByRoom = {};
      rooms.forEach((r) => {
        if (!latestByRoom[r.roomId]) {
          latestByRoom[r.roomId] = r;
        }
      });

      setLatestRooms(Object.values(latestByRoom));
    });

    return () => unsub();
  }, []);

  const occupiedCount = latestRooms.filter((r) => Number(r.pir) === 1).length;

  const displayOccupancy =
    occupancyText || (occupiedCount > 0 ? "Occupied" : "Not Occupied");

  const occupancyBadgeColor =
    displayOccupancy === "Occupied"
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700";

  return (
    <DashboardPanel title="Occupancy & Lighting" className={className} buttonText="">
      <div className="flex justify-end mb-3">
        <button className="rounded-lg bg-[#5a83dc] px-3 py-1 text-xs font-semibold -mt-8 text-white hover:bg-[#4a74cf]">
          View
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-[#f6e7da] p-4 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-[#b97b2e]">{occupiedCount}</p>
            <p className="text-sm text-slate-600">Rooms Occupied</p>
          </div>

          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${occupancyBadgeColor}`}>
            {displayOccupancy}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white p-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Light
                </th>
                <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIR
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {latestRooms.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-center text-sm text-gray-400">
                    No data available
                  </td>
                </tr>
              ) : (
                latestRooms.map((room) => (
                  <tr key={room.id}>
                    <td className="px-4 py-1 text-sm text-gray-700">
                      {room.roomId}
                    </td>
                    <td className="px-4 py-1 text-sm text-gray-700">
                      {Number(room.light_intensity_lux || 0).toFixed(1)} lux
                    </td>
                    <td className="px-4 py-1 text-sm text-gray-700">
                      {Number(room.pir) === 1 ? "Motion" : "No Motion"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardPanel>
  );
}

export default OccupancyPanel;