import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-charcoal-200 bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-charcoal-50">
        <Icon className="h-8 w-8 text-charcoal-300" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-charcoal-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-charcoal-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
