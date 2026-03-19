function DashboardPanel({ title, children, className = "", buttonText = "View Dashboard" }) {
  return (
    <div className={`rounded-xl border border-[#d8dcee] bg-[#f7f8fe] p-4 shadow-sm ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#39476b]">{title}</h3>
        {buttonText ? (
          <button className="rounded-lg bg-[#f5ae31] px-4 py-2 text-xs font-semibold text-white hover:bg-[#eaa11e]">
            {buttonText}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default DashboardPanel;