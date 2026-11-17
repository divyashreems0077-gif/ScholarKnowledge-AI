import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  EligibilityRule,
  PageRoute,
  ProviderType,
  RuleField,
  RuleOperator,
  Scholarship,
  StudentProfile,
  VerificationStatus,
} from '../types/scholarship';
import { CATEGORY_OPTIONS, COURSE_OPTIONS, INDIAN_STATES } from '../data/scholarships';
import {
  evaluateEligibility,
  formatINR,
  generateRuleExpressionPreview,
} from '../engine/eligibilityEngine';
import { VerificationStatusText } from './StatusIndicator';

interface AdminDashboardProps {
  currentRoute: PageRoute;
  scholarships: Scholarship[];
  editingScholarshipId: string | null;
  sampleStudentProfile: StudentProfile;
  onNavigate: (route: PageRoute) => void;
  onStartEdit: (id: string) => void;
  onSaveScholarship: (scholarship: Scholarship) => void;
  onDeleteScholarship: (id: string) => void;
  onUpdateVerification: (id: string, status: VerificationStatus) => void;
}

function createEmptyScholarship(): Scholarship {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `sch-${Date.now()}`,
    name: '',
    provider: '',
    providerType: 'Government',
    shortDescription: '',
    description: '',
    educationLevel: 'Undergraduate',
    eligibleCourses: ['B.Tech / B.E.'],
    minMarksPercent: 60,
    maxFamilyIncome: 250000,
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    eligibleStates: ['All India'],
    genderRequirement: 'All',
    benefits: '',
    maxBenefitAmount: null,
    requiredDocuments: ['Previous Year Marksheet', 'Family Income Certificate'],
    openingDate: today,
    deadline: '2026-12-31',
    otherImportantDates: '',
    officialSourceUrl: 'https://scholarships.gov.in/',
    lastVerifiedDate: today,
    verificationStatus: 'Pending Review',
    specialConditions: 'None',
    generalGuidance: '',
    isPublished: false,
    isSampleData: true,
    ruleGroup: {
      combinator: 'AND',
      rules: [
        {
          id: `r-${Date.now()}-1`,
          label: 'Academic Marks',
          field: 'marksPercent',
          operator: '>=',
          value: 60,
          mandatory: true,
        },
        {
          id: `r-${Date.now()}-2`,
          label: 'Annual Family Income',
          field: 'familyIncome',
          operator: '<=',
          value: 250000,
          mandatory: true,
        },
      ],
    },
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentRoute,
  scholarships,
  editingScholarshipId,
  sampleStudentProfile,
  onNavigate,
  onStartEdit,
  onSaveScholarship,
  onDeleteScholarship,
  onUpdateVerification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedRuleSchId, setSelectedRuleSchId] = useState<string>(
    scholarships[0]?.id ?? ''
  );
  const [toastMsg, setToastMsg] = useState('');

  // Form state for Add/Edit
  const editingTarget =
    currentRoute === 'admin-edit' && editingScholarshipId
      ? scholarships.find((s) => s.id === editingScholarshipId)
      : null;

  const [formState, setFormState] = useState<Scholarship>(() =>
    editingTarget ? editingTarget : createEmptyScholarship()
  );

  // Sync form when switching to admin-add or admin-edit
  React.useEffect(() => {
    if (currentRoute === 'admin-edit' && editingTarget) {
      setFormState(editingTarget);
    } else if (currentRoute === 'admin-add') {
      setFormState(createEmptyScholarship());
    }
  }, [currentRoute, editingTarget?.id]);

  // Rule builder state
  const activeRuleScholarship =
    scholarships.find((s) => s.id === selectedRuleSchId) ?? scholarships[0];
  const [newRuleField, setNewRuleField] = useState<RuleField>('familyIncome');
  const [newRuleOp, setNewRuleOp] = useState<RuleOperator>('<=');
  const [newRuleValue, setNewRuleValue] = useState<string>('250000');
  const [newRuleMandatory, setNewRuleMandatory] = useState<boolean>(true);
  const [newRuleException, setNewRuleException] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const verifiedCount = scholarships.filter((s) => s.verificationStatus === 'Verified').length;
  const pendingCount = scholarships.filter((s) => s.verificationStatus === 'Pending Review').length;
  const expiredCount = scholarships.filter(
    (s) => s.verificationStatus === 'Outdated' || s.deadline < todayStr
  ).length;

  // 1. Admin Dashboard Overview
  if (currentRoute === 'admin-dashboard') {
    const attentionList = scholarships.filter(
      (s) => s.verificationStatus !== 'Verified' || s.deadline < todayStr
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
              Administrator Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage scholarship knowledge base records, eligibility rule trees, and source verification.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin-add')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scholarship</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Total Scholarship Records</p>
            <p className="font-display text-3xl font-bold text-[#0F1E46] mt-2 tabular-nums">
              {scholarships.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Structured KB entries</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Verified Records</p>
            <p className="font-display text-3xl font-bold text-[#0D9488] mt-2 tabular-nums">
              {verifiedCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Confirmed against official portals</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Records Pending Verification</p>
            <p className="font-display text-3xl font-bold text-amber-600 mt-2 tabular-nums">
              {pendingCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Awaiting administrator sign-off</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Expired / Outdated</p>
            <p className="font-display text-3xl font-bold text-rose-600 mt-2 tabular-nums">
              {expiredCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Past deadline or flagged stale</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#0F1E46]">
              Records Requiring Verification or Date Review
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('admin-verification')}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Open Verification Queue
            </button>
          </div>
          {attentionList.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-600">
              All scholarship records are currently verified and active.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {attentionList.map((sch) => (
                <div
                  key={sch.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0F1E46]">{sch.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Last verified: <span className="font-mono">{sch.lastVerifiedDate}</span> ·
                      Deadline: <span className="font-mono">{sch.deadline}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <VerificationStatusText status={sch.verificationStatus} />
                    <button
                      type="button"
                      onClick={() => onStartEdit(sch.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] border border-[#1D4ED8]/30 rounded-lg hover:bg-[#1D4ED8]/5 cursor-pointer"
                    >
                      Review & Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Manage Scholarships Table
  if (currentRoute === 'admin-manage') {
    const filtered = scholarships.filter((s) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.verificationStatus.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0F1E46]">Manage Scholarships</h1>
            <p className="text-sm text-slate-600 mt-1">
              Search, edit, or remove scholarship records in the knowledge base.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin-add')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scholarship</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scholarship name, provider, or verification status..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F7FB] border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Scholarship Name</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Last Verified</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filtered.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#0F1E46]">{sch.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sch.isPublished ? 'Published' : 'Draft'} · {sch.ruleGroup.rules.length}{' '}
                        rules
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">{sch.provider}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {sch.lastVerifiedDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {sch.deadline}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <VerificationStatusText status={sch.verificationStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === sch.id ? (
                        <span className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteScholarship(sch.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 rounded cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-300 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onStartEdit(sch.id)}
                            className="p-1.5 text-[#1D4ED8] hover:bg-[#1D4ED8]/10 rounded-lg cursor-pointer"
                            title="Edit scholarship"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(sch.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete scholarship"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. Add / Edit Scholarship Form
  if (currentRoute === 'admin-add' || currentRoute === 'admin-edit') {
    const saveRecord = (publish: boolean) => {
      if (!formState.name.trim() || !formState.provider.trim()) {
        showToast('Scholarship name and provider are required.');
        return;
      }
      const updated: Scholarship = {
        ...formState,
        isPublished: publish,
        shortDescription:
          formState.shortDescription.trim() || formState.description.slice(0, 140),
      };
      onSaveScholarship(updated);
      onNavigate('admin-manage');
    };

    const toggleArrayItem = (arr: string[], item: string) =>
      arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
              {currentRoute === 'admin-edit' ? 'Edit Scholarship Record' : 'Add New Scholarship'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Define structured requirements, benefits, verification metadata, and documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin-manage')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {toastMsg && (
          <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {toastMsg}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scholarship Name *
              </label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. National Merit Technical Scholarship — Sample"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Provider Name *
              </label>
              <input
                type="text"
                value={formState.provider}
                onChange={(e) => setFormState({ ...formState, provider: e.target.value })}
                placeholder="e.g. Ministry of Education / CSR Foundation"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Provider Type
              </label>
              <select
                value={formState.providerType}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    providerType: e.target.value as ProviderType,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Government">Government</option>
                <option value="Private / CSR">Private / CSR</option>
                <option value="Institutional">Institutional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Education Level
              </label>
              <select
                value={formState.educationLevel}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    educationLevel: e.target.value as Scholarship['educationLevel'],
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Undergraduate">Undergraduate</option>
                <option value="Diploma / Undergraduate">Diploma / Undergraduate</option>
                <option value="All Higher Education">All Higher Education</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              placeholder="Detailed overview of scholarship purpose and coverage..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Marks (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formState.minMarksPercent}
                onChange={(e) =>
                  setFormState({ ...formState, minMarksPercent: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Family Income Limit (₹, blank for none)
              </label>
              <input
                type="number"
                min={0}
                value={formState.maxFamilyIncome ?? ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    maxFamilyIncome: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender Condition
              </label>
              <select
                value={formState.genderRequirement}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    genderRequirement: e.target.value as 'All' | 'Female',
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="All">All Genders</option>
                <option value="Female">Female Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Eligible Courses
            </label>
            <div className="flex flex-wrap gap-2">
              {COURSE_OPTIONS.filter((c) => c !== 'Other').map((course) => {
                const selected = formState.eligibleCourses.includes(course);
                return (
                  <button
                    key={course}
                    type="button"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        eligibleCourses: toggleArrayItem(formState.eligibleCourses, course),
                      })
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                      selected
                        ? 'bg-[#0F1E46] text-white border-[#0F1E46]'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {course}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Category Conditions
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const selected = formState.eligibleCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        eligibleCategories: toggleArrayItem(formState.eligibleCategories, cat),
                      })
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                      selected
                        ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State Restrictions
              </label>
              <select
                value={formState.eligibleStates[0] ?? 'All India'}
                onChange={(e) =>
                  setFormState({ ...formState, eligibleStates: [e.target.value] })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scholarship Benefits
              </label>
              <input
                type="text"
                value={formState.benefits}
                onChange={(e) => setFormState({ ...formState, benefits: e.target.value })}
                placeholder="e.g. ₹50,000 per annum towards tuition & books"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Documents (one per line)
            </label>
            <textarea
              rows={3}
              value={formState.requiredDocuments.join('\n')}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  requiredDocuments: e.target.value.split('\n').filter((line) => line.trim()),
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Opening Date
              </label>
              <input
                type="date"
                value={formState.openingDate}
                onChange={(e) => setFormState({ ...formState, openingDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={formState.deadline}
                onChange={(e) => setFormState({ ...formState, deadline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Verified Date
              </label>
              <input
                type="date"
                value={formState.lastVerifiedDate}
                onChange={(e) =>
                  setFormState({ ...formState, lastVerifiedDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Source URL
              </label>
              <input
                type="url"
                value={formState.officialSourceUrl}
                onChange={(e) =>
                  setFormState({ ...formState, officialSourceUrl: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Status
              </label>
              <select
                value={formState.verificationStatus}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    verificationStatus: e.target.value as VerificationStatus,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="Verified">Verified</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Outdated">Outdated</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => saveRecord(false)}
              className="px-4 py-2.5 text-sm font-semibold text-[#0F1E46] bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => saveRecord(true)}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] rounded-lg cursor-pointer"
            >
              Publish Scholarship
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Eligibility Rule Management
  if (currentRoute === 'admin-rules' && activeRuleScholarship) {
    const handleAddCondition = (e: React.FormEvent) => {
      e.preventDefault();
      let parsedValue: string | number | string[] = newRuleValue;
      if (newRuleField === 'familyIncome' || newRuleField === 'marksPercent') {
        parsedValue = Number(newRuleValue);
      } else if (newRuleOp === 'in' || newRuleOp === 'includes_any') {
        parsedValue = newRuleValue
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const newRule: EligibilityRule = {
        id: `rule-${Date.now()}`,
        label:
          newRuleField === 'familyIncome'
            ? 'Annual Family Income'
            : newRuleField === 'marksPercent'
              ? 'Academic Marks'
              : newRuleField === 'course'
                ? 'Eligible Course'
                : newRuleField === 'category'
                  ? 'Category'
                  : newRuleField === 'state'
                    ? 'State Domicile'
                    : newRuleField,
        field: newRuleField,
        operator: newRuleOp,
        value: parsedValue,
        mandatory: newRuleMandatory,
        exceptionNote: newRuleException.trim() || undefined,
      };

      onSaveScholarship({
        ...activeRuleScholarship,
        ruleGroup: {
          ...activeRuleScholarship.ruleGroup,
          rules: [...activeRuleScholarship.ruleGroup.rules, newRule],
        },
      });
      showToast('Eligibility condition added to rule tree.');
    };

    const handleRemoveRule = (ruleId: string) => {
      onSaveScholarship({
        ...activeRuleScholarship,
        ruleGroup: {
          ...activeRuleScholarship.ruleGroup,
          rules: activeRuleScholarship.ruleGroup.rules.filter((r) => r.id !== ruleId),
        },
      });
    };

    const handleToggleCombinator = (comb: 'AND' | 'OR') => {
      onSaveScholarship({
        ...activeRuleScholarship,
        ruleGroup: {
          ...activeRuleScholarship.ruleGroup,
          combinator: comb,
        },
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
              Eligibility Rule Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Configure deterministic AND/OR conditions, operators, thresholds, and exceptions for the reasoning engine.
            </p>
          </div>

          <select
            value={activeRuleScholarship.id}
            onChange={(e) => setSelectedRuleSchId(e.target.value)}
            className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white font-medium text-[#0F1E46] max-w-md"
          >
            {scholarships.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {toastMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Existing Rules + Combinator */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-display text-base font-semibold text-[#0F1E46]">
                    Active Rule Tree
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{activeRuleScholarship.name}</p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['AND', 'OR'] as const).map((comb) => (
                    <button
                      key={comb}
                      type="button"
                      onClick={() => handleToggleCombinator(comb)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                        activeRuleScholarship.ruleGroup.combinator === comb
                          ? 'bg-[#0F1E46] text-white'
                          : 'text-slate-600'
                      }`}
                    >
                      {comb}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                {activeRuleScholarship.ruleGroup.rules.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#F4F7FB] border border-slate-200 rounded-lg p-3.5 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0F1E46]">
                        {r.label}{' '}
                        <span className="font-normal text-slate-500">
                          · {r.mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </p>
                      <p className="font-mono text-xs text-slate-700 mt-1">
                        {r.field} {r.operator}{' '}
                        {Array.isArray(r.value) ? r.value.join(', ') : String(r.value)}
                      </p>
                      {r.exceptionNote && (
                        <p className="text-[11px] text-amber-700 mt-1">
                          Exception: {r.exceptionNote}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRule(r.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                      title="Remove condition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Generated Rule Expression Preview
                </p>
                <pre className="bg-[#0F1E46] text-slate-100 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {generateRuleExpressionPreview(activeRuleScholarship)}
                </pre>
              </div>
            </div>
          </div>

          {/* Add New Condition Form */}
          <form
            onSubmit={handleAddCondition}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <h2 className="font-display text-base font-semibold text-[#0F1E46] pb-3 border-b border-slate-200">
              Add Eligibility Condition
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Profile Field
              </label>
              <select
                value={newRuleField}
                onChange={(e) => setNewRuleField(e.target.value as RuleField)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="familyIncome">family_income (Annual Income ₹)</option>
                <option value="marksPercent">academic_marks (%)</option>
                <option value="course">course (Degree)</option>
                <option value="category">category</option>
                <option value="state">state (Domicile)</option>
                <option value="educationLevel">educationLevel</option>
                <option value="gender">gender</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comparison Operator
              </label>
              <select
                value={newRuleOp}
                onChange={(e) => setNewRuleOp(e.target.value as RuleOperator)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-mono"
              >
                <option value="<=">&lt;= (Less than or equal)</option>
                <option value=">=">&gt;= (Greater than or equal)</option>
                <option value="==">== (Equals)</option>
                <option value="!=">!= (Not equal)</option>
                <option value="in">in (Comma-separated allowed values)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Value
              </label>
              <input
                type="text"
                required
                value={newRuleValue}
                onChange={(e) => setNewRuleValue(e.target.value)}
                placeholder="e.g. 250000 or OBC, SC, ST"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newRuleMandatory}
                onChange={(e) => setNewRuleMandatory(e.target.checked)}
                className="rounded border-slate-300 text-[#1D4ED8]"
              />
              <span>Mandatory condition (failing triggers Not Eligible)</span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Condition / Exception Note (Optional)
              </label>
              <input
                type="text"
                value={newRuleException}
                onChange={(e) => setNewRuleException(e.target.value)}
                placeholder="e.g. Relaxed for SC/ST applicants"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer"
            >
              Add Condition to Rule Tree
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 5. Verification Management
  if (currentRoute === 'admin-verification') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F1E46]">
            Verification Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Audit official source links, last verified timestamps, and expired or pending scholarship records.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F7FB] border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Scholarship & Source Link</th>
                  <th className="py-3 px-4">Last Verified</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {scholarships.map((sch) => {
                  const isPastDeadline = sch.deadline < todayStr;
                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#0F1E46]">{sch.name}</p>
                        <a
                          href={sch.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#1D4ED8] hover:underline mt-0.5"
                        >
                          <span>{sch.officialSourceUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums">
                        {sch.lastVerifiedDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs tabular-nums">
                        <span className={isPastDeadline ? 'text-rose-700 font-semibold' : 'text-slate-700'}>
                          {sch.deadline}
                          {isPastDeadline ? ' (Expired)' : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <VerificationStatusText status={sch.verificationStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => onUpdateVerification(sch.id, 'Verified')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateVerification(sch.id, 'Outdated')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Flag Outdated</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 6. Student Overview (Sample Cohort & Rule Coverage)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F1E46]">Student Overview</h1>
        <p className="text-sm text-slate-600 mt-1">
          Illustrative prototype summary showing how sample student profiles evaluate against current knowledge base rules.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200">
          <div>
            <h2 className="font-display text-base font-semibold text-[#0F1E46]">
              Active Student Profile Rule Coverage
            </h2>
            <p className="text-xs text-slate-500">
              Sample Profile: {sampleStudentProfile.fullName} · {sampleStudentProfile.course} ·{' '}
              {sampleStudentProfile.marksPercent}% · {formatINR(sampleStudentProfile.familyIncome)}
            </p>
          </div>
          <span className="text-xs text-slate-500">Sample Data Analytics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F7FB] border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Scholarship</th>
                <th className="py-3 px-4">Conditions Evaluated</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Primary Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {scholarships.map((sch) => {
                const ev = evaluateEligibility(sch, sampleStudentProfile);
                return (
                  <tr key={sch.id}>
                    <td className="py-3 px-4 font-medium text-[#0F1E46]">{sch.name}</td>
                    <td className="py-3 px-4 text-xs tabular-nums text-slate-600">
                      {ev.satisfiedCount} / {ev.conditionResults.length} satisfied
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">{ev.overallStatus}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{ev.summary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
