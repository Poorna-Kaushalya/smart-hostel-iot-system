function DashboardPanel({ title, children, className = "", buttonText = "View" }) {
  return (
    <div className={`rounded-xl border border-[#d8dcee] bg-[#f7f8fe] p-4 shadow-sm ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#39476b]">{title}</h3>
        {buttonText ? (
          <button className="rounded-lg bg-[#5a83dc] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4a74cf]">
            {buttonText}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default DashboardPanel;