import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter, Search, ArrowLeft } from "lucide-react";
import api from "../services/api.js";
import ActivityIcon from "../components/ActivityIcon.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { TableSkeleton } from "../components/LoadingSkeleton.jsx";
import { formatDate, formatPoints } from "../utils/helpers.js";

const ACTIVITY_FILTERS = ["all", "running", "walking", "cycling", "swimming", "gym", "steps"];

export default function ActivityHistory() {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = { page, page_size: pageSize };
      if (filter !== "all") params.activity_type = filter;
      const res = await api.get("/users/me/activities", { params });
      setActivities(res.data.activities);
      setTotal(res.data.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, filter]);

  const filteredActivities = useMemo(() => {
    if (!search) return activities;
    return activities.filter((a) =>
      a.activity_type.toLowerCase().includes(search.toLowerCase()) ||
      a.normalized_metric?.toLowerCase().includes(search.toLowerCase())
    );
  }, [activities, search]);

  const totalPages = Math.ceil(total / pageSize);

  if (error) {
    return <ErrorState message="Failed to load activity history" onRetry={fetchActivities} />;
  }

  const hasData = total > 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900">Activity History</h2>
          <p className="mt-1 text-sm text-charcoal-400">View and filter your past activities.</p>
        </div>
        {filter !== "all" && (
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setPage(1);
              setSearch("");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-charcoal-200 bg-white px-3 py-2 text-sm font-medium text-charcoal-700 transition-colors hover:bg-charcoal-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : !hasData ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activities yet"
          description="Your activity history will appear here once you log your first activity."
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
        <>
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    filter === f
                      ? "bg-primary-600 text-white"
                      : "bg-charcoal-100 text-charcoal-500 hover:bg-charcoal-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities..."
                className="w-full rounded-xl border border-charcoal-200 bg-white py-2.5 pl-10 pr-4 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:w-64"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-charcoal-100 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-400">Activity</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-400">Metric</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-400">Points</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-sm text-charcoal-300">
                        No activities match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="border-b border-charcoal-50 transition-colors hover:bg-charcoal-50/50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                              <ActivityIcon type={activity.activity_type} className="h-4 w-4 text-primary-600" />
                            </div>
                            <span className="text-sm font-semibold capitalize text-charcoal-800">
                              {activity.activity_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-charcoal-500">{activity.normalized_metric}</td>
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-600">
                            +{formatPoints(activity.points)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-charcoal-400">
                          {formatDate(activity.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-charcoal-400">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-charcoal-200 px-4 py-2 text-sm font-medium text-charcoal-600 transition-colors hover:bg-charcoal-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-charcoal-200 px-4 py-2 text-sm font-medium text-charcoal-600 transition-colors hover:bg-charcoal-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
