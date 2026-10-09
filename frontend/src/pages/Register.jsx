import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Activity, User, Mail, Lock, Eye, EyeOff, Target, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const FITNESS_GOALS = [
  "Improve Fitness",
  "Build Endurance",
  "Stay Active",
  "Lose Weight",
  "General Health",
];

const getErrorMessage = (err, fallback = "Registration failed. Please try again.") => {
  const detail = err?.response?.data?.detail;

  if (!err?.response && (err?.code === "ERR_NETWORK" || err?.message === "Network Error")) {
    return "Can't connect to FitArena. Make sure the backend server is running, then try again.";
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.loc?.at(-1) || "Invalid input").join(". ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (typeof err?.message === "string" && err.message.trim()) {
    return err.message;
  }

  return fallback;
};

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    fitness_goal: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirmPassword = form.confirm_password;

    if (!firstName || !lastName) {
      setError("First name and last name are required.");
      return;
    }
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        first_name: firstName,
        last_name: lastName,
        email,
        fitness_goal: form.fitness_goal?.trim() || undefined,
      };
      if (!payload.fitness_goal) delete payload.fitness_goal;
      await register(payload);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side — Branding */}
      <div className="relative hidden w-1/2 flex-col overflow-hidden bg-charcoal-950 p-12 lg:flex">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary-500 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-primary-400 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">FitArena</span>
        </div>

        <div className="relative z-10 mt-20">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Start your<br />fitness journey.
          </h1>
          <p className="mt-4 max-w-md text-lg text-charcoal-300">
            Join the community, track activities, earn points, and climb the global leaderboard.
          </p>
          <p className="mt-3 max-w-md text-base text-charcoal-400">
            Set your goals, stay consistent, and compete with friends in a fitness arena built for progress.
          </p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex w-full items-center justify-center bg-charcoal-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-charcoal-900">FitArena</span>
          </div>

          <h2 className="text-2xl font-bold text-charcoal-900">Create your account</h2>
          <p className="mt-1 text-sm text-charcoal-400">Start tracking your fitness and compete with the community.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-charcoal-700">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-300" />
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    placeholder="John"
                    className="w-full rounded-xl border border-charcoal-200 bg-white py-3 pl-11 pr-4 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Last Name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full rounded-xl border border-charcoal-200 bg-white py-3 px-4 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-300" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-charcoal-200 bg-white py-3 pl-11 pr-4 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-charcoal-200 bg-white py-3 pl-11 pr-11 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-charcoal-200 bg-white py-3 pl-11 pr-4 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
                Fitness Goal <span className="text-charcoal-300">(optional)</span>
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-300" />
                <select
                  name="fitness_goal"
                  value={form.fitness_goal}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-charcoal-200 bg-white py-3 pl-11 pr-4 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Select a goal</option>
                  {FITNESS_GOALS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
