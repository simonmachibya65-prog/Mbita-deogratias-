"use client";

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title?: string;
  size?: number;
}

export default function DonutChart({ data, title, size = 140 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = data.map((item) => {
    const pct = item.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const seg = { ...item, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex flex-col items-center">
      {title && <p className="text-sm font-semibold text-navy-700 mb-3">{title}</p>}
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={title ?? "Donut chart"}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f0f4f8" strokeWidth="20" />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="20"
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset + circumference / 4}
            style={{ transition: "stroke-dasharray 0.7s ease" }}
          />
        ))}
        <text x="60" y="64" textAnchor="middle" className="text-lg font-bold" fontSize="18" fill="#102a43">
          {total}
        </text>
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 justify-center">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-navy-600">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.label} ({item.value})
          </div>
        ))}
      </div>
    </div>
  );
}
