import React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = "bg-white/95 text-neutral-800 border-neutral-200 shadow-xl shadow-neutral-900/5";
        let Icon = Info;
        let iconColor = "text-sky-500";

        if (toast.type === "success") {
          bgClass = "bg-emerald-950/90 text-emerald-50 border-emerald-700/60 shadow-xl shadow-emerald-950/20";
          Icon = CheckCircle2;
          iconColor = "text-emerald-400";
        } else if (toast.type === "error") {
          bgClass = "bg-rose-950/90 text-rose-50 border-rose-700/60 shadow-xl shadow-rose-950/20";
          Icon = AlertCircle;
          iconColor = "text-rose-400";
        } else if (toast.type === "warning") {
          bgClass = "bg-amber-950/90 text-amber-50 border-amber-700/60 shadow-xl shadow-amber-950/20";
          Icon = AlertTriangle;
          iconColor = "text-amber-400";
        } else {
          bgClass = "bg-neutral-900/90 text-white border-neutral-700/60 shadow-xl shadow-black/20";
          Icon = Info;
          iconColor = "text-blue-400";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-bottom-2 ${bgClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-white transition-colors p-0.5 rounded-lg -mr-1 -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
