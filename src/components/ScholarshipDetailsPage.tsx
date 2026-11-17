import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckSquare,
  ClipboardCheck,
  ExternalLink,
  Info,
  ShieldCheck,
  Square,
} from 'lucide-react';
import { Scholarship, StudentProfile } from '../types/scholarship';
import {
  evaluateEligibility,
  formatINR,
  generateRuleExpressionPreview,
} from '../engine/eligibilityEngine';
import { EligibilityStatusIndicator, VerificationStatusText } from './StatusIndicator';

interface ScholarshipDetailsPageProps {
  scholarship: Scholarship;
  profile: StudentProfile;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onCheckEligibility: (id: string) => void;
  onBack: () => void;
}

export const ScholarshipDetailsPage: React.FC<ScholarshipDetailsPageProps> = ({
  scholarship,
  profile,
  isSaved,
  onToggleSave,
  onCheckEligibility,
  onBack,
}) => {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const evaluation = evaluateEligibility(scholarship, profile);

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F1E46] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore Scholarships</span>
      </button>

      {/* Overview Header Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{scholarship.providerType}</span>
              <span aria-hidden="true">·</span>
              <span>{scholarship.educationLevel}</span>
              <span aria-hidden="true">·</span>
              <span>Illustrative Prototype Record</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
              {scholarship.name}
            </h1>
            <p className="text-sm font-medium text-slate-600">{scholarship.provider}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <EligibilityStatusIndicator status={evaluation.overallStatus} />
            <VerificationStatusText status={scholarship.verificationStatus} />
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mt-4">{scholarship.description}</p>

        <div className="mt-5 p-4 bg-[#F4F7FB] border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Scholarship Benefits</p>
            <p className="text-sm font-semibold text-[#0F1E46] mt-0.5">{scholarship.benefits}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onCheckEligibility(scholarship.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Check My Eligibility</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleSave(scholarship.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                isSaved
                  ? 'border-[#1D4ED8]/40 bg-[#1D4ED8]/10 text-[#1D4ED8]'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-3.5 h-3.5" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              <span>{isSaved ? 'Saved' : 'Save Scholarship'}</span>
            </button>
            <a
              href={scholarship.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F1E46] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official Requirements vs General Guidance */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="font-display text-base font-semibold text-[#0F1E46]">
                Official Eligibility Requirements
              </h2>
              <span className="text-xs font-medium text-[#0D9488]">Structured Rule Criteria</span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Course Requirements</dt>
                <dd className="font-medium text-[#0F1E46] mt-1">
                  {scholarship.eligibleCourses.join(', ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Minimum Academic Marks</dt>
                <dd className="font-semibold text-[#0F1E46] mt-1 tabular-nums">
                  {scholarship.minMarksPercent}%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Maximum Family Income</dt>
                <dd className="font-semibold text-[#0F1E46] mt-1 tabular-nums">
                  {scholarship.maxFamilyIncome
                    ? formatINR(scholarship.maxFamilyIncome)
                    : 'No Income Ceiling'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Category Requirements</dt>
                <dd className="font-medium text-[#0F1E46] mt-1">
                  {scholarship.eligibleCategories.join(', ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">State Requirements</dt>
                <dd className="font-medium text-[#0F1E46] mt-1">
                  {scholarship.eligibleStates.join(', ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Gender Requirement</dt>
                <dd className="font-medium text-[#0F1E46] mt-1">
                  {scholarship.genderRequirement === 'Female'
                    ? 'Female candidates only'
                    : 'All genders eligible'}
                </dd>
              </div>
            </dl>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Other Mandatory Conditions & Exceptions
              </p>
              <p className="text-sm text-slate-600">
                {scholarship.specialConditions || 'No additional special conditions recorded.'}
              </p>
            </div>

            <div className="mt-4 bg-[#F4F7FB] border border-slate-200 rounded-lg p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 mb-1">
                Rule Engine Expression ({scholarship.ruleGroup.combinator} Logic)
              </p>
              <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {generateRuleExpressionPreview(scholarship)}
              </pre>
            </div>
          </section>

          {/* General Guidance clearly separated from Official Requirements */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-200">
              <Info className="w-4 h-4 text-[#1D4ED8]" />
              <h2 className="font-display text-base font-semibold text-[#0F1E46]">
                General Student Guidance (Advisory)
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {scholarship.generalGuidance}
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Note: Guidance notes assist with preparation and do not replace official scheme circulars.
            </p>
          </section>
        </div>

        {/* Right Column: Documents, Important Dates, Official Verification */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-display text-base font-semibold text-[#0F1E46] pb-3 mb-4 border-b border-slate-200">
              Required Documents Checklist
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Check off documents as you prepare your application packet:
            </p>
            <ul className="space-y-2.5">
              {scholarship.requiredDocuments.map((doc) => {
                const checked = Boolean(checkedDocs[doc]);
                return (
                  <li key={doc}>
                    <button
                      type="button"
                      onClick={() => toggleDoc(doc)}
                      className="w-full flex items-start gap-2.5 text-left text-sm text-slate-700 hover:text-[#0F1E46] cursor-pointer"
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-[#0D9488] mt-0.5 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      )}
                      <span className={checked ? 'line-through text-slate-400' : ''}>{doc}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
              <Calendar className="w-4 h-4 text-[#1D4ED8]" />
              <h2 className="font-display text-base font-semibold text-[#0F1E46]">
                Important Dates
              </h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Application Opening Date</dt>
                <dd className="font-mono font-medium text-[#0F1E46] tabular-nums">
                  {scholarship.openingDate}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Application Deadline</dt>
                <dd className="font-mono font-semibold text-rose-700 tabular-nums">
                  {scholarship.deadline}
                </dd>
              </div>
              {scholarship.otherImportantDates && (
                <div className="pt-2 border-t border-slate-100">
                  <dt className="text-xs text-slate-500">Other Relevant Dates</dt>
                  <dd className="text-xs font-medium text-slate-700 mt-0.5">
                    {scholarship.otherImportantDates}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
              <h2 className="font-display text-base font-semibold text-[#0F1E46]">
                Official Source & Verification
              </h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Official Source Link</dt>
                <dd className="mt-1">
                  <a
                    href={scholarship.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D4ED8] hover:underline break-all"
                  >
                    <span>{scholarship.officialSourceUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs text-slate-500">Last Verified Date</dt>
                <dd className="font-mono text-xs font-medium text-[#0F1E46] tabular-nums">
                  {scholarship.lastVerifiedDate}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs text-slate-500">Verification Status</dt>
                <dd>
                  <VerificationStatusText status={scholarship.verificationStatus} />
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
};
