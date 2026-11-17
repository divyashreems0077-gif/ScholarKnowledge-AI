import React, { useState } from 'react';
import { ExternalLink, Plus, X } from 'lucide-react';
import { Scholarship, StudentProfile } from '../types/scholarship';
import { evaluateEligibility, formatINR } from '../engine/eligibilityEngine';
import { EligibilityStatusIndicator } from './StatusIndicator';

interface CompareScholarshipsPageProps {
  scholarships: Scholarship[];
  profile: StudentProfile;
  onViewDetails: (id: string) => void;
}

export const CompareScholarshipsPage: React.FC<CompareScholarshipsPageProps> = ({
  scholarships,
  profile,
  onViewDetails,
}) => {
  const published = scholarships.filter((s) => s.isPublished);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    published.slice(0, 3).map((s) => s.id)
  );
  const [pickerId, setPickerId] = useState<string>('');

  const selectedScholarships = selectedIds
    .map((id) => published.find((s) => s.id === id))
    .filter((s): s is Scholarship => Boolean(s));

  const remainingOptions = published.filter((s) => !selectedIds.includes(s.id));

  const addScholarship = () => {
    if (!pickerId || selectedIds.length >= 3 || selectedIds.includes(pickerId)) return;
    setSelectedIds([...selectedIds, pickerId]);
    setPickerId('');
  };

  const removeScholarship = (id: string) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  const lowestMarks = Math.min(...selectedScholarships.map((s) => s.minMarksPercent));
  const highestBenefit = Math.max(
    ...selectedScholarships.map((s) => s.maxBenefitAmount ?? 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F1E46]">Compare Scholarships</h1>
          <p className="text-sm text-slate-600 mt-1">
            Select two or three scholarships to compare eligibility thresholds, benefits, documents, and official deadlines side by side.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={pickerId}
            onChange={(e) => setPickerId(e.target.value)}
            disabled={selectedIds.length >= 3 || remainingOptions.length === 0}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white max-w-xs disabled:bg-slate-100"
          >
            <option value="">
              {selectedIds.length >= 3
                ? 'Maximum 3 scholarships selected'
                : 'Add scholarship to compare...'}
            </option>
            {remainingOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addScholarship}
            disabled={!pickerId || selectedIds.length >= 3}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 rounded-lg cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {selectedScholarships.length < 2 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-sm text-slate-600">
            Select at least two scholarships above to view a side-by-side comparison.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#F4F7FB] border-b border-slate-200">
                  <th className="py-4 px-4 text-xs font-semibold text-slate-600 w-48 align-top">
                    Comparison Criterion
                  </th>
                  {selectedScholarships.map((sch) => (
                    <th key={sch.id} className="py-4 px-4 align-top min-w-[220px]">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onViewDetails(sch.id)}
                          className="text-left font-display text-sm font-semibold text-[#0F1E46] hover:text-[#1D4ED8] cursor-pointer"
                        >
                          {sch.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeScholarship(sch.id)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 shrink-0 cursor-pointer"
                          aria-label={`Remove ${sch.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    Your Rule-Based Status
                  </td>
                  {selectedScholarships.map((sch) => {
                    const ev = evaluateEligibility(sch, profile);
                    return (
                      <td key={sch.id} className="py-3.5 px-4">
                        <EligibilityStatusIndicator status={ev.overallStatus} compact />
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">Provider</td>
                  {selectedScholarships.map((sch) => (
                    <td key={sch.id} className="py-3.5 px-4 text-slate-700">
                      {sch.provider}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    Eligible Courses
                  </td>
                  {selectedScholarships.map((sch) => (
                    <td key={sch.id} className="py-3.5 px-4 text-xs text-slate-700">
                      {sch.eligibleCourses.join(', ')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    Minimum Academic Marks
                  </td>
                  {selectedScholarships.map((sch) => (
                    <td key={sch.id} className="py-3.5 px-4 tabular-nums">
                      <span
                        className={`font-semibold ${
                          sch.minMarksPercent === lowestMarks
                            ? 'text-emerald-700'
                            : 'text-[#0F1E46]'
                        }`}
                      >
                        {sch.minMarksPercent}%
                      </span>
                      {sch.minMarksPercent === lowestMarks && (
                        <span className="ml-2 text-[11px] text-emerald-700">
                          · Most accessible
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    Maximum Family Income
                  </td>
                  {selectedScholarships.map((sch) => (
                    <td key={sch.id} className="py-3.5 px-4 font-medium text-[#0F1E46] tabular-nums">
                      {sch.maxFamilyIncome
                        ? formatINR(sch.maxFamilyIncome)
                        : 'No Income Limit'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    Scholarship Benefits
                  </td>
                  {selectedScholarships.map((sch) => (
                    <td key={sch.id} className="py-3.5 px-4">
                      <span
                        className={`text-sm ${
                          (sch.maxBenefitAmount ?? 0) === highestBenefit && highestBenefit > 0
                            ? 'font-semibold text-[#0D9488]'
                            : 'text-slate-700'
                        }`}
                      >
                        {sch.benefits}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    Required Documents
                  </td>
                  {selectedScholarships.map((sch) => (
                    <td key={sch.id} className="py-3.5 px-4 align-top">
                      <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
                        {sch.requiredDocuments.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    Application Deadline
                  </td>
                  {selectedScholarships.map((sch) => (
                    <td
                      key={sch.id}
                      className="py-3.5 px-4 font-mono text-xs font-semibold text-[#0F1E46] tabular-nums"
                    >
                      {sch.deadline}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    Official Source
                  </td>
                  {selectedScholarships.map((sch) => (
                    <td key={sch.id} className="py-3.5 px-4">
                      <a
                        href={sch.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
