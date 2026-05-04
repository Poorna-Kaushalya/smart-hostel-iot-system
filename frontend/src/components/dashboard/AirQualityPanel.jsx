import { useNavigate } from "react-router-dom";
import DashboardPanel from "./DashboardPanel";

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
      const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
      const y = paddingTop + plotHeight - ((d - minY) / rangeY) * plotHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `
    M ${paddingLeft},${height - paddingBottom}
    ${data
      .map((d, i) => {
        const x =
          paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
        const y =
          paddingTop + plotHeight - ((d - minY) / rangeY) * plotHeight;
        return `L ${x},${y}`;
      })
      .join(" ")}
    L ${paddingLeft + plotWidth},${height - paddingBottom}
    Z
  `;

  const yTicks = [minY, (minY + maxY) / 2, maxY];

  return (
    <div className="p-1">
      <p className="mb-2 text-sm font-medium text-slate-600">
        Air Quality Trend
      </p>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="airAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
        />
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
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
                strokeDasharray="3,3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                {tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#airAreaGradient)" />

        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) => {
          const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
          const y = paddingTop + plotHeight - ((d - minY) / rangeY) * plotHeight;

          return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
        })}
      </svg>
    </div>
  );
}

function AirQualityPanel({
  className = "",
  airQualityPpm,
  airSeries = [],
}) {
  const navigate = useNavigate();

  return (
    <DashboardPanel title="Air Quality" className={className} buttonText="">
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => navigate("/air-quality")}
          className="-mt-8 rounded-lg bg-[#5a83dc] px-3 py-1 text-xs font-semibold text-white hover:bg-[#4a74cf]"
        >
          View
        </button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-[#dff3eb] p-3">
          <p className="text-lg font-bold text-[#286d58]">
            {airQualityPpm !== null && airQualityPpm !== undefined
              ? `${Number(airQualityPpm).toFixed(1)} PPM`
              : "-- PPM"}
          </p>
        </div>

        <XYChart data={airSeries} />
      </div>
    </DashboardPanel>
  );
}

export default AirQualityPanel;