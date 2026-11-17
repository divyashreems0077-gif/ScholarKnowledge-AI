import React, { useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileCheck2,
  GitBranch,
  Menu,
  MessageSquareText,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Scholarship, StudentProfile } from '../types/scholarship';
import { evaluateEligibility, formatINR } from '../engine/eligibilityEngine';
import { BrandLogo, EligibilityStatusIndicator } from './StatusIndicator';

interface LandingPageProps {
  scholarships: Scholarship[];
  sampleProfile: StudentProfile;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onQuickExplore: () => void;
  onQuickCheckEligibility: () => void;
  onInspectScholarship: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  scholarships,
  sampleProfile,
  onNavigateLogin,
  onNavigateRegister,
  onQuickExplore,
  onQuickCheckEligibility,
  onInspectScholarship,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<'contact' | 'privacy' | 'terms' | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const previewScholarships = scholarships.slice(0, 3);
  const verifiedCount = scholarships.filter((s) => s.verificationStatus === 'Verified').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-slate-900">
      {/* Top Bar Contract: 3 clean zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand wordmark */}
          <BrandLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

          {/* Zone 2: Concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#home"
              className="hover:text-[#0F1E46] transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <button
              type="button"
              onClick={onQuickExplore}
              className="hover:text-[#0F1E46] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore Scholarships
            </button>
            <a
              href="#how-it-works"
              className="hover:text-[#0F1E46] transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#about-us"
              className="hover:text-[#0F1E46] transition-colors whitespace-nowrap shrink-0"
            >
              About Us
            </a>
          </nav>

          {/* Zone 3: Auth & Primary Action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-4 py-2 text-sm font-medium text-[#0F1E46] hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Get Started
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Home
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onQuickExplore();
              }}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              Explore Scholarships
            </button>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700"
            >
              How It Works
            </a>
            <a
              href="#about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700"
            >
              About Us
            </a>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="flex-1 py-2.5 text-sm font-medium text-[#0F1E46] border border-slate-300 rounded-lg"
              >
                Login
              </button>
              <button
                type="button"
                onClick={onNavigateRegister}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="bg-white border-b border-slate-200">
          <div className="max-w-[1280px] mx-auto px-6 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wide text-[#0D9488] mb-3">
                Undergraduate Scholarship Knowledge & Rule Engine · India
              </p>
              <h1
                className="font-display font-bold text-[#0F1E46] tracking-tight leading-[1.15] mb-5"
                style={{ fontSize: 'clamp(2.1rem, 3.6vw, 3.25rem)', textWrap: 'balance' }}
              >
                Find the Right Scholarship. Understand Your Eligibility.
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl mb-8">
                Explore verified scholarship opportunities, understand eligibility requirements and make informed decisions about your educational financial assistance.
              </p>

              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onQuickExplore}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F1E46] hover:bg-[#172B5E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Explore Scholarships</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onQuickCheckEligibility}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#1D4ED8] bg-white border border-[#1D4ED8]/30 hover:bg-[#1D4ED8]/5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Check My Eligibility</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span>Deterministic Rule Evaluation</span>
                <span aria-hidden="true">·</span>
                <span>Official Portal References</span>
                <span aria-hidden="true">·</span>
                <span>Zero Aadhaar or Bank Credentials Required</span>
              </div>
            </div>

            {/* Right-side Interactive Dashboard Preview */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="bg-[#F4F7FB] border border-slate-200 rounded-xl p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-sm font-semibold text-[#0F1E46]">
                      Sample Eligibility Evaluation Preview
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Profile: {sampleProfile.course} · {sampleProfile.marksPercent}% marks ·{' '}
                      {formatINR(sampleProfile.familyIncome)} income · {sampleProfile.state}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                    Sample Data
                  </span>
                </div>

                <div className="space-y-3">
                  {previewScholarships.map((sch) => {
                    const evaluation = evaluateEligibility(sch, sampleProfile);
                    return (
                      <div
                        key={sch.id}
                        className="bg-white border border-slate-200 rounded-lg p-4 transition-colors hover:border-[#1D4ED8]/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => onInspectScholarship(sch.id)}
                              className="text-left text-sm font-semibold text-[#0F1E46] hover:text-[#1D4ED8] transition-colors cursor-pointer"
                            >
                              {sch.name}
                            </button>
                            <p className="text-xs text-slate-500 mt-1">
                              {sch.provider} · Income Limit:{' '}
                              <span className="tabular-nums font-medium text-slate-700">
                                {sch.maxFamilyIncome ? formatINR(sch.maxFamilyIncome) : 'None'}
                              </span>
                            </p>
                          </div>
                          <EligibilityStatusIndicator status={evaluation.overallStatus} compact />
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                          <span>
                            {evaluation.satisfiedCount} of {evaluation.conditionResults.length} rule conditions satisfied
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                            Deadline: {sch.deadline}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Prototype Knowledge Base Coverage
            </h2>
            <span className="text-xs text-slate-500">
              Illustrative Sample Figures for Demonstration
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">Scholarships Listed</p>
              <p className="font-display text-2xl font-bold text-[#0F1E46] mt-1 tabular-nums">
                {scholarships.length} Sample Schemes
              </p>
              <p className="text-xs text-slate-500 mt-1">Central, State & CSR records</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">Students Guided</p>
              <p className="font-display text-2xl font-bold text-[#0F1E46] mt-1 tabular-nums">
                1,200+ (Sample)
              </p>
              <p className="text-xs text-slate-500 mt-1">Illustrative prototype cohort</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">Categories Covered</p>
              <p className="font-display text-2xl font-bold text-[#0F1E46] mt-1 tabular-nums">
                6 Categories
              </p>
              <p className="text-xs text-slate-500 mt-1">General, OBC, SC, ST, EWS, Minority</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">Verified Sources</p>
              <p className="font-display text-2xl font-bold text-[#0D9488] mt-1 tabular-nums">
                {verifiedCount} / {scholarships.length} Verified
              </p>
              <p className="text-xs text-slate-500 mt-1">Linked to official portal URLs</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="max-w-2xl mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F1E46] tracking-tight">
                How ScholarKnowledge AI Works
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                A transparent four-step workflow combining a structured scholarship knowledge base with deterministic rule evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: '01. Create Your Profile',
                  desc: 'Enter your academic marks, degree stream, state of residence, category, and annual family income.',
                },
                {
                  step: '02. Explore Scholarships',
                  desc: 'Search and filter government, state, and CSR scholarships stored in the structured knowledge base.',
                },
                {
                  step: '03. Check Eligibility',
                  desc: 'Let the rule-based reasoning engine evaluate each mandatory and optional condition transparently.',
                },
                {
                  step: '04. Get Guidance',
                  desc: 'Review missing criteria, required document checklists, official deadlines, and natural-language explanations.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-[#F4F7FB] border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-display text-base font-semibold text-[#0F1E46] mb-2">
                      {item.step}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F1E46] tracking-tight">
              Built for Transparent Scholarship Decisions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Every eligibility decision is auditable against explicit rules, while natural-language queries pull directly from verified records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 lg:col-span-2">
              <div className="flex items-center gap-2.5 text-[#1D4ED8] mb-3">
                <GitBranch className="w-5 h-5" />
                <h3 className="font-display text-lg font-semibold text-[#0F1E46]">
                  Knowledge-Based Eligibility Checking & Explainable Results
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Unlike opaque black-box scores, ScholarKnowledge AI evaluates your profile against explicit AND/OR rule trees. You receive a condition-by-condition breakdown showing exactly which requirements passed, failed, or require manual verification.
              </p>
              <div className="bg-[#F4F7FB] border border-slate-200 rounded-lg px-4 py-3 font-mono text-xs text-slate-700">
                IF family_income &lt;= ₹2,50,000 AND academic_marks &gt;= 60% THEN Eligible
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2.5 text-[#0D9488] mb-3">
                <Compass className="w-5 h-5" />
                <h3 className="font-display text-lg font-semibold text-[#0F1E46]">
                  Scholarship Discovery
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter undergraduate opportunities by course, state domicile, category, family income ceiling, marks threshold, and government or CSR provider.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2.5 text-[#1D4ED8] mb-3">
                <ClipboardList className="w-5 h-5" />
                <h3 className="font-display text-lg font-semibold text-[#0F1E46]">
                  Document Checklist
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track required bonafide certificates, income proofs, marksheets, and domicile records interactively before portal deadlines close.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2.5 text-[#0D9488] mb-3">
                <CalendarClock className="w-5 h-5" />
                <h3 className="font-display text-lg font-semibold text-[#0F1E46]">
                  Deadline Tracking
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sort opportunities by closing date, spot outdated or expired cycles immediately, and view official last-verified timestamps.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2.5 text-[#1D4ED8] mb-3">
                <MessageSquareText className="w-5 h-5" />
                <h3 className="font-display text-lg font-semibold text-[#0F1E46]">
                  Natural Language Scholarship Queries
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask questions in plain English via Ask ScholarKnowledge. Responses retrieve grounded facts and link back to official portal URLs.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-[#0F1E46] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-semibold">
                Compare Schemes Side by Side or Check Your Eligibility Now
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Sign in to save scholarships, run multi-scheme comparisons, or explore the Administrator rule management console.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onQuickCheckEligibility}
                className="px-4 py-2.5 text-sm font-semibold bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Check My Eligibility
              </button>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="px-4 py-2.5 text-sm font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Student / Admin Login
              </button>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about-us" className="bg-white border-t border-slate-200 py-14">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <h2 className="font-display text-2xl font-bold text-[#0F1E46]">
                About ScholarKnowledge AI
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">
                ScholarKnowledge AI is an educational knowledge-engineering prototype designed for undergraduate students in India. It separates deterministic rule-based eligibility reasoning from natural-language retrieval so students never have to rely on unverified claims when planning college financial aid.
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#0D9488] mt-0.5 shrink-0" />
                  <span>Every rule evaluates explicit income, academic, state, and course thresholds.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Scale className="w-4 h-4 text-[#1D4ED8] mt-0.5 shrink-0" />
                  <span>Side-by-side comparison highlights benefits, documents, and official links.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-[#0D9488] mt-0.5 shrink-0" />
                  <span>Administrative verification queue tracks stale or expired scholarship cycles.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] mt-0.5 shrink-0" />
                  <span>Privacy-first profile omits Aadhaar numbers and sensitive banking details.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F4F7FB] border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#0F1E46]">
                Official Scholarship Information Disclaimer
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Scholarship records, benefit slabs, and statistics presented in this prototype are illustrative sample datasets structured for academic demonstration. Always confirm final eligibility criteria, circulars, and submission deadlines directly on official government portals (such as NSP, AICTE, State SSP/MahaDBT) or respective CSR foundation websites before applying.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0F1E46] text-slate-300 border-t border-slate-800">
        <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <BrandLogo dark />
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              Intelligent Scholarship Knowledge and Eligibility Guidance System · Prototype Demonstration Platform.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <a href="#about-us" className="hover:text-white transition-colors">
              About
            </a>
            <button
              type="button"
              onClick={() => {
                setContactSubmitted(false);
                setInfoModal('contact');
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms and Conditions
            </button>
          </div>
        </div>
      </footer>

      {infoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-[#0F1E46]">
                {infoModal === 'contact' && 'Contact Project Team'}
                {infoModal === 'privacy' && 'Privacy Policy'}
                {infoModal === 'terms' && 'Terms and Conditions'}
              </h3>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {infoModal === 'contact' && (
              <div>
                {contactSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                    Your inquiry has been recorded in this prototype session. For official scholarship queries, please consult the respective scheme portal.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-slate-600">
                      Submit feedback or report an outdated scholarship deadline for review by administrators.
                    </p>
                    <input
                      type="email"
                      required
                      placeholder="Your academic email"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="Message or scholarship update note..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            )}

            {infoModal === 'privacy' && (
              <p className="text-sm text-slate-600 leading-relaxed">
                ScholarKnowledge AI follows data minimization principles. The platform intentionally avoids collecting Aadhaar numbers, PAN details, or banking passwords. Student profile attributes entered in the prototype are stored locally in your browser session for eligibility rule evaluation.
              </p>
            )}

            {infoModal === 'terms' && (
              <p className="text-sm text-slate-600 leading-relaxed">
                This application is an academic scholarship knowledge and eligibility guidance prototype. Rule evaluations provide transparent guidance based on stored knowledge-base parameters and do not constitute an official scholarship award guarantee.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
