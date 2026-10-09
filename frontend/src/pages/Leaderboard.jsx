import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Plus, Users } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Podium, LeaderboardTable } from "../components/LeaderboardTable.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { TableSkeleton } from "../components/LoadingSkeleton.jsx";

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/leaderboard");
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (error) {
    return <ErrorState message="Failed to load leaderboard" onRetry={fetchLeaderboard} />;
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-charcoal-100" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-charcoal-100" />
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900">Global Leaderboard</h2>
          <p className="mt-1 text-sm text-charcoal-400">See how you stack up against the community.</p>
        </div>
        <EmptyState
          icon={Trophy}
          title="The leaderboard is waiting for its first challenger."
          description="Be the first to join the leaderboard by logging an activity."
          action={
            <Link
              to="/add-activity"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" /> Log Your First Activity
            </Link>
          }
        />
      </div>
    );
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900">Global Leaderboard</h2>
        <p className="mt-1 text-sm text-charcoal-400">See how you stack up against the community.</p>
      </div>

      {top3.length > 0 && (
        <div className="animate-slide-up">
          <Podium data={top3} />
        </div>
      )}

      {rest.length > 0 ? (
        <LeaderboardTable data={rest} currentUserId={user?.id} />
      ) : (
        <div className="rounded-2xl border border-charcoal-100 bg-white p-6 text-center">
          <Users className="mx-auto h-8 w-8 text-charcoal-300" />
          <p className="mt-2 text-sm text-charcoal-400">Only top 3 players so far. Keep climbing!</p>
        </div>
      )}
    </div>
  );
}
