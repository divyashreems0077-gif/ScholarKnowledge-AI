import React, { useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Scholarship, StudentProfile } from '../types/scholarship';
import { CATEGORY_OPTIONS, COURSE_OPTIONS, INDIAN_STATES } from '../data/scholarships';
import { evaluateEligibility, formatINR } from '../engine/eligibilityEngine';
import { EligibilityStatusIndicator } from './StatusIndicator';

interface ExploreScholarshipsPageProps {
  scholarships: Scholarship[];
  profile: StudentProfile;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onViewDetails: (id: string) => void;
  onCheckEligibility: (id: string) => void;
}

interface FilterState {
  educationLevel: string;
  course: string;
  state: string;
  category: string;
  incomeRange: string;
  minMarksFilter: string;
  providerType: string;
}

const INITIAL_FILTERS: FilterState = {
  educationLevel: '',
  course: '',
  state: '',
  category: '',
  incomeRange: '',
  minMarksFilter: '',
  providerType: '',
};

export const ExploreScholarshipsPage: React.FC<ExploreScholarshipsPageProps> = ({
  scholarships,
  profile,
  savedIds,
  onToggleSave,
  onViewDetails,
  onCheckEligibility,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<'relevance' | 'deadline'>('relevance');
  const [showFilters, setShowFilters] = useState(true);

  const hasEnoughProfileForStatus =
    profile.marksPercent !== '' || profile.familyIncome !== '' || profile.course !== '';

  const filteredScholarships = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = scholarships
      .filter((s) => s.isPublished)
      .filter((s) => {
        if (q) {
          const hay = [
            s.name,
            s.provider,
            s.shortDescription,
            s.description,
            ...s.eligibleCourses,
            ...s.eligibleCategories,
            ...s.eligibleStates,
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }

        if (appliedFilters.educationLevel && s.educationLevel !== appliedFilters.educationLevel) {
          return false;
        }
        if (
          appliedFilters.course &&
          !s.eligibleCourses.some((c) => c.toLowerCase().includes(appliedFilters.course.toLowerCase()))
        ) {
          return false;
        }
        if (
          appliedFilters.state &&
          !s.eligibleStates.includes('All India') &&
          !s.eligibleStates.includes(appliedFilters.state)
        ) {
          return false;
        }
        if (
          appliedFilters.category &&
          !s.eligibleCategories.includes(appliedFilters.category)
        ) {
          return false;
        }
        if (appliedFilters.providerType && s.providerType !== appliedFilters.providerType) {
          return false;
        }
        if (appliedFilters.incomeRange) {
          const maxCap = Number(appliedFilters.incomeRange);
          if (s.maxFamilyIncome !== null && s.maxFamilyIncome < maxCap) {
            return false;
          }
        }
        if (appliedFilters.minMarksFilter) {
          const studentMarks = Number(appliedFilters.minMarksFilter);
          if (s.minMarksPercent > studentMarks) {
            return false;
          }
        }

        return true;
      })
      .map((s) => ({
        scholarship: s,
        evaluation: evaluateEligibility(s, profile),
      }));

    if (sortBy === 'deadline') {
      list.sort((a, b) => a.scholarship.deadline.localeCompare(b.scholarship.deadline));
    } else {
      const rank = { Eligible: 0, 'Needs Verification': 1, 'Not Eligible': 2 };
      list.sort(
        (a, b) => rank[a.evaluation.overallStatus] - rank[b.evaluation.overallStatus]
      );
    }

    return list;
  }, [scholarships, searchQuery, appliedFilters, sortBy, profile]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(draftFilters);
  };

  const handleResetFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
            Explore Scholarship Opportunities
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Search the structured knowledge base and filter by academic, financial, and regional criteria.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#0F1E46] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships by name, course, provider or eligibility..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-scholarships" className="text-xs font-medium text-slate-500">
            Sort by
          </label>
          <select
            id="sort-scholarships"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'relevance' | 'deadline')}
            className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-[#0F1E46] font-medium focus:outline-none focus:border-[#1D4ED8]"
          >
            <option value="relevance">Relevance (Eligibility Match)</option>
            <option value="deadline">Application Deadline</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <form
          onSubmit={handleApplyFilters}
          className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Education Level
              </label>
              <select
                value={draftFilters.educationLevel}
                onChange={(e) =>
                  setDraftFilters({ ...draftFilters, educationLevel: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="">All Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Diploma / Undergraduate">Diploma / Undergraduate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
              <select
                value={draftFilters.course}
                onChange={(e) => setDraftFilters({ ...draftFilters, course: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="">All Courses</option>
                {COURSE_OPTIONS.filter((c) => c !== 'Other').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <select
                value={draftFilters.state}
                onChange={(e) => setDraftFilters({ ...draftFilters, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="">All India / Any State</option>
                {INDIAN_STATES.filter((s) => s !== 'All India').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={draftFilters.category}
                onChange={(e) => setDraftFilters({ ...draftFilters, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Family Income Range
              </label>
              <select
                value={draftFilters.incomeRange}
                onChange={(e) =>
                  setDraftFilters({ ...draftFilters, incomeRange: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Any Income</option>
                <option value="200000">Up to ₹2,00,000</option>
                <option value="250000">Up to ₹2,50,000</option>
                <option value="450000">Up to ₹4,50,000</option>
                <option value="800000">Up to ₹8,00,000</option>
                <option value="1500000">Up to ₹15,00,000</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Academic Marks (%)
              </label>
              <select
                value={draftFilters.minMarksFilter}
                onChange={(e) =>
                  setDraftFilters({ ...draftFilters, minMarksFilter: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Any Percentage</option>
                <option value="50">50% or above</option>
                <option value="60">60% or above</option>
                <option value="75">75% or above</option>
                <option value="85">85% or above</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scholarship Provider
              </label>
              <select
                value={draftFilters.providerType}
                onChange={(e) =>
                  setDraftFilters({ ...draftFilters, providerType: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="">All Providers</option>
                <option value="Government">Government</option>
                <option value="Private / CSR">Private / CSR</option>
                <option value="Institutional">Institutional</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>
          Showing <strong className="text-[#0F1E46] tabular-nums">{filteredScholarships.length}</strong>{' '}
          scholarship record{filteredScholarships.length === 1 ? '' : 's'}
        </span>
        <span>Illustrative Sample Knowledge Base</span>
      </div>

      {/* Scholarship Cards */}
      {filteredScholarships.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <h3 className="font-display text-base font-semibold text-[#0F1E46]">
            No matching scholarships found
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Try relaxing your income, marks, or state filters to view more opportunities.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredScholarships.map(({ scholarship, evaluation }) => {
            const isSaved = savedIds.includes(scholarship.id);
            return (
              <div
                key={scholarship.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs text-slate-500">
                      {scholarship.providerType} · {scholarship.educationLevel}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasEnoughProfileForStatus && (
                        <EligibilityStatusIndicator status={evaluation.overallStatus} compact />
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleSave(scholarship.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isSaved
                            ? 'border-[#1D4ED8]/40 bg-[#1D4ED8]/10 text-[#1D4ED8]'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                        aria-label={isSaved ? 'Remove from saved' : 'Save scholarship'}
                        title={isSaved ? 'Saved' : 'Save scholarship'}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onViewDetails(scholarship.id)}
                    className="text-left font-display text-lg font-semibold text-[#0F1E46] hover:text-[#1D4ED8] transition-colors cursor-pointer"
                  >
                    {scholarship.name}
                  </button>
                  <p className="text-xs font-medium text-slate-500 mt-1">{scholarship.provider}</p>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {scholarship.shortDescription}
                  </p>

                  <dl className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-slate-500">Benefits</dt>
                      <dd className="font-semibold text-[#0F1E46] mt-0.5">{scholarship.benefits}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Income Requirement</dt>
                      <dd className="font-medium text-slate-700 mt-0.5 tabular-nums">
                        {scholarship.maxFamilyIncome
                          ? `Max ${formatINR(scholarship.maxFamilyIncome)}`
                          : 'No Income Limit'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Academic Requirement</dt>
                      <dd className="font-medium text-slate-700 mt-0.5 tabular-nums">
                        Min {scholarship.minMarksPercent}% marks
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Deadline</dt>
                      <dd className="font-mono text-slate-700 mt-0.5 tabular-nums">
                        {scholarship.deadline}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onViewDetails(scholarship.id)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onCheckEligibility(scholarship.id)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-[#1D4ED8] border border-[#1D4ED8]/30 hover:bg-[#1D4ED8]/5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Check Eligibility
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
