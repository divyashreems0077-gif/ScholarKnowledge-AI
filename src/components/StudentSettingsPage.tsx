import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Shield } from 'lucide-react';

interface StudentSettingsPageProps {
  onResetDemoData: () => void;
  onSwitchToAdmin: () => void;
}

export const StudentSettingsPage: React.FC<StudentSettingsPageProps> = ({
  onResetDemoData,
  onSwitchToAdmin,
}) => {
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [verificationAlerts, setVerificationAlerts] = useState(true);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    onResetDemoData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F1E46]">Settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure portal preferences and prototype demonstration controls.
        </p>
      </div>

      {resetDone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2.5 text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Prototype knowledge base and sample student profile restored to defaults.</span>
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-[#0F1E46] pb-3 border-b border-slate-200">
          Guidance Preferences
        </h2>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-[#0F1E46]">Deadline Proximity Indicators</p>
            <p className="text-xs text-slate-500">
              Highlight saved scholarships whose deadlines fall within 30 days.
            </p>
          </div>
          <input
            type="checkbox"
            checked={deadlineAlerts}
            onChange={(e) => setDeadlineAlerts(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#1D4ED8]"
          />
        </label>

        <label className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-[#0F1E46]">
              Show Outdated Record Warnings
            </p>
            <p className="text-xs text-slate-500">
              Display explicit notices on scholarship records awaiting annual administrator verification.
            </p>
          </div>
          <input
            type="checkbox"
            checked={verificationAlerts}
            onChange={(e) => setVerificationAlerts(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#1D4ED8]"
          />
        </label>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-[#0F1E46] pb-3 border-b border-slate-200">
          Prototype & Demonstration Controls
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#0F1E46]">Administrator Dashboard</p>
            <p className="text-xs text-slate-500">
              Switch to the Administrator role to edit scholarship records, eligibility rules, and verification status.
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0F1E46] bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Open Admin Console</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div>
            <p className="text-sm font-medium text-[#0F1E46]">Reset Prototype Data</p>
            <p className="text-xs text-slate-500">
              Restore the initial 10 illustrative scholarship records, rules, and default student profile.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </section>
    </div>
  );
};
