function Sparkline({ data = [], color = "#4b7bec", height = 100 }) {
  if (!data.length) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl bg-white text-sm text-slate-400">
        No data
      </div>
    );
  }

  const width = 320;
  const padding = 30;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Convert data to points
  const points = data
    .map((d, i) => {
      const x =
        padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((d - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  // Y-axis ticks 
  const yTicks = [min, (min + max) / 2, max];

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Y Axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#cbd5f5"
          strokeWidth="1"
        />

        {/* X Axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5f5"
          strokeWidth="1"
        />

        {/* Y Axis Labels */}
        {yTicks.map((val, i) => {
          const y =
            height -
            padding -
            ((val - min) / range) * (height - padding * 2);

          return (
            <g key={i}>
              <text
                x={5}
                y={y + 4}
                fontSize="10"
                fill="#64748b"
              >
                {val.toFixed(0)}
              </text>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((_, i) => {
          if (i % Math.ceil(data.length / 5) !== 0) return null;

          const x =
            padding + (i / (data.length - 1)) * (width - padding * 2);

          return (
            <text
              key={i}
              x={x}
              y={height - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {i}
            </text>
          );
        })}

        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          points={points}
        />

        {/* Dots */}
        {data.map((d, i) => {
          const x =
            padding + (i / (data.length - 1)) * (width - padding * 2);
          const y =
            height -
            padding -
            ((d - min) / range) * (height - padding * 2);

          return (
            <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
          );
        })}
      </svg>
    </div>
  );
}

export default Sparkline;