import DashboardPanel from "./DashboardPanel";
import { normalize } from "./helpers";

function SpeedMeter({ value = 0 }) {
  const clamped = Math.max(0, Math.min(value, 100));
  const angle = -90 + (clamped / 100) * 180;

  const getStatusColor = (v) => {
    if (v <= 30) return "#22c55e";
    if (v <= 65) return "#f59e0b";
    return "#ef4444";
  };

  const statusText =
    clamped <= 30 ? "Good" : clamped <= 65 ? "Moderate" : "Poor";

  return (
    <div className=" p-0">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 220 130" className="w-full max-w-[250px]">
          <path
            d="M 30 110 A 80 80 0 0 1 75 40"
            fill="none"
            stroke="#22c55e"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 75 40 A 80 80 0 0 1 145 40"
            fill="none"
            stroke="#facc15"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 145 40 A 80 80 0 0 1 190 110"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="round"
          />

          <g transform={`rotate(${angle} 110 110)`}>
            <line
              x1="110"
              y1="110"
              x2="110"
              y2="42"
              stroke={getStatusColor(clamped)}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          <circle cx="110" cy="110" r="7" fill={getStatusColor(clamped)} />

          <text x="28" y="122" fontSize="10" fill="#64748b">
            Low
          </text>
          <text x="98" y="24" fontSize="10" fill="#64748b">
            Medium
          </text>
          <text x="176" y="122" fontSize="10" fill="#64748b">
            High
          </text>

          <text
            x="110"
            y="88"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fill="#1e293b"
          >
            {clamped.toFixed(0)}
          </text>
          <text
            x="110"
            y="104"
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
          >
            {statusText}
          </text>
        </svg>
      </div>
    </div>
  );
}

function XYChart({ data = [], color = "#f0a431" }) {
  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-white text-sm text-slate-400">
        No data
      </div>
    );
  }

  const width = 320;
  const height = 150;
  const paddingLeft = 38;
  const paddingRight = 14;
  const paddingTop = 14;
  const paddingBottom = 28;

  const minY = Math.min(...data);
  const maxY = Math.max(...data);
  const rangeY = maxY - minY || 1;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const points = data
    .map((d, i) => {
      const x =
        paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
      const y =
        paddingTop + plotHeight - ((d - minY) / rangeY) * plotHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const yTicks = [minY, (minY + maxY) / 2, maxY];

  return (
    <div className=" p-1">
      <p className="mb-2 text-sm font-medium text-slate-600">Air Quality Trend</p>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {yTicks.map((tick, index) => {
          const y =
            paddingTop + plotHeight - ((tick - minY) / rangeY) * plotHeight;

          return (
            <g key={index}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          );
        })}

        {data.map((_, i) => {
          if (i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) {
            return null;
          }

          const x =
            paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;

          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {i + 1}
            </text>
          );
        })}

        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) => {
          const x =
            paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
          const y =
            paddingTop + plotHeight - ((d - minY) / rangeY) * plotHeight;

          return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
        })}
      </svg>
    </div>
  );
}

function AirQualityPanel({
  className = "",
  airValue,
  airStatus,
  airSeries = [],
}) {
  const meterValue = normalize(Number(airValue), 0, 5);

  return (
    <DashboardPanel title="Air Quality" className={className}>
      <div className="space-y-3">
        <div className="rounded-xl bg-[#dff3eb] p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-[#286d58]">{airValue ?? "--"}</p>
            </div>
            <span className="rounded-full bg-[#9fe0c4] px-3 py-1 text-xs font-semibold text-[#21634f]">
              {airStatus.label}
            </span>
          </div>
        </div>

        <SpeedMeter value={meterValue} />

        <XYChart data={airSeries} color="#f0a431" />
      </div>
    </DashboardPanel>
  );
}

export default AirQualityPanel;