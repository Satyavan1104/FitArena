import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, subtext, trend, color = "primary", loading }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    if (loading || value === null || value === undefined) return;
    const target = typeof value === "string" ? parseInt(value.replace(/[^0-9]/g, "")) || 0 : value;
    const start = prevValue.current;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
      else prevValue.current = target;
    };

    requestAnimationFrame(animate);
  }, [value, loading]);

  const colorClasses = {
    primary: { bg: "bg-primary-50", icon: "text-primary-600", iconBg: "bg-primary-100" },
    success: { bg: "bg-emerald-50", icon: "text-emerald-600", iconBg: "bg-emerald-100" },
    warning: { bg: "bg-amber-50", icon: "text-amber-600", iconBg: "bg-amber-100" },
    info: { bg: "bg-sky-50", icon: "text-sky-600", iconBg: "bg-sky-100" },
  };
  const c = colorClasses[color] || colorClasses.primary;

  if (loading) {
    return (
      <div className="rounded-2xl border border-charcoal-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-charcoal-100" />
          <div className="h-5 w-16 animate-pulse rounded bg-charcoal-100" />
        </div>
        <div className="mt-4 h-8 w-24 animate-pulse rounded bg-charcoal-100" />
        <div className="mt-2 h-4 w-20 animate-pulse rounded bg-charcoal-100" />
      </div>
    );
  }

  const formattedValue = typeof value === "string" ? value : new Intl.NumberFormat("en-US").format(displayValue);

  return (
    <div className="group rounded-2xl border border-charcoal-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg}`}>
          <Icon className={`h-6 w-6 ${c.icon}`} />
        </div>
        {trend !== undefined && trend !== null && (
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              trend > 0
                ? "bg-emerald-50 text-emerald-600"
                : trend < 0
                ? "bg-red-50 text-red-500"
                : "bg-charcoal-50 text-charcoal-400"
            }`}
          >
            {trend > 0 && <TrendingUp className="h-3 w-3" />}
            {trend < 0 && <TrendingDown className="h-3 w-3" />}
            {trend === 0 && <Minus className="h-3 w-3" />}
            {trend > 0 ? `+${trend}` : trend < 0 ? `${trend}` : "—"}
          </div>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-charcoal-900">{formattedValue}</p>
      <p className="mt-1 text-sm text-charcoal-400">{label}</p>
      {subtext && <p className="mt-0.5 text-xs text-charcoal-300">{subtext}</p>}
    </div>
  );
}
