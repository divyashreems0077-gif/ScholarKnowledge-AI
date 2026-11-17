import React from 'react';
import {
  ArrowRight,
  ClipboardCheck,
  Compass,
  MessageSquareText,
  UserCheck,
} from 'lucide-react';
import { PageRoute, Scholarship, StudentProfile } from '../types/scholarship';
import {
  evaluateEligibility,
  formatINR,
  getProfileCompletion,
} from '../engine/eligibilityEngine';
import { EligibilityStatusIndicator } from './StatusIndicator';

interface StudentDashboardProps {
  studentName: string;
  profile: StudentProfile;
  scholarships: Scholarship[];
  savedIds: string[];
  onNavigate: (route: PageRoute) => void;
  onViewDetails: (scholarshipId: string) => void;
  onCheckEligibility: (scholarshipId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentName,
  profile,
  scholarships,
  savedIds,
  onNavigate,
  onViewDetails,
  onCheckEligibility,
}) => {
  const published = scholarships.filter((s) => s.isPublished);
  const evaluations = published.map((sch) => ({
    scholarship: sch,
    result: evaluateEligibility(sch, profile),
  }));

  const eligibleCount = evaluations.filter((e) => e.result.overallStatus === 'Eligible').length;
  const verifyCount = evaluations.filter(
    (e) => e.result.overallStatus === 'Needs Verification'
  ).length;
  const completion = getProfileCompletion(profile);

  // Recommend 3 scholarships prioritizing Eligible first, then Needs Verification
  const recommended = [...evaluations]
    .sort((a, b) => {
      const rank = { Eligible: 0, 'Needs Verification': 1, 'Not Eligible': 2 };
      return rank[a.result.overallStatus] - rank[b.result.overallStatus];
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
            Welcome back, {studentName}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Discover scholarship opportunities that match your academic journey.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Illustrative Sample Prototype · Eligibility counts reflect live rule-engine evaluation of your saved profile.
          </p>
        </div>

        <div className="w-full lg:w-80 bg-[#F4F7FB] border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#0F1E46] mb-2">
            <span>Profile Completion</span>
            <span className="tabular-nums">{completion.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {completion.missingLabels.length === 0
                ? 'All profile criteria filled'
                : `${completion.missingLabels.length} field(s) remaining`}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('student-profile')}
              className="font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Eligibility Summary</h2>
          <span className="text-xs text-slate-500">Sample Data Metrics</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Scholarships Available</p>
            <p className="font-display text-3xl font-bold text-[#0F1E46] mt-2 tabular-nums">
              {published.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Active records in knowledge base</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Eligible Scholarships</p>
            <p className="font-display text-3xl font-bold text-emerald-700 mt-2 tabular-nums">
              {eligibleCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">All mandatory rules satisfied</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Needs Verification</p>
            <p className="font-display text-3xl font-bold text-amber-600 mt-2 tabular-nums">
              {verifyCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Missing data or manual check</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Saved Scholarships</p>
            <p className="font-display text-3xl font-bold text-[#1D4ED8] mt-2 tabular-nums">
              {savedIds.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Bookmarked for application</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#0F1E46] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('student-profile')}
            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#0F1E46] bg-[#F4F7FB] hover:bg-slate-200/70 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <span>Complete My Profile</span>
            <UserCheck className="w-4 h-4 text-[#1D4ED8]" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('check-eligibility')}
            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer"
          >
            <span>Check Eligibility</span>
            <ClipboardCheck className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('explore-scholarships')}
            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#0F1E46] bg-[#F4F7FB] hover:bg-slate-200/70 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <span>Explore Scholarships</span>
            <Compass className="w-4 h-4 text-[#0D9488]" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('ask-assistant')}
            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#0F1E46] bg-[#F4F7FB] hover:bg-slate-200/70 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <span>Ask a Question</span>
            <MessageSquareText className="w-4 h-4 text-[#1D4ED8]" />
          </button>
        </div>
      </div>

      {/* Recommended Scholarships */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#0F1E46]">
              Recommended Scholarships
            </h2>
            <p className="text-xs text-slate-500">
              Three illustrative records ranked by deterministic rule match against your profile
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('explore-scholarships')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {recommended.map(({ scholarship, result }) => (
            <div
              key={scholarship.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs text-slate-500">
                    {scholarship.providerType} · Sample Record
                  </span>
                  <EligibilityStatusIndicator status={result.overallStatus} compact />
                </div>

                <h3 className="font-display text-base font-semibold text-[#0F1E46] leading-snug">
                  {scholarship.name}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {scholarship.provider}
                </p>
                <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                  {scholarship.shortDescription}
                </p>

                <dl className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Maximum Benefit</dt>
                    <dd className="font-semibold text-[#0F1E46] tabular-nums text-right">
                      {scholarship.maxBenefitAmount
                        ? formatINR(scholarship.maxBenefitAmount)
                        : 'Varies'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Income Limit</dt>
                    <dd className="font-medium text-slate-700 tabular-nums text-right">
                      {scholarship.maxFamilyIncome
                        ? formatINR(scholarship.maxFamilyIncome)
                        : 'No Income Limit'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Application Deadline</dt>
                    <dd className="font-mono text-slate-700 tabular-nums text-right">
                      {scholarship.deadline}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewDetails(scholarship.id)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] rounded-lg transition-colors cursor-pointer"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => onCheckEligibility(scholarship.id)}
                  className="py-2 px-3 text-xs font-semibold text-[#1D4ED8] border border-[#1D4ED8]/30 hover:bg-[#1D4ED8]/5 rounded-lg transition-colors cursor-pointer"
                >
                  Breakdown
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
