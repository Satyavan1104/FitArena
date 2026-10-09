import { NavLink, useNavigate } from "react-router-dom";
import { Home, Trophy, Plus, History, X, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials } from "../utils/helpers.js";

export default function Sidebar({ mobileNavOpen, setMobileNavOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/add-activity", icon: Plus, label: "Add Activity" },
    { to: "/activity-history", icon: History, label: "Activity History" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-900/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-charcoal-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-charcoal-900">FitArena</span>
            </div>
          </div>
          <button
            className="text-charcoal-400 hover:text-charcoal-600 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-charcoal-600 hover:bg-charcoal-50"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-charcoal-200 p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {getInitials(user?.first_name, user?.last_name)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-charcoal-800">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-charcoal-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded-xl px-3 py-2 text-sm font-medium text-charcoal-500 transition-colors hover:bg-charcoal-50 hover:text-charcoal-700"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
