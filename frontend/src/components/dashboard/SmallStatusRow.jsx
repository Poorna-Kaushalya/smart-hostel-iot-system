function SmallStatusRow({ label, value, badge, badgeColor = "bg-emerald-100 text-emerald-700" }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-800">{value}</span>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeColor}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

export default SmallStatusRow;