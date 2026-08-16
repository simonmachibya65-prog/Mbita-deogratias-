"use client";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  height?: number;
}

export default function BarChart({ data, title, height = 200 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      {title && <p className="text-sm font-semibold text-navy-700 mb-3">{title}</p>}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => {
          const pct = (item.value / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-xs font-semibold text-navy-700 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </span>
              <div
                className={`w-full rounded-t-md transition-all duration-700 ${item.color ?? "bg-primary"}`}
                style={{ height: `${pct}%`, minHeight: item.value > 0 ? "4px" : "0" }}
                role="img"
                aria-label={`${item.label}: ${item.value}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-xs text-navy-500 truncate block">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
