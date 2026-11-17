import React, { useState } from 'react';
import { CheckCircle2, Edit3, Save, ShieldCheck } from 'lucide-react';
import { StudentProfile } from '../types/scholarship';
import { CATEGORY_OPTIONS, COURSE_OPTIONS, INDIAN_STATES } from '../data/scholarships';
import { getProfileCompletion } from '../engine/eligibilityEngine';

interface StudentProfilePageProps {
  profile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  profile,
  onSaveProfile,
}) => {
  const [form, setForm] = useState<StudentProfile>(profile);
  const [isEditing, setIsEditing] = useState(true);
  const [savedBanner, setSavedBanner] = useState(false);

  const completion = getProfileCompletion(form);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(form);
    setIsEditing(false);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F1E46]">My Student Profile</h1>
          <p className="text-sm text-slate-600 mt-1">
            Maintain accurate academic and financial information for deterministic scholarship eligibility evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setForm(profile);
                setIsEditing(false);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {savedBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Profile saved successfully. All scholarship eligibility indicators have been updated.
          </span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
          <span>
            Privacy Notice: ScholarKnowledge AI never asks for Aadhaar numbers, PAN cards, or bank passwords.
          </span>
        </div>
        <span className="text-xs font-semibold text-[#0F1E46] tabular-nums whitespace-nowrap">
          Completion: {completion.percentage}%
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-[#0F1E46] pb-3 mb-5 border-b border-slate-200">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Used to personalize your dashboard and eligibility summary.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@college.edu.in"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Institutional or personal email for application reminders.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                State of Residence (Domicile)
              </label>
              <select
                disabled={!isEditing}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Select state...</option>
                {INDIAN_STATES.filter((s) => s !== 'All India').map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Required to match state-level domicile scholarships (e.g., Karnataka SSP, MahaDBT).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                disabled={!isEditing}
                value={form.gender}
                onChange={(e) =>
                  setForm({ ...form, gender: e.target.value as StudentProfile['gender'] })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Select gender...</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Evaluates eligibility for women-focused schemes such as AICTE Pragati.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Academic Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-[#0F1E46] pb-3 mb-5 border-b border-slate-200">
            Academic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institution Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={form.institutionName}
                onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Name of your currently enrolled university or college.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Education Level
              </label>
              <select
                disabled={!isEditing}
                value={form.educationLevel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    educationLevel: e.target.value as StudentProfile['educationLevel'],
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Select level...</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Diploma / Undergraduate">Diploma / Undergraduate</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Matched against degree-level requirements in the rule engine.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Degree / Course
              </label>
              <select
                disabled={!isEditing}
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Select degree / course...</option>
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Determines eligibility for technical, science, medical, or general degree programs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Year of Study
              </label>
              <select
                disabled={!isEditing}
                value={form.yearOfStudy}
                onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Select year...</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Some schemes distinguish between fresh 1st-year and renewal applications.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Marks / Percentage (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                disabled={!isEditing}
                value={form.marksPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    marksPercent: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="e.g. 78"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Previous qualifying exam or latest semester aggregate percentage.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Financial Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-[#0F1E46] pb-3 mb-5 border-b border-slate-200">
            Financial Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Annual Family Income (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                disabled={!isEditing}
                value={form.familyIncome}
                onChange={(e) =>
                  setForm({
                    ...form,
                    familyIncome: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                placeholder="e.g. 220000"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Total combined annual household income as per your income certificate.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                disabled={!isEditing}
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as StudentProfile['category'],
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:border-[#1D4ED8]"
              >
                <option value="">Select category...</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Used only where scholarships specify category-reserved seats or relaxations.
              </p>
            </div>
          </div>
        </section>

        {isEditing && (
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
