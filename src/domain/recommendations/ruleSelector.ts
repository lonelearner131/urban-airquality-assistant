/**
 * @fileoverview Pure rule selector engine.
 * Filters and ranks recommendation rules based on validated profile context,
 * air quality thresholds, and household demographic vulnerabilities.
 */

import type { HouseholdVulnerabilities } from "@/domain/risk/riskTier";
import type { RecommendationRule, RuleConditions } from "@/domain/types";
import { RULE_CATALOGUE } from "./rules";

export interface SelectionContext {
  readonly aqi: number;
  readonly vulnerabilities: HouseholdVulnerabilities;
  readonly commuteMode: string;
  readonly cookingFuel: string;
  readonly purifierStatus: "none" | "hepa" | "diy";
  readonly budgetLevel: "free" | "low" | "flexible";
}

/**
 * Checks whether user demographics satisfy vulnerability prerequisites.
 */
function checkVulnerabilityMatch(cond: RuleConditions, vuln: HouseholdVulnerabilities): boolean {
  if (!cond.vulnerabilityRequired) return true;
  return vuln.hasChildren || vuln.hasElderly || vuln.hasPregnancy || vuln.hasRespiratoryCondition;
}

/**
 * Checks environmental and demographic thresholds.
 */
function matchesThresholds(cond: RuleConditions, ctx: SelectionContext): boolean {
  if (cond.minAqi !== undefined && ctx.aqi < cond.minAqi) return false;
  return checkVulnerabilityMatch(cond, ctx.vulnerabilities);
}

/**
 * Checks lifestyle commute and cooking fuel compatibility.
 */
function matchesCommuteAndCooking(cond: RuleConditions, ctx: SelectionContext): boolean {
  if (cond.commuteModes && !cond.commuteModes.includes(ctx.commuteMode.toLowerCase())) return false;
  if (cond.cookingFuels && !cond.cookingFuels.includes(ctx.cookingFuel.toLowerCase())) return false;
  return true;
}

/**
 * Checks household equipment and budget compatibility.
 */
function matchesPurifierAndBudget(cond: RuleConditions, ctx: SelectionContext): boolean {
  if (cond.purifierStatus && !cond.purifierStatus.includes(ctx.purifierStatus)) return false;
  if (cond.budgetLevels && !cond.budgetLevels.includes(ctx.budgetLevel)) return false;
  return true;
}

/**
 * Evaluates whether a single rule's preconditions match the user's context.
 */
function isRuleApplicable(rule: RecommendationRule, ctx: SelectionContext): boolean {
  return (
    matchesThresholds(rule.conditions, ctx) &&
    matchesCommuteAndCooking(rule.conditions, ctx) &&
    matchesPurifierAndBudget(rule.conditions, ctx)
  );
}

/**
 * Calculates total potential CO2 mitigation from selected sustainable rules.
 */
export function calculateMitigationSavings(selectedRules: readonly RecommendationRule[]): number {
  let total = 0;
  for (const rule of selectedRules) {
    if (rule.emissionSavedKgCo2 !== undefined) {
      total += rule.emissionSavedKgCo2;
    }
  }
  return Number(total.toFixed(2));
}

/**
 * Selects all applicable rules for a user profile, ordered by impact.
 *
 * @param ctx - Complete user lifestyle and environmental context.
 * @param catalogue - Optional rule catalogue for dependency injection (defaults to RULE_CATALOGUE).
 * @returns Array of triggered rules with quantified impact.
 */
export function selectApplicableRules(
  ctx: SelectionContext,
  catalogue: readonly RecommendationRule[] = RULE_CATALOGUE,
): {
  rules: RecommendationRule[];
  grouped: Record<string, RecommendationRule[]>;
  totalCo2SavingsKg: number;
} {
  const matchedRules = catalogue.filter((rule) => isRuleApplicable(rule, ctx));
  const sortedRules = [...matchedRules].sort(
    (a, b) => b.exposureReductionPct - a.exposureReductionPct,
  );

  const grouped: Record<string, RecommendationRule[]> = {
    routine: sortedRules.filter((r) => r.category === "routine"),
    indoor: sortedRules.filter((r) => r.category === "indoor"),
    sustainable: sortedRules.filter((r) => r.category === "sustainable"),
    community: sortedRules.filter((r) => r.category === "community"),
  };

  const totalCo2SavingsKg = calculateMitigationSavings(sortedRules);

  return { rules: sortedRules, grouped, totalCo2SavingsKg };
}
