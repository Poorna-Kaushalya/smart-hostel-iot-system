import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardPanel from "./DashboardPanel";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

function OccupancyPanel({ className = "", occupancyText }) {
  const navigate = useNavigate();
  const [latestRooms, setLatestRooms] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "sensorData"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const latestByRoom = {};
      rooms.forEach((r) => {
        const roomKey = r.roomId || r.roomid;
        if (roomKey && !latestByRoom[roomKey]) {
          latestByRoom[roomKey] = r;
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
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => navigate("/occupancy")}
          className="-mt-8 rounded-lg bg-[#5a83dc] px-3 py-1 text-xs font-semibold text-white hover:bg-[#4a74cf]"
        >
          View
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-[#f6e7da] p-4">
          <div>
            <p className="text-xl font-bold text-[#b97b2e]">{occupiedCount}</p>
            <p className="text-sm text-slate-600">Rooms Occupied</p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${occupancyBadgeColor}`}
          >
            {displayOccupancy}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white p-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Room
                </th>
                <th className="px-4 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Light
                </th>
                <th className="px-4 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  PIR
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {latestRooms.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-2 text-center text-sm text-gray-400"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                latestRooms.map((room) => (
                  <tr key={room.id}>
                    <td className="px-4 py-1 text-sm text-gray-700">
                      {room.roomId || room.roomid || "--"}
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