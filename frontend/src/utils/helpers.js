// Frontend scoring preview — for UX only. Backend is source of truth.

export const ACTIVITY_CONFIG = {
  running: {
    label: "Running",
    icon: "Footprints",
    color: "#1399d8",
    description: "Distance-based cardio",
    metricType: "distance",
    unit: "km",
    rate: 100,
  },
  walking: {
    label: "Walking",
    icon: "PersonStanding",
    color: "#2bb8f5",
    description: "Steady daily movement",
    metricType: "distance",
    unit: "km",
    rate: 50,
  },
  cycling: {
    label: "Cycling",
    icon: "Bike",
    color: "#56d0ff",
    description: "Road or stationary ride",
    metricType: "distance",
    unit: "km",
    rate: 25,
  },
  swimming: {
    label: "Swimming",
    icon: "Waves",
    color: "#8de5ff",
    description: "Pool or open water laps",
    metricType: "duration",
    unit: "min",
    rate: 15,
  },
  gym: {
    label: "Gym",
    icon: "Dumbbell",
    color: "#647187",
    description: "Strength training session",
    metricType: "duration",
    unit: "min",
    rate: 5,
  },
  steps: {
    label: "Daily Steps",
    icon: "Footprints",
    color: "#505a6e",
    description: "Everyday walking steps",
    metricType: "steps",
    unit: "steps",
    rate: 1,
  },
};

export function previewPoints(activityType, values) {
  const config = ACTIVITY_CONFIG[activityType];
  if (!config) return 0;

  if (config.metricType === "distance") {
    const km = parseFloat(values.distance_km) || 0;
    return Math.floor(km * config.rate);
  }
  if (config.metricType === "duration") {
    const minutes = parseInt(values.duration_minutes, 10) || 0;
    const seconds = parseInt(values.duration_seconds, 10) || 0;
    return (minutes + Math.floor(Math.max(seconds, 0) / 60)) * config.rate;
  }
  if (config.metricType === "steps") {
    const steps = parseInt(values.steps) || 0;
    return Math.floor(steps / 100) * config.rate;
  }
  return 0;
}

export function formatPoints(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
