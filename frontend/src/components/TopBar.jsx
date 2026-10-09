import { Menu, User as UserIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials } from "../utils/helpers.js";

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = (() => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/leaderboard") return "Leaderboard";
    if (location.pathname === "/add-activity") return "Add Activity";
    if (location.pathname === "/activity-history") return "Activity History";
    if (location.pathname === "/profile") return "Profile";
    return "FitArena";
  })();

  return (
    <header className="sticky top-0 z-30 border-b border-charcoal-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-charcoal-500 hover:bg-charcoal-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-charcoal-900">{pageTitle}</h1>
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 rounded-xl p-1.5 pr-3 transition-colors hover:bg-charcoal-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-charcoal-800">
              {user?.first_name} {user?.last_name}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
