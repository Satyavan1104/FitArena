import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Target, Calendar, Star, Trophy, Activity, LogOut, User as UserIcon, Trash2 } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials, formatDate } from "../utils/helpers.js";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/users/me");
      setProfile(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete("/users/me");
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.detail || "Failed to delete your account. Please try again.");
      setDeleting(false);
    }
  };

  if (error) {
    return <ErrorState message="Failed to load profile" onRetry={fetchProfile} />;
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <LoadingSkeleton count={1} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900">Profile</h2>
        <p className="mt-1 text-sm text-charcoal-400">Your account information and fitness stats.</p>
      </div>

      {/* Profile header */}
      <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100 text-2xl font-bold text-primary-700">
            {getInitials(profile.first_name, profile.last_name)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-charcoal-900">
              {profile.first_name} {profile.last_name}
            </h3>
            <p className="mt-0.5 text-sm text-charcoal-400">{profile.email}</p>
            {profile.fitness_goal && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                <Target className="h-3.5 w-3.5" /> {profile.fitness_goal}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-charcoal-200 px-4 py-2.5 text-sm font-medium text-charcoal-600 transition-colors hover:bg-charcoal-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-charcoal-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Star className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900">
                {new Intl.NumberFormat("en-US").format(profile.total_points)}
              </p>
              <p className="text-xs text-charcoal-400">Total Points</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-charcoal-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900">
                {profile.current_rank ? `#${profile.current_rank}` : "—"}
              </p>
              <p className="text-xs text-charcoal-400">Current Rank</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-charcoal-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
              <Activity className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900">{profile.total_activities}</p>
              <p className="text-xs text-charcoal-400">Total Activities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
        <h4 className="text-sm font-bold text-charcoal-700">Account Details</h4>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 py-2">
            <UserIcon className="h-4 w-4 text-charcoal-300" />
            <span className="text-sm text-charcoal-400">Full Name</span>
            <span className="ml-auto text-sm font-medium text-charcoal-800">
              {profile.first_name} {profile.last_name}
            </span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <Mail className="h-4 w-4 text-charcoal-300" />
            <span className="text-sm text-charcoal-400">Email</span>
            <span className="ml-auto text-sm font-medium text-charcoal-800">{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <Target className="h-4 w-4 text-charcoal-300" />
            <span className="text-sm text-charcoal-400">Fitness Goal</span>
            <span className="ml-auto text-sm font-medium text-charcoal-800">
              {profile.fitness_goal || "Not set"}
            </span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <Calendar className="h-4 w-4 text-charcoal-300" />
            <span className="text-sm text-charcoal-400">Member Since</span>
            <span className="ml-auto text-sm font-medium text-charcoal-800">
              {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <h4 className="text-sm font-bold text-red-700">Delete Account</h4>
        <p className="mt-1 text-sm text-charcoal-500">
          Permanently delete your account, activities, and leaderboard history.
        </p>
        {deleteError && (
          <p role="alert" className="mt-3 text-sm text-red-600">{deleteError}</p>
        )}
        {confirmDelete ? (
          <div className="mt-4 rounded-xl bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              This cannot be undone. Are you sure you want to permanently delete your account and all its data?
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-xl border border-charcoal-200 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-600 transition-colors hover:bg-charcoal-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Permanently delete"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setConfirmDelete(true);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Delete Account
          </button>
        )}
      </div>
    </div>
  );
}
