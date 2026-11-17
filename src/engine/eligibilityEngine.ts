import {
  ConditionEvaluation,
  ConditionStatus,
  EligibilityEvaluationResult,
  EligibilityRule,
  OverallEligibilityStatus,
  RuleField,
  Scholarship,
  StudentProfile,
} from '../types/scholarship';

export function formatINR(amount: number | null | '' | undefined): string {
  if (amount === null || amount === undefined || amount === '') return 'Not Specified';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function getProfileCompletion(profile: StudentProfile): {
  percentage: number;
  completedCount: number;
  totalCount: number;
  missingLabels: string[];
} {
  const checks: { label: string; filled: boolean }[] = [
    { label: 'Full Name', filled: profile.fullName.trim().length > 0 },
    { label: 'Email Address', filled: profile.email.trim().length > 0 },
    { label: 'State of Residence', filled: profile.state.trim().length > 0 },
    { label: 'Gender', filled: profile.gender.trim().length > 0 },
    { label: 'Institution Name', filled: profile.institutionName.trim().length > 0 },
    { label: 'Degree / Course', filled: profile.course.trim().length > 0 },
    { label: 'Year of Study', filled: profile.yearOfStudy.trim().length > 0 },
    { label: 'Academic Marks (%)', filled: profile.marksPercent !== '' && !Number.isNaN(Number(profile.marksPercent)) },
    { label: 'Annual Family Income', filled: profile.familyIncome !== '' && !Number.isNaN(Number(profile.familyIncome)) },
    { label: 'Category', filled: profile.category.trim().length > 0 },
  ];

  const completedCount = checks.filter((c) => c.filled).length;
  const totalCount = checks.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingLabels = checks.filter((c) => !c.filled).map((c) => c.label);

  return { percentage, completedCount, totalCount, missingLabels };
}

function getFieldLabel(field: RuleField): string {
  const map: Record<RuleField, string> = {
    marksPercent: 'Academic Marks',
    familyIncome: 'Annual Family Income',
    course: 'Degree / Course',
    category: 'Category',
    state: 'State of Residence',
    educationLevel: 'Education Level',
    yearOfStudy: 'Year of Study',
    gender: 'Gender',
  };
  return map[field];
}

function formatRequirementValue(rule: EligibilityRule): string {
  if (rule.field === 'familyIncome' && typeof rule.value === 'number') {
    return `${rule.operator === '<=' ? 'Maximum ' : ''}${formatINR(rule.value)}`;
  }
  if (rule.field === 'marksPercent' && typeof rule.value === 'number') {
    return `${rule.operator === '>=' ? 'Minimum ' : ''}${rule.value}%`;
  }
  if (Array.isArray(rule.value)) {
    return rule.value.join(', ');
  }
  return String(rule.value);
}

function getStudentFieldValue(profile: StudentProfile, field: RuleField): string | number | null {
  switch (field) {
    case 'marksPercent':
      return profile.marksPercent === '' ? null : Number(profile.marksPercent);
    case 'familyIncome':
      return profile.familyIncome === '' ? null : Number(profile.familyIncome);
    case 'course':
      return profile.course.trim() || null;
    case 'category':
      return profile.category.trim() || null;
    case 'state':
      return profile.state.trim() || null;
    case 'educationLevel':
      return profile.educationLevel.trim() || null;
    case 'yearOfStudy':
      return profile.yearOfStudy.trim() || null;
    case 'gender':
      return profile.gender.trim() || null;
    default:
      return null;
  }
}

function formatStudentDisplayValue(field: RuleField, raw: string | number | null): string {
  if (raw === null) return 'Not Provided';
  if (field === 'familyIncome' && typeof raw === 'number') return formatINR(raw);
  if (field === 'marksPercent' && typeof raw === 'number') return `${raw}%`;
  return String(raw);
}

function evaluateSingleRule(rule: EligibilityRule, profile: StudentProfile): ConditionEvaluation {
  const studentVal = getStudentFieldValue(profile, rule.field);
  const requirementText = formatRequirementValue(rule);
  const studentValueText = formatStudentDisplayValue(rule.field, studentVal);

  // If required student data is missing, deterministic rule engine returns Verify
  if (studentVal === null) {
    return {
      ruleId: rule.id,
      conditionName: rule.label || getFieldLabel(rule.field),
      requirementText,
      studentValueText: 'Missing / Not Provided',
      status: 'Verify',
      mandatory: rule.mandatory,
      explanation: `Please provide your ${getFieldLabel(rule.field).toLowerCase()} so the rule engine can evaluate this requirement.`,
    };
  }

  let matched = false;
  let needsManualVerification = false;
  let explanation = '';

  if (rule.operator === '<=' && typeof studentVal === 'number' && typeof rule.value === 'number') {
    matched = studentVal <= rule.value;
    explanation = matched
      ? `${studentValueText} is within the ${requirementText} threshold.`
      : `${studentValueText} exceeds the allowed ceiling of ${formatINR(rule.value)}.`;
  } else if (rule.operator === '>=' && typeof studentVal === 'number' && typeof rule.value === 'number') {
    matched = studentVal >= rule.value;
    explanation = matched
      ? `${studentValueText} meets or exceeds the minimum ${rule.value}% requirement.`
      : `${studentValueText} is below the required minimum of ${rule.value}%.`;
  } else if (rule.operator === '==') {
    const expected = String(rule.value).toLowerCase();
    const actual = String(studentVal).toLowerCase();
    if (expected === 'all' || expected === 'all india') {
      matched = true;
      explanation = `Open to all eligible applicants (${studentValueText}).`;
    } else {
      matched = actual === expected;
      explanation = matched
        ? `Matches required value (${requirementText}).`
        : `Provided value (${studentValueText}) does not match required (${requirementText}).`;
    }
  } else if (rule.operator === '!=') {
    matched = String(studentVal).toLowerCase() !== String(rule.value).toLowerCase();
    explanation = matched
      ? `Satisfies exclusion condition.`
      : `Excluded under rule (${requirementText}).`;
  } else if (rule.operator === 'in' || rule.operator === 'includes_any') {
    const list = Array.isArray(rule.value)
      ? rule.value.map((v) => v.toLowerCase().trim())
      : String(rule.value)
          .split(',')
          .map((v) => v.toLowerCase().trim());

    const actual = String(studentVal).toLowerCase().trim();

    if (list.includes('all') || list.includes('all india') || list.includes('all categories') || list.includes('all ug courses')) {
      matched = true;
      explanation = `Applicable across all listed options (${studentValueText}).`;
    } else if (rule.field === 'course') {
      // Check exact or token match for courses (e.g., B.Tech matches B.Tech / B.E., otherwise verify if ambiguous)
      const exactOrPartial = list.some((item) => {
        if (actual === item) return true;
        if (actual.includes('b.tech') && (item.includes('b.tech') || item.includes('engineering') || item.includes('technical'))) return true;
        if (actual.includes('b.e') && (item.includes('b.e') || item.includes('engineering') || item.includes('technical'))) return true;
        if (actual.includes('b.sc') && (item.includes('b.sc') || item.includes('science'))) return true;
        if (actual.includes('b.com') && (item.includes('b.com') || item.includes('commerce'))) return true;
        if (actual.includes('b.a') && (item.includes('b.a') || item.includes('arts') || item.includes('humanities'))) return true;
        if (actual.includes('mbbs') && (item.includes('medical') || item.includes('mbbs'))) return true;
        if (actual.includes('diploma') && item.includes('diploma')) return true;
        return item.includes(actual) || actual.includes(item);
      });

      if (exactOrPartial) {
        matched = true;
        explanation = `${studentValueText} aligns with eligible courses (${requirementText}).`;
      } else if (actual === 'other') {
        needsManualVerification = true;
        explanation = `Your course ("${studentValueText}") must be manually verified against the official approved course list.`;
      } else {
        matched = false;
        explanation = `${studentValueText} is not listed in the eligible courses (${requirementText}).`;
      }
    } else {
      matched = list.some((item) => item === actual || actual.includes(item));
      explanation = matched
        ? `${studentValueText} is included in eligible criteria (${requirementText}).`
        : `${studentValueText} is outside the eligible list (${requirementText}).`;
    }
  }

  let status: ConditionStatus = matched ? 'Satisfied' : 'Not Satisfied';
  if (needsManualVerification) {
    status = 'Verify';
  }

  if (rule.exceptionNote && status === 'Not Satisfied') {
    explanation += ` Note: ${rule.exceptionNote}`;
  }

  return {
    ruleId: rule.id,
    conditionName: rule.label || getFieldLabel(rule.field),
    requirementText,
    studentValueText,
    status,
    mandatory: rule.mandatory,
    explanation,
  };
}

export function evaluateEligibility(
  scholarship: Scholarship,
  profile: StudentProfile
): EligibilityEvaluationResult {
  const { combinator, rules } = scholarship.ruleGroup;
  const conditionResults: ConditionEvaluation[] = rules.map((r) => evaluateSingleRule(r, profile));

  // Add special verification check if scholarship has special non-automatable conditions (e.g., disability percentage or board top 1% merit)
  const hasSpecialManualCheck =
    scholarship.specialConditions.toLowerCase().includes('disability') ||
    scholarship.specialConditions.toLowerCase().includes('top 1%') ||
    scholarship.specialConditions.toLowerCase().includes('aptitude test');

  const satisfiedCount = conditionResults.filter((c) => c.status === 'Satisfied').length;
  const failedMandatory = conditionResults.filter((c) => c.mandatory && c.status === 'Not Satisfied');
  const failedAny = conditionResults.filter((c) => c.status === 'Not Satisfied');
  const verifyItems = conditionResults.filter((c) => c.status === 'Verify');
  const missingFields = verifyItems.map((v) => v.conditionName);

  let overallStatus: OverallEligibilityStatus = 'Eligible';
  let summary = '';

  if (combinator === 'AND') {
    if (failedMandatory.length > 0) {
      overallStatus = 'Not Eligible';
      summary = `You do not meet ${failedMandatory.length} mandatory condition${failedMandatory.length > 1 ? 's' : ''} (${failedMandatory.map((f) => f.conditionName).join(', ')}).`;
    } else if (verifyItems.length > 0 || hasSpecialManualCheck) {
      overallStatus = 'Needs Verification';
      if (verifyItems.length > 0) {
        summary = `Mandatory criteria provided so far are satisfied, but ${verifyItems.length} condition${verifyItems.length > 1 ? 's' : ''} require information or verification (${missingFields.join(', ')}).`;
      } else {
        summary = `All standard profile rules are satisfied. Additional program-specific verification is required (${scholarship.specialConditions}).`;
      }
    } else {
      overallStatus = 'Eligible';
      summary = `All ${conditionResults.length} deterministic eligibility rules are satisfied based on your student profile.`;
    }
  } else {
    // OR combinator across rules (while still respecting explicitly marked mandatory rules if any)
    if (failedMandatory.length > 0) {
      overallStatus = 'Not Eligible';
      summary = `Mandatory baseline condition not met (${failedMandatory.map((f) => f.conditionName).join(', ')}).`;
    } else if (satisfiedCount > 0 && !hasSpecialManualCheck) {
      overallStatus = 'Eligible';
      summary = `At least one qualifying pathway in the OR rule group is satisfied.`;
    } else if (verifyItems.length > 0 || hasSpecialManualCheck) {
      overallStatus = 'Needs Verification';
      summary = `Potential match detected; confirm missing or special verification criteria (${missingFields.join(', ') || scholarship.specialConditions}).`;
    } else if (failedAny.length === conditionResults.length) {
      overallStatus = 'Not Eligible';
      summary = `None of the qualifying OR eligibility pathways were satisfied.`;
    }
  }

  const remainingRequirements = [
    ...scholarship.requiredDocuments.map((doc) => `Prepare document: ${doc}`),
    ...(scholarship.specialConditions && scholarship.specialConditions !== 'None'
      ? [`Confirm special condition: ${scholarship.specialConditions}`]
      : []),
    `Submit application before ${scholarship.deadline}`,
  ];

  return {
    scholarshipId: scholarship.id,
    scholarshipName: scholarship.name,
    overallStatus,
    summary,
    conditionResults,
    satisfiedCount,
    failedMandatoryCount: failedMandatory.length,
    verifyCount: verifyItems.length,
    missingFields,
    remainingRequirements,
    evaluatedAt: new Date().toISOString(),
  };
}

export function generateRuleExpressionPreview(scholarship: Scholarship): string {
  const { combinator, rules } = scholarship.ruleGroup;
  if (rules.length === 0) return 'No rules configured.';

  const clauses = rules.map((r) => {
    const valStr = Array.isArray(r.value) ? `[${r.value.join(', ')}]` : String(r.value);
    const reqTag = r.mandatory ? '' : ' /* optional */';
    return `${r.field} ${r.operator} ${valStr}${reqTag}`;
  });

  return `IF ${clauses.join(`\n${combinator} `)}\nTHEN status = "Satisfied" (else "Not Eligible" / "Needs Verification")`;
}
