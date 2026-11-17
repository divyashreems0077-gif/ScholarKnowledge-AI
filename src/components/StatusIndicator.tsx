import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { OverallEligibilityStatus, VerificationStatus } from '../types/scholarship';

export const BrandLogo: React.FC<{
  dark?: boolean;
  onClick?: () => void;
}> = ({ dark = false, onClick }) => {
  const content = (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
          dark ? 'bg-white/10 text-white' : 'bg-[#0F1E46] text-white'
        }`}
      >
        <GraduationCap className="w-4 h-4" />
      </span>
      <span
        className={`font-display text-base font-bold tracking-tight ${
          dark ? 'text-white' : 'text-[#0F1E46]'
        }`}
      >
        ScholarKnowledge AI
      </span>
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] rounded-lg cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return content;
};

export const EligibilityStatusIndicator: React.FC<{
  status: OverallEligibilityStatus;
  compact?: boolean;
}> = ({ status, compact = false }) => {
  if (status === 'Eligible') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 whitespace-nowrap shrink-0 ${
          compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Eligible</span>
      </span>
    );
  }

  if (status === 'Not Eligible') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border border-rose-200 bg-rose-50 text-rose-800 whitespace-nowrap shrink-0 ${
          compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>Not Eligible</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border border-amber-200 bg-amber-50 text-amber-800 whitespace-nowrap shrink-0 ${
        compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span>Needs Verification</span>
    </span>
  );
};

export const VerificationStatusText: React.FC<{
  status: VerificationStatus;
}> = ({ status }) => {
  if (status === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 whitespace-nowrap">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>Verified</span>
      </span>
    );
  }
  if (status === 'Pending Review') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Pending Review</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 whitespace-nowrap">
      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
      <span>Outdated</span>
    </span>
  );
};
