import React from 'react';
import { BookmarkX, Compass, Trash2 } from 'lucide-react';
import { Scholarship, StudentProfile } from '../types/scholarship';
import { evaluateEligibility } from '../engine/eligibilityEngine';
import { EligibilityStatusIndicator } from './StatusIndicator';

interface SavedScholarshipsPageProps {
  scholarships: Scholarship[];
  savedIds: string[];
  profile: StudentProfile;
  onRemoveSaved: (id: string) => void;
  onViewDetails: (id: string) => void;
  onCheckEligibility: (id: string) => void;
  onExplore: () => void;
}

export const SavedScholarshipsPage: React.FC<SavedScholarshipsPageProps> = ({
  scholarships,
  savedIds,
  profile,
  onRemoveSaved,
  onViewDetails,
  onCheckEligibility,
  onExplore,
}) => {
  const savedList = scholarships.filter((s) => savedIds.includes(s.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F1E46]">Saved Scholarships</h1>
        <p className="text-sm text-slate-600 mt-1">
          Bookmarked scholarship opportunities with live deadlines and rule-evaluated eligibility status.
        </p>
      </div>

      {savedList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#F4F7FB] border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <BookmarkX className="w-6 h-6" />
          </div>
          <h2 className="font-display text-lg font-semibold text-[#0F1E46]">
            No Saved Scholarships Yet
          </h2>
          <p className="text-sm text-slate-600 mt-1.5">
            Bookmark scholarships while exploring the knowledge base to track their deadlines and prepare documents in one place.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Scholarships</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedList.map((sch) => {
            const evaluation = evaluateEligibility(sch, profile);
            return (
              <div
                key={sch.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-slate-500">{sch.providerType}</span>
                    <EligibilityStatusIndicator status={evaluation.overallStatus} compact />
                  </div>

                  <h2 className="font-display text-base font-semibold text-[#0F1E46]">
                    {sch.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">{sch.provider}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Deadline</span>
                    <span className="font-mono font-semibold text-[#0F1E46] tabular-nums">
                      {sch.deadline}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onViewDetails(sch.id)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] rounded-lg transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onCheckEligibility(sch.id)}
                    className="py-2 px-3 text-xs font-semibold text-[#1D4ED8] border border-[#1D4ED8]/30 hover:bg-[#1D4ED8]/5 rounded-lg cursor-pointer"
                  >
                    Check
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSaved(sch.id)}
                    className="p-2 text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Remove from Saved"
                    aria-label="Remove from Saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
