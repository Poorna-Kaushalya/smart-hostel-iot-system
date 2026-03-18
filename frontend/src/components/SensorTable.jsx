function SensorTable({ data }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-slate-800 shadow-lg">
      <table className="min-w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-700 text-slate-100">
          <tr>
            <th className="px-4 py-3">Room</th>
            <th className="px-4 py-3">Temp</th>
            <th className="px-4 py-3">Humidity</th>
            <th className="px-4 py-3">MQ135</th>
            <th className="px-4 py-3">PIR</th>
            <th className="px-4 py-3">LDR</th>
            <th className="px-4 py-3">Current</th>
            <th className="px-4 py-3">Power</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-slate-700">
              <td className="px-4 py-3">{item.roomId}</td>
              <td className="px-4 py-3">{item.temperature}</td>
              <td className="px-4 py-3">{item.humidity}</td>
              <td className="px-4 py-3">{item.mq135Voltage}</td>
              <td className="px-4 py-3">{item.pir}</td>
              <td className="px-4 py-3">{item.ldr}</td>
              <td className="px-4 py-3">{item.current}</td>
              <td className="px-4 py-3">{item.power}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SensorTable;