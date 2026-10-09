import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ActivityChart({ data = [], loading }) {
  const [range, setRange] = useState("30");

  const filteredData = (() => {
    if (range === "all") return data;
    const days = parseInt(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter((d) => new Date(d.date) >= cutoff);
  })();

  if (loading) {
    return (
      <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-charcoal-100" />
        <div className="mt-6 h-64 w-full animate-pulse rounded-xl bg-charcoal-50" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-charcoal-900">Points Over Time</h3>
          <p className="mt-0.5 text-sm text-charcoal-400">Cumulative points earned</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-charcoal-50 p-1">
          {[
            { key: "7", label: "7 days" },
            { key: "30", label: "30 days" },
            { key: "all", label: "All time" },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                range === r.key
                  ? "bg-white text-charcoal-800 shadow-sm"
                  : "text-charcoal-400 hover:text-charcoal-600"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-charcoal-300">
          No activity data yet
        </div>
      ) : (
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1399d8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1399d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef1" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#84919f" }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
                stroke="#d5d9df"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#84919f" }}
                stroke="#d5d9df"
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #eceef1",
                  fontSize: "13px",
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                formatter={(v) => [`${new Intl.NumberFormat("en-US").format(v)} pts`, "Points"]}
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="#1399d8"
                strokeWidth={2.5}
                fill="url(#pointsGradient)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
