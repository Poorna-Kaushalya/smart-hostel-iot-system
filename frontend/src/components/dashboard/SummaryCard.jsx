function SummaryCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  bg,
  iconBg,
  titleColor = "text-slate-600",
  valueColor = "text-slate-800",
}) {
  return (
    <div className={`rounded-xl border border-slate-200 p-2 shadow-sm ${bg}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-xl p-2 ${iconBg}`}>{icon}</div>
        <div className="flex-1">
          <p className={`text-sm ${titleColor}`}>{title}</p>
          <div className="mt-1 flex items-end gap-1">
            <h3 className={`text-sm font-bold leading-none ${valueColor}`}>{value}</h3>
            {unit ? <span className="pb-0 text-xs text-slate-500">{unit}</span> : null}

          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;