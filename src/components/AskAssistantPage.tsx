import React, { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Send,
  ShieldCheck,
} from 'lucide-react';
import {
  AskStructuredResponse,
  ChatMessage,
  Scholarship,
  StudentProfile,
} from '../types/scholarship';
import { evaluateEligibility } from '../engine/eligibilityEngine';
import { EligibilityStatusIndicator } from './StatusIndicator';

interface AskAssistantPageProps {
  scholarships: Scholarship[];
  profile: StudentProfile;
  onViewDetails: (id: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'Which scholarships are available for undergraduate students?',
  'What is the income limit for the Central Sector Scheme of Scholarship?',
  'Why am I not eligible for some scholarships in the knowledge base?',
  'What documents do I need for the AICTE Pragati Scholarship?',
  'Compare Central Sector Scheme of Scholarship and HDFC Bank Parivartan ECSS.',
];

export const AskAssistantPage: React.FC<AskAssistantPageProps> = ({
  scholarships,
  profile,
  onViewDetails,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const published = scholarships.filter((s) => s.isPublished);
      const kbContext = published.map((sch) => {
        const evaluation = evaluateEligibility(sch, profile);
        return {
          id: sch.id,
          name: sch.name,
          provider: sch.provider,
          providerType: sch.providerType,
          description: sch.description,
          educationLevel: sch.educationLevel,
          eligibleCourses: sch.eligibleCourses,
          minMarksPercent: sch.minMarksPercent,
          maxFamilyIncome: sch.maxFamilyIncome,
          eligibleCategories: sch.eligibleCategories,
          eligibleStates: sch.eligibleStates,
          genderRequirement: sch.genderRequirement,
          benefits: sch.benefits,
          requiredDocuments: sch.requiredDocuments,
          openingDate: sch.openingDate,
          deadline: sch.deadline,
          officialSourceUrl: sch.officialSourceUrl,
          lastVerifiedDate: sch.lastVerifiedDate,
          verificationStatus: sch.verificationStatus,
          specialConditions: sch.specialConditions,
          studentEvaluation: {
            overallStatus: evaluation.overallStatus,
            summary: evaluation.summary,
            failedConditions: evaluation.conditionResults
              .filter((c) => c.status === 'Not Satisfied')
              .map((c) => `${c.conditionName}: requires ${c.requirementText}, student has ${c.studentValueText}`),
            missingConditions: evaluation.conditionResults
              .filter((c) => c.status === 'Verify')
              .map((c) => c.conditionName),
          },
        };
      });

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          scholarships: kbContext,
          studentProfile: profile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            error: data.error || 'Unable to reach the ScholarKnowledge query service.',
          },
        ]);
        return;
      }

      const structured = data as AskStructuredResponse;
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: structured.directAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structured,
        },
      ]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Network error while querying ScholarKnowledge.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: msg,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F1E46]">Ask ScholarKnowledge</h1>
        <p className="text-sm text-slate-600 mt-1">
          Get answers to your scholarship-related questions using our structured scholarship knowledge base.
        </p>
      </div>

      {/* Knowledge Base Grounding Notice */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-[#0D9488] mt-0.5 shrink-0" />
        <p>
          Responses retrieve directly from the verified scholarship knowledge base and your deterministic rule-engine evaluations. If a requested detail is not recorded in the knowledge base, the system explicitly states that it could not be verified.
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-xs font-semibold text-slate-500 mb-3">Suggested Questions</h2>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={isLoading}
              onClick={() => sendQuestion(q)}
              className="text-left px-3 py-2 text-xs font-medium text-[#0F1E46] bg-[#F4F7FB] hover:bg-[#1D4ED8]/10 hover:text-[#1D4ED8] border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation History */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 sm:p-6 space-y-5 min-h-[320px] max-h-[580px] overflow-y-auto bg-[#F4F7FB]/60">
          {messages.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <h3 className="font-display text-base font-semibold text-[#0F1E46]">
                Query the Scholarship Knowledge Base
              </h3>
              <p className="text-sm text-slate-600 mt-1.5">
                Ask about income thresholds, required documents, deadline comparisons, or why a specific rule returned Not Eligible or Needs Verification.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-xl bg-[#0F1E46] text-white rounded-xl px-4 py-3 text-sm">
                    <p>{msg.text}</p>
                    <p className="text-[11px] text-slate-300 mt-1 text-right">{msg.timestamp}</p>
                  </div>
                ) : msg.error ? (
                  <div className="w-full max-w-3xl bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800">
                    <p className="font-semibold">Query could not be completed</p>
                    <p className="text-xs mt-1">{msg.error}</p>
                  </div>
                ) : (
                  msg.structured && (
                    <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-[#0D9488]">
                            Knowledge Base Response
                          </span>
                          <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed">
                          {msg.structured.directAnswer}
                        </p>
                      </div>

                      {msg.structured.unverifiedNotice && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-800">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <span>{msg.structured.unverifiedNotice}</span>
                        </div>
                      )}

                      {msg.structured.keyConditions.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-xs font-semibold text-[#0F1E46] mb-2">
                            Eligibility Conditions & Requirements
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                            {msg.structured.keyConditions.map((cond, idx) => (
                              <li key={idx}>{cond}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.structured.sources.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-xs font-semibold text-[#0F1E46] mb-2.5">
                            Referenced Knowledge Base Records & Official Sources
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.structured.sources.map((src) => (
                              <div
                                key={src.scholarshipId}
                                className="bg-[#F4F7FB] border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between gap-2"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => onViewDetails(src.scholarshipId)}
                                      className="text-left text-xs font-semibold text-[#0F1E46] hover:text-[#1D4ED8] cursor-pointer"
                                    >
                                      {src.name}
                                    </button>
                                    {src.eligibilityStatus && (
                                      <EligibilityStatusIndicator
                                        status={
                                          src.eligibilityStatus as
                                            | 'Eligible'
                                            | 'Not Eligible'
                                            | 'Needs Verification'
                                        }
                                        compact
                                      />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    {src.provider}
                                  </p>
                                  <p className="text-[11px] text-slate-600 mt-1.5 tabular-nums">
                                    Min Marks: {src.minMarks} · Income: {src.incomeLimit} · Deadline:{' '}
                                    {src.deadline}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                                  <span className="text-slate-500">
                                    Verified: {src.lastVerifiedDate}
                                  </span>
                                  <a
                                    href={src.officialSourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] hover:underline"
                                  >
                                    <span>Official Link</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-3 w-fit">
              <Loader2 className="w-4 h-4 text-[#1D4ED8] animate-spin" />
              <span>Retrieving structured records and verifying eligibility rules...</span>
            </div>
          )}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about income limits, documents, eligibility rules, or deadlines..."
            className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1D4ED8]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
