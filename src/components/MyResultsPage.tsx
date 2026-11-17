import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { OverallEligibilityStatus, Scholarship, StudentProfile } from '../types/scholarship';
import { evaluateEligibility, formatINR } from '../engine/eligibilityEngine';
import { EligibilityStatusIndicator } from './StatusIndicator';

interface MyResultsPageProps {
  scholarships: Scholarship[];
  profile: StudentProfile;
  onCheckEligibility: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const MyResultsPage: React.FC<MyResultsPageProps> = ({
  scholarships,
  profile,
  onCheckEligibility,
  onViewDetails,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | OverallEligibilityStatus>('ALL');

  const evaluations = scholarships
    .filter((s) => s.isPublished)
    .map((sch) => ({
      scholarship: sch,
      result: evaluateEligibility(sch, profile),
    }));

  const filtered =
    statusFilter === 'ALL'
      ? evaluations
      : evaluations.filter((e) => e.result.overallStatus === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F1E46]">My Eligibility Results</h1>
          <p className="text-sm text-slate-600 mt-1">
            Rule-based evaluation matrix across all published scholarships for your current profile.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg self-start">
          {(['ALL', 'Eligible', 'Needs Verification', 'Not Eligible'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-[#0F1E46] text-white'
                  : 'text-slate-600 hover:text-[#0F1E46]'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F7FB] border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Scholarship</th>
                <th className="py-3 px-4">Income Cap</th>
                <th className="py-3 px-4">Min Marks</th>
                <th className="py-3 px-4">Rules Passed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filtered.map(({ scholarship, result }) => (
                <tr key={scholarship.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => onViewDetails(scholarship.id)}
                      className="text-left font-semibold text-[#0F1E46] hover:text-[#1D4ED8] cursor-pointer"
                    >
                      {scholarship.name}
                    </button>
                    <p className="text-xs text-slate-500 mt-0.5">{result.summary}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700 tabular-nums whitespace-nowrap">
                    {scholarship.maxFamilyIncome
                      ? formatINR(scholarship.maxFamilyIncome)
                      : 'None'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700 tabular-nums whitespace-nowrap">
                    {scholarship.minMarksPercent}%
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-[#0F1E46] tabular-nums whitespace-nowrap">
                    {result.satisfiedCount} / {result.conditionResults.length}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <EligibilityStatusIndicator status={result.overallStatus} compact />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onCheckEligibility(scholarship.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                    >
                      <span>View Breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
