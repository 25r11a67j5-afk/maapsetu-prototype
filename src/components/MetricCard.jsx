import React from 'react';

export default function MetricCard({ title, value, subtitle, borderColor = "blue", icon: Icon }) {
  const borderStyles = {
    blue: "border-l-4 border-l-blue-500",
    green: "border-l-4 border-l-emerald-500",
    amber: "border-l-4 border-l-amber-500",
    purple: "border-l-4 border-l-purple-500",
  }[borderColor] || "border-l-4 border-l-blue-500";

  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 ${borderStyles} flex items-center justify-between transition-all hover:shadow-md`}>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-navy-900">{value}</span>
          {subtitle && <span className="text-xs text-slate-400 font-medium">{subtitle}</span>}
        </div>
      </div>
      {Icon && (
        <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
