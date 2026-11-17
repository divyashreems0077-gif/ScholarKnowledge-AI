import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import {
  EligibilityEvaluationResult,
  Scholarship,
  StudentProfile,
} from '../types/scholarship';
import { CATEGORY_OPTIONS, COURSE_OPTIONS, INDIAN_STATES } from '../data/scholarships';
import { evaluateEligibility } from '../engine/eligibilityEngine';
import { EligibilityStatusIndicator } from './StatusIndicator';

interface EligibilityCheckerPageProps {
  scholarships: Scholarship[];
  selectedScholarshipId: string;
  savedProfile: StudentProfile;
  onSelectScholarship: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const EligibilityCheckerPage: React.FC<EligibilityCheckerPageProps> = ({
  scholarships,
  selectedScholarshipId,
  savedProfile,
  onSelectScholarship,
  onViewDetails,
}) => {
  const published = scholarships.filter((s) => s.isPublished);
  const activeScholarship =
    published.find((s) => s.id === selectedScholarshipId) ?? published[0];

  const [inputProfile, setInputProfile] = useState<StudentProfile>(savedProfile);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EligibilityEvaluationResult | null>(() =>
    activeScholarship ? evaluateEligibility(activeScholarship, savedProfile) : null
  );

  useEffect(() => {
    if (activeScholarship) {
      setResult(evaluateEligibility(activeScholarship, inputProfile));
    }
  }, [activeScholarship?.id]);

  const handleLoadSavedProfile = () => {
    setInputProfile(savedProfile);
    if (activeScholarship) {
      runEvaluation(activeScholarship, savedProfile);
    }
  };

  const runEvaluation = (sch: Scholarship, prof: StudentProfile) => {
    setIsEvaluating(true);
    setTimeout(() => {
      const evaluated = evaluateEligibility(sch, prof);
      setResult(evaluated);
      setIsEvaluating(false);
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScholarship) return;
    runEvaluation(activeScholarship, inputProfile);
  };

  if (!activeScholarship) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-sm text-slate-600">No published scholarships available for evaluation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
          Check Your Scholarship Eligibility
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Enter your details to find out how your profile matches scholarship requirements using our deterministic rule-based reasoning engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form Column */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="font-display text-base font-semibold text-[#0F1E46]">
              Evaluation Parameters
            </h2>
            <button
              type="button"
              onClick={handleLoadSavedProfile}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Use Saved Profile</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Scholarship
            </label>
            <select
              value={activeScholarship.id}
              onChange={(e) => onSelectScholarship(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white font-medium text-[#0F1E46] focus:outline-none focus:border-[#1D4ED8]"
            >
              {published.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Marks (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={inputProfile.marksPercent}
                onChange={(e) =>
                  setInputProfile({
                    ...inputProfile,
                    marksPercent: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="e.g. 75"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Family Income (₹)
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={inputProfile.familyIncome}
                onChange={(e) =>
                  setInputProfile({
                    ...inputProfile,
                    familyIncome: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="e.g. 200000"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree / Course
              </label>
              <select
                value={inputProfile.course}
                onChange={(e) => setInputProfile({ ...inputProfile, course: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Not Provided</option>
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Education Level
              </label>
              <select
                value={inputProfile.educationLevel}
                onChange={(e) =>
                  setInputProfile({
                    ...inputProfile,
                    educationLevel: e.target.value as StudentProfile['educationLevel'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Not Provided</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Diploma / Undergraduate">Diploma / Undergraduate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State of Residence
              </label>
              <select
                value={inputProfile.state}
                onChange={(e) => setInputProfile({ ...inputProfile, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Not Provided</option>
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
                value={inputProfile.category}
                onChange={(e) =>
                  setInputProfile({
                    ...inputProfile,
                    category: e.target.value as StudentProfile['category'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Not Provided</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={inputProfile.gender}
                onChange={(e) =>
                  setInputProfile({
                    ...inputProfile,
                    gender: e.target.value as StudentProfile['gender'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Not Provided</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Eligibility Rules...</span>
              </>
            ) : (
              <>
                <ClipboardCheck className="w-4 h-4" />
                <span>Evaluate Eligibility</span>
              </>
            )}
          </button>
        </form>

        {/* Result & Breakdown Column */}
        <div className="lg:col-span-7 space-y-5">
          {isEvaluating ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-[#1D4ED8] animate-spin mb-3" />
              <h3 className="font-display text-base font-semibold text-[#0F1E46]">
                Processing Rule-Based Reasoning Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Evaluating {activeScholarship.ruleGroup.rules.length} conditions with{' '}
                {activeScholarship.ruleGroup.combinator} logic...
              </p>
            </div>
          ) : (
            result && (
              <>
                {/* Status Summary Banner */}
                <div
                  className={`rounded-xl border p-6 ${
                    result.overallStatus === 'Eligible'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : result.overallStatus === 'Not Eligible'
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      {result.overallStatus === 'Eligible' && (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      )}
                      {result.overallStatus === 'Not Eligible' && (
                        <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                      )}
                      {result.overallStatus === 'Needs Verification' && (
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Rule-Based Eligibility Determination
                        </p>
                        <h2 className="font-display text-xl font-bold text-[#0F1E46]">
                          {result.overallStatus}
                        </h2>
                      </div>
                    </div>

                    <EligibilityStatusIndicator status={result.overallStatus} />
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-600 tabular-nums">
                      Satisfied: <strong>{result.satisfiedCount}</strong> · Failed Mandatory:{' '}
                      <strong>{result.failedMandatoryCount}</strong> · Verify:{' '}
                      <strong>{result.verifyCount}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewDetails(activeScholarship.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] rounded-lg transition-colors cursor-pointer"
                    >
                      <span>View Scholarship Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Condition-by-Condition Breakdown Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base font-semibold text-[#0F1E46]">
                        Condition-by-Condition Breakdown
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Combinator: {activeScholarship.ruleGroup.combinator} · Evaluated deterministically
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F4F7FB] border-b border-slate-200 text-xs font-semibold text-slate-600">
                          <th className="py-3 px-4">Eligibility Condition</th>
                          <th className="py-3 px-4">Scholarship Requirement</th>
                          <th className="py-3 px-4">Student Information</th>
                          <th className="py-3 px-4">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {result.conditionResults.map((row) => (
                          <tr key={row.ruleId} className="hover:bg-slate-50/70">
                            <td className="py-3.5 px-4 align-top">
                              <p className="font-medium text-[#0F1E46]">
                                {row.conditionName}
                                {!row.mandatory && (
                                  <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                                    (Optional)
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">{row.explanation}</p>
                            </td>
                            <td className="py-3.5 px-4 align-top text-slate-700 tabular-nums">
                              {row.requirementText}
                            </td>
                            <td className="py-3.5 px-4 align-top font-medium text-[#0F1E46] tabular-nums">
                              {row.studentValueText}
                            </td>
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              {row.status === 'Satisfied' && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Satisfied</span>
                                </span>
                              )}
                              {row.status === 'Not Satisfied' && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Not Satisfied</span>
                                </span>
                              )}
                              {row.status === 'Verify' && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Verify</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Remaining Requirements / Manual Checks */}
                {result.overallStatus !== 'Not Eligible' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="font-display text-sm font-semibold text-[#0F1E46] mb-3">
                      {result.overallStatus === 'Eligible'
                        ? 'Remaining Application Requirements'
                        : 'What Needs to Be Checked / Provided'}
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {result.missingFields.length > 0 && (
                        <li className="text-amber-800 font-medium">
                          Missing profile fields to complete: {result.missingFields.join(', ')}
                        </li>
                      )}
                      {result.remainingRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#0D9488] font-bold">·</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};
