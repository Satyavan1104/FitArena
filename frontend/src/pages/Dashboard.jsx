import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trophy, Activity as ActivityLucide, Zap, Plus, ArrowRight } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import ActivityChart from "../components/ActivityChart.jsx";
import SportBreakdown from "../components/SportBreakdown.jsx";
import ActivityIcon from "../components/ActivityIcon.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { getGreeting, formatDate, formatPoints } from "../utils/helpers.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/users/me/dashboard");
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (error) {
    return <ErrorState message="Failed to load dashboard" onRetry={fetchDashboard} />;
  }

  const recentActivities = Array.isArray(data?.recent_activities) ? data.recent_activities : [];
  const pointsOverTime = Array.isArray(data?.points_over_time) ? data.points_over_time : [];
  const activityBreakdown = Array.isArray(data?.activity_breakdown) ? data.activity_breakdown : [];
  const hasData = data && Number(data.total_activities) > 0;
  const greeting = getGreeting();

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal-900 to-charcoal-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {greeting}, {user?.first_name}
            </h2>
            <p className="mt-1.5 text-charcoal-300">
              {hasData && data.current_rank
                ? `Keep moving. You're currently #${data.current_rank} on the leaderboard.`
                : "Log your first activity to start earning points."}
            </p>
          </div>
          <Link
            to="/add-activity"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" /> Log Activity
          </Link>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-5">
          <div className="absolute right-10 top-4 h-32 w-32 rounded-full bg-primary-400 blur-2xl" />
          <div className="absolute bottom-4 right-24 h-24 w-24 rounded-full bg-primary-300 blur-xl" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Star}
          label="Total Points"
          value={loading ? null : formatPoints(data?.total_points || 0)}
          subtext="All-time earnings"
          color="primary"
          loading={loading}
        />
        <StatCard
          icon={Trophy}
          label="Current Rank"
          value={loading ? null : (data?.current_rank ? `#${data.current_rank}` : "—")}
          subtext="Global leaderboard"
          color="warning"
          loading={loading}
        />
        <StatCard
          icon={ActivityLucide}
          label="Activities"
          value={loading ? null : data?.total_activities || 0}
          subtext="Total logged"
          color="info"
          loading={loading}
        />
        <StatCard
          icon={Zap}
          label="This Week"
          value={loading ? null : `${formatPoints(data?.weekly_points || 0)} pts`}
          subtext="Last 7 days"
          color="success"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart data={pointsOverTime} loading={loading} />
        </div>
        <div>
          <SportBreakdown data={activityBreakdown} loading={loading} />
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-charcoal-900">Recent Activities</h3>
          {hasData && (
            <Link
              to="/activity-history"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : !hasData ? (
          <EmptyState
            icon={ActivityIcon}
            title="No activities yet"
            description="Log your first activity and start earning points."
            action={
              <Link
                to="/add-activity"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" /> Log Activity
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-charcoal-100 bg-white">
            {recentActivities.map((activity, idx) => (
              <div
                key={activity.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  idx !== recentActivities.length - 1 ? "border-b border-charcoal-50" : ""
                } transition-colors hover:bg-charcoal-50/50`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <ActivityIcon type={activity.activity_type} className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold capitalize text-charcoal-800">
                    {activity.activity_type}
                  </p>
                  <p className="text-xs text-charcoal-400">{activity.normalized_metric}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-600">
                    +{formatPoints(activity.points)} pts
                  </span>
                  <p className="mt-1 text-xs text-charcoal-300">{formatDate(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
