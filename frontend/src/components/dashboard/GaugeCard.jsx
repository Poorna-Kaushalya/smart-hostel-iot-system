function GaugeCard({ value = 0, label = "" }) {
  const percentage = Math.max(0, Math.min(value, 100));

  return (
    <div className="rounded-xl bg-white p-4">
      <div className="mb-3 h-5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-5 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export default GaugeCard;