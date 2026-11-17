export type RuleOperator = '<=' | '>=' | '==' | '!=' | 'in' | 'includes_any';

export type RuleField =
  | 'marksPercent'
  | 'familyIncome'
  | 'course'
  | 'category'
  | 'state'
  | 'educationLevel'
  | 'yearOfStudy'
  | 'gender';

export interface EligibilityRule {
  id: string;
  label: string;
  field: RuleField;
  operator: RuleOperator;
  value: number | string | string[];
  mandatory: boolean;
  exceptionNote?: string;
}

export interface RuleGroup {
  combinator: 'AND' | 'OR';
  rules: EligibilityRule[];
}

export type VerificationStatus = 'Verified' | 'Pending Review' | 'Outdated';
export type ProviderType = 'Government' | 'Private / CSR' | 'Institutional';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  providerType: ProviderType;
  shortDescription: string;
  description: string;
  educationLevel: 'Undergraduate' | 'Diploma / Undergraduate' | 'All Higher Education';
  eligibleCourses: string[];
  minMarksPercent: number;
  maxFamilyIncome: number | null;
  eligibleCategories: string[];
  eligibleStates: string[];
  genderRequirement: 'All' | 'Female';
  benefits: string;
  maxBenefitAmount: number | null;
  requiredDocuments: string[];
  openingDate: string;
  deadline: string;
  otherImportantDates?: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  specialConditions: string;
  generalGuidance: string;
  ruleGroup: RuleGroup;
  isPublished: boolean;
  isSampleData: boolean;
}

export interface StudentProfile {
  fullName: string;
  email: string;
  state: string;
  gender: 'Female' | 'Male' | 'Other' | '';
  institutionName: string;
  educationLevel: 'Undergraduate' | 'Diploma / Undergraduate' | '';
  course: string;
  yearOfStudy: string;
  marksPercent: number | '';
  familyIncome: number | '';
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority' | '';
}

export type ConditionStatus = 'Satisfied' | 'Not Satisfied' | 'Verify';
export type OverallEligibilityStatus = 'Eligible' | 'Not Eligible' | 'Needs Verification';

export interface ConditionEvaluation {
  ruleId: string;
  conditionName: string;
  requirementText: string;
  studentValueText: string;
  status: ConditionStatus;
  mandatory: boolean;
  explanation: string;
}

export interface EligibilityEvaluationResult {
  scholarshipId: string;
  scholarshipName: string;
  overallStatus: OverallEligibilityStatus;
  summary: string;
  conditionResults: ConditionEvaluation[];
  satisfiedCount: number;
  failedMandatoryCount: number;
  verifyCount: number;
  missingFields: string[];
  remainingRequirements: string[];
  evaluatedAt: string;
}

export interface AskSourceReference {
  scholarshipId: string;
  name: string;
  provider: string;
  deadline: string;
  incomeLimit: string;
  minMarks: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  eligibilityStatus?: OverallEligibilityStatus;
}

export interface AskStructuredResponse {
  directAnswer: string;
  unverifiedNotice?: string;
  keyConditions: string[];
  sources: AskSourceReference[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structured?: AskStructuredResponse;
  error?: string;
}

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type PageRoute =
  | 'landing'
  | 'login'
  | 'register'
  | 'student-dashboard'
  | 'student-profile'
  | 'explore-scholarships'
  | 'scholarship-details'
  | 'check-eligibility'
  | 'my-results'
  | 'compare-scholarships'
  | 'ask-assistant'
  | 'saved-scholarships'
  | 'student-settings'
  | 'admin-dashboard'
  | 'admin-manage'
  | 'admin-add'
  | 'admin-edit'
  | 'admin-rules'
  | 'admin-verification'
  | 'admin-students';
