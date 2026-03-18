function StatCard({ title, value, unit }) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5 shadow-lg">
      <h3 className="mb-2 text-sm font-medium text-slate-300">{title}</h3>
      <p className="text-3xl font-bold text-white">
        {value} <span className="text-lg font-medium text-slate-400">{unit}</span>
      </p>
    </div>
  );
}

export default StatCard;