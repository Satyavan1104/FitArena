import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#1399d8", "#2bb8f5", "#56d0ff", "#8de5ff", "#647187", "#b0b7c2"];

export default function SportBreakdown({ data = [], loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-charcoal-100" />
        <div className="mt-6 h-48 w-full animate-pulse rounded-xl bg-charcoal-50" />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.activity_type.charAt(0).toUpperCase() + d.activity_type.slice(1),
    value: d.percentage,
    points: d.points,
  }));

  return (
    <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
      <h3 className="text-base font-bold text-charcoal-900">Activity Breakdown</h3>
      <p className="mt-0.5 text-sm text-charcoal-400">Points distribution by sport</p>

      {chartData.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-charcoal-300">
          No activity data yet
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-4">
          <div className="h-52 w-52 md:h-56 md:w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={2}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #eceef1",
                    fontSize: "13px",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  }}
                  formatter={(value, name, props) => [
                    `${value}% (${new Intl.NumberFormat("en-US").format(props.payload.points)} pts)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-2">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-lg bg-charcoal-50 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate text-sm font-medium text-charcoal-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-charcoal-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
