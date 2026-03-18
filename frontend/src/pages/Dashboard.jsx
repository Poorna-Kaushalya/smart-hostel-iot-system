import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import StatCard from "../components/StatCard";
import SensorTable from "../components/SensorTable";

function Dashboard() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "sensorData"), orderBy("createdAt", "desc"), limit(20));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(list);
    });

    return () => unsub();
  }, []);

  const latest = records[0] || {};

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">Smart Hostel Monitoring Dashboard</h1>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Temperature" value={latest.temperature ?? "--"} unit="°C" />
          <StatCard title="Humidity" value={latest.humidity ?? "--"} unit="%" />
          <StatCard title="MQ135 Voltage" value={latest.mq135Voltage ?? "--"} unit="V" />
          <StatCard title="Current" value={latest.current ?? "--"} unit="A" />
          <StatCard title="Power" value={latest.power ?? "--"} unit="W" />
          <StatCard title="Occupancy" value={latest.pir ?? "--"} unit="" />
        </div>

        <SensorTable data={records} />
      </div>
    </div>
  );
}

export default Dashboard;