import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Footprints, PersonStanding, Bike, Waves, Dumbbell, Check, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import api from "../services/api.js";
import { ACTIVITY_CONFIG, previewPoints, formatPoints } from "../utils/helpers.js";

const ICON_MAP = {
  running: Footprints,
  walking: PersonStanding,
  cycling: Bike,
  swimming: Waves,
  gym: Dumbbell,
  steps: Footprints,
};

const ACTIVITY_TYPES = ["running", "walking", "cycling", "swimming", "gym", "steps"];

function getErrorMessage(err, fallback, activityTypes = []) {
  const detail = err?.response?.data?.detail;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((issue) => {
        const activityIndex = issue?.loc?.find((part) => Number.isInteger(part));
        const activityType = Number.isInteger(activityIndex) ? activityTypes[activityIndex] : null;
        const label = activityType ? `${ACTIVITY_CONFIG[activityType].label}: ` : "";
        const message = typeof issue?.msg === "string" ? issue.msg.replace(/^Value error, /, "") : "Invalid input";
        return `${label}${message}`;
      })
      .join(". ");
  }

  if (err?.message === "Network Error") {
    return "Can't connect to FitArena. Check that the backend server is running, then try again.";
  }

  return fallback;
}

function validateActivityPayload(payload) {
  if (payload.distance_km !== undefined && payload.distance_km < 0) {
    return "Distance cannot be negative.";
  }
  if (payload.duration_minutes !== undefined && payload.duration_minutes < 0) {
    return "Duration minutes cannot be negative.";
  }
  if (payload.duration_seconds !== undefined && payload.duration_seconds < 0) {
    return "Seconds cannot be negative.";
  }
  if (payload.steps !== undefined && payload.steps < 0) {
    return "Steps cannot be negative.";
  }
  return "";
}

export default function AddActivity() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("single");
  const [singleActivity, setSingleActivity] = useState("running");
  const [singleValues, setSingleValues] = useState({});
  const [multiSelected, setMultiSelected] = useState({});
  const [multiValues, setMultiValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const resetForm = () => {
    setSingleValues({});
    setMultiSelected({});
    setMultiValues({});
  };

  const buildPayload = (activityType, values) => {
    const config = ACTIVITY_CONFIG[activityType];
    const payload = { activity_type: activityType };
    if (config.metricType === "distance") {
      payload.distance_km = parseFloat(values.distance_km) || 0;
    } else if (config.metricType === "duration") {
      const minutes = parseInt(values.duration_minutes, 10) || 0;
      const seconds = parseInt(values.duration_seconds, 10) || 0;
      payload.duration_minutes = seconds < 0 ? minutes : minutes + Math.floor(seconds / 60);
      payload.duration_seconds = seconds < 0 ? seconds : seconds % 60;
    } else if (config.metricType === "steps") {
      payload.steps = parseInt(values.steps) || 0;
    }
    return payload;
  };

  const handleSingleSubmit = async () => {
    setError("");
    const payload = buildPayload(singleActivity, singleValues);
    const validationError = validateActivityPayload(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/activities", payload);
      setSuccess({
        activities: [{ activity_type: res.data.activity_type, points: res.data.points }],
        total_points_earned: res.data.points,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add activity", [singleActivity]));
    } finally {
      setLoading(false);
    }
  };

  const handleMultiSubmit = async () => {
    setError("");
    const selected = ACTIVITY_TYPES.filter((t) => multiSelected[t]);
    if (selected.length === 0) {
      setError("Select at least one activity");
      return;
    }

    const activities = selected.map((t) => buildPayload(t, multiValues[t] || {}));
    const validationError = activities
      .map((activity) => validateActivityPayload(activity))
      .find(Boolean);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/activities/bulk", { activities });
      setSuccess({
        activities: res.data.activities,
        total_points_earned: res.data.total_points_earned,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add activities", selected));
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center pb-20 lg:pb-6">
        <div className="w-full max-w-md animate-scale-in rounded-2xl border border-charcoal-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <Sparkles className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-charcoal-900">Activities Added!</h2>
          <p className="mt-1 text-sm text-charcoal-400">You've earned:</p>
          <p className="mt-2 text-4xl font-bold text-primary-600">
            +{formatPoints(success.total_points_earned)} Points
          </p>

          <div className="mt-6 space-y-2 rounded-xl bg-charcoal-50 p-4 text-left">
            {success.activities.map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-charcoal-600">{a.activity_type}</span>
                <span className="text-sm font-semibold text-emerald-600">+{formatPoints(a.points)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setSuccess(null);
                resetForm();
              }}
              className="flex-1 rounded-xl border border-charcoal-200 bg-white py-3 text-sm font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-50"
            >
              Add More
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900">Log Your Activities</h2>
        <p className="mt-1 text-sm text-charcoal-400">Record one activity or multiple activities at once.</p>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex gap-1 rounded-xl bg-charcoal-100 p-1">
        <button
          onClick={() => setMode("single")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
            mode === "single" ? "bg-white text-charcoal-800 shadow-sm" : "text-charcoal-400"
          }`}
        >
          Single Activity
        </button>
        <button
          onClick={() => setMode("multiple")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
            mode === "multiple" ? "bg-white text-charcoal-800 shadow-sm" : "text-charcoal-400"
          }`}
        >
          Multiple Activities
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {mode === "single" ? (
        <SingleActivityForm
          activity={singleActivity}
          setActivity={setSingleActivity}
          values={singleValues}
          setValues={setSingleValues}
          loading={loading}
          onSubmit={handleSingleSubmit}
        />
      ) : (
        <MultiActivityForm
          selected={multiSelected}
          setSelected={setMultiSelected}
          values={multiValues}
          setValues={setMultiValues}
          loading={loading}
          onSubmit={handleMultiSubmit}
        />
      )}
    </div>
  );
}

function ActivityFields({ activityType, values, setValues }) {
  const config = ACTIVITY_CONFIG[activityType];

  const handleChange = (field, val) => {
    setValues({ ...values, [field]: val });
  };

  if (config.metricType === "distance") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Distance (km)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={values.distance_km || ""}
          onChange={(e) => handleChange("distance_km", e.target.value)}
          placeholder="0.0"
          className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>
    );
  }

  if (config.metricType === "duration") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Minutes</label>
          <input
            type="number"
            min="0"
            value={values.duration_minutes || ""}
            onChange={(e) => handleChange("duration_minutes", e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Seconds (60+ adds minutes)</label>
          <input
            type="number"
            min="0"
            value={values.duration_seconds || ""}
            onChange={(e) => handleChange("duration_seconds", e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>
    );
  }

  if (config.metricType === "steps") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Steps</label>
        <input
          type="number"
          min="0"
          step="1"
          value={values.steps || ""}
          onChange={(e) => handleChange("steps", e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>
    );
  }

  return null;
}

function PointsPreview({ activityType, values }) {
  const points = previewPoints(activityType, values);
  if (points === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
      <span className="text-sm font-medium text-primary-700">Estimated Points</span>
      <span className="text-lg font-bold text-primary-700">+{formatPoints(points)} pts</span>
    </div>
  );
}

function SingleActivityForm({ activity, setActivity, values, setValues, loading, onSubmit }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
        <div className="mb-5">
          <label className="mb-3 block text-sm font-medium text-charcoal-700">Activity Type</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACTIVITY_TYPES.map((type) => {
              const Icon = ICON_MAP[type];
              const isSelected = activity === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setActivity(type);
                    setValues({});
                  }}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary-400 bg-primary-50"
                      : "border-charcoal-200 hover:border-charcoal-300"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? "text-primary-600" : "text-charcoal-400"}`} />
                  <span className={`text-sm font-medium ${isSelected ? "text-primary-700" : "text-charcoal-600"}`}>
                    {ACTIVITY_CONFIG[type].label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <ActivityFields activityType={activity} values={values} setValues={setValues} />
          <PointsPreview activityType={activity} values={values} />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Add Activity <ArrowRight className="h-4 w-4" /></>}
      </button>
    </div>
  );
}

function MultiActivityForm({ selected, setSelected, values, setValues, loading, onSubmit }) {
  const toggleActivity = (type) => {
    setSelected({ ...selected, [type]: !selected[type] });
  };

  const selectedList = ACTIVITY_TYPES.filter((t) => selected[t]);
  const totalPoints = selectedList.reduce((sum, t) => sum + previewPoints(t, values[t] || {}), 0);

  const setActivityValues = (type, vals) => {
    setValues({ ...values, [type]: vals });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Activity selection cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIVITY_TYPES.map((type) => {
          const Icon = ICON_MAP[type];
          const isSelected = selected[type];
          return (
            <button
              key={type}
              onClick={() => toggleActivity(type)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isSelected ? "border-primary-400 bg-primary-50" : "border-charcoal-200 bg-white hover:border-charcoal-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-6 w-6 ${isSelected ? "text-primary-600" : "text-charcoal-400"}`} />
                <div className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  isSelected ? "border-primary-600 bg-primary-600" : "border-charcoal-300"
                }`}>
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
              </div>
              <p className={`mt-2 text-sm font-semibold ${isSelected ? "text-primary-700" : "text-charcoal-700"}`}>
                {ACTIVITY_CONFIG[type].label}
              </p>
              <p className="text-xs text-charcoal-400">{ACTIVITY_CONFIG[type].description}</p>
            </button>
          );
        })}
      </div>

      {/* Expanded input sections */}
      {selectedList.length > 0 && (
        <div className="space-y-4">
          {selectedList.map((type) => (
            <div key={type} className="rounded-2xl border border-primary-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  {(() => {
                    const Icon = ICON_MAP[type];
                    return <Icon className="h-4 w-4 text-primary-600" />;
                  })()}
                </div>
                <span className="text-sm font-bold uppercase tracking-wide text-charcoal-700">
                  {ACTIVITY_CONFIG[type].label}
                </span>
              </div>
              <ActivityFields
                activityType={type}
                values={values[type] || {}}
                setValues={(vals) => setActivityValues(type, vals)}
              />
              <div className="mt-3">
                <PointsPreview activityType={type} values={values[type] || {}} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Summary */}
      {selectedList.length > 0 && (
        <div className="rounded-2xl border border-charcoal-100 bg-charcoal-50/50 p-5">
          <h4 className="text-sm font-bold text-charcoal-700">Activity Summary</h4>
          <div className="mt-3 space-y-2">
            {selectedList.map((type) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="font-medium text-charcoal-600">{ACTIVITY_CONFIG[type].label}</span>
                <span className="font-semibold text-emerald-600">
                  +{formatPoints(previewPoints(type, values[type] || {}))} pts
                </span>
              </div>
            ))}
            <div className="my-2 border-t border-charcoal-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-charcoal-800">Total</span>
              <span className="text-lg font-bold text-primary-600">+{formatPoints(totalPoints)} pts</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading || selectedList.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Submit Activities <ArrowRight className="h-4 w-4" /></>}
      </button>
    </div>
  );
}
