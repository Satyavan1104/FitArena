import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-4 shadow-lg transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      <div>
        <p className="text-sm font-semibold text-charcoal-800">{toast.title}</p>
        {toast.message && <p className="text-xs text-charcoal-400">{toast.message}</p>}
      </div>
      <button onClick={onClose} className="ml-2 text-charcoal-300 hover:text-charcoal-500">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
