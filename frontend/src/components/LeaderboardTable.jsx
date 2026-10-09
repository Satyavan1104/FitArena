import { Trophy, ArrowUp, ArrowDown, Minus, Crown } from "lucide-react";
import ActivityIcon from "./ActivityIcon.jsx";

export function Podium({ data }) {
  if (!data || data.length === 0) return null;

  const order = [1, 0, 2];
  const podiumData = order
    .map((i) => data[i])
    .filter(Boolean);

  const heights = ["h-32", "h-40", "h-28"];
  const colors = ["bg-amber-50 border-amber-200", "bg-primary-50 border-primary-200", "bg-orange-50 border-orange-200"];
  const iconColors = ["text-amber-500", "text-primary-500", "text-orange-400"];
  const labels = ["2nd", "1st", "3rd"];

  return (
    <div className="flex items-end justify-center gap-3 rounded-2xl border border-charcoal-100 bg-white p-6 sm:gap-6">
      {podiumData.map((user, idx) => {
        const realIdx = order[idx];
        const height = heights[idx];
        const color = colors[idx];
        const iconColor = iconColors[idx];
        const label = labels[idx];

        return (
          <div key={user.user_id} className="flex flex-1 flex-col items-center" style={{ maxWidth: "200px" }}>
            <div className="relative mb-3">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${color} text-xl font-bold ${iconColor}`}
              >
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              {realIdx === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-charcoal-800">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-charcoal-400">{new Intl.NumberFormat("en-US").format(user.total_points)} pts</p>
            <div className={`mt-3 flex w-full ${height} flex-col items-center justify-start rounded-xl border ${color} pt-3`}>
              <span className={`text-2xl font-bold ${iconColor}`}>{user.rank}</span>
              <span className="text-xs font-medium text-charcoal-400">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LeaderboardTable({ data, currentUserId }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-charcoal-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-400">Rank</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-400">User</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-400">Points</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-400">Activities</th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-charcoal-400">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => {
              const isCurrentUser = user.user_id === currentUserId;
              return (
                <tr
                  key={user.user_id}
                  className={`border-b border-charcoal-50 transition-colors hover:bg-charcoal-50/50 ${
                    isCurrentUser ? "bg-primary-50/40" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-sm font-bold text-charcoal-800">
                      {user.rank <= 3 && <Trophy className="h-4 w-4 text-amber-400" />}
                      #{user.rank}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal-800">
                          {user.first_name} {user.last_name}
                          {isCurrentUser && <span className="ml-2 text-xs text-primary-600">(You)</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-bold text-charcoal-900">
                      {new Intl.NumberFormat("en-US").format(user.total_points)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-charcoal-500">{user.activity_count}</td>
                  <td className="px-5 py-4 text-center">
                    {user.trend > 0 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                        <ArrowUp className="h-3 w-3" /> {user.trend}
                      </span>
                    ) : user.trend < 0 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-500">
                        <ArrowDown className="h-3 w-3" /> {Math.abs(user.trend)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-lg bg-charcoal-50 px-2 py-1 text-xs font-semibold text-charcoal-400">
                        <Minus className="h-3 w-3" /> —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
