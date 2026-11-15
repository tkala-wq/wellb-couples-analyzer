import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  HeartHandshake,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { HOUSEHOLD_PRIORITY_OPTIONS } from '../data/regulatoryData';
import {
  ClaimEvaluation,
  ComparisonReport,
  EvaluatedProduct,
  IngredientEvaluation,
  SubScoreDetail
} from '../types/product';

interface ComparisonReportViewProps {
  report: ComparisonReport;
}

type IngredientFilter =
  | 'all'
  | 'couple_priority'
  | 'flagged'
  | 'plastic'
  | 'nodata';

const SUB_CATEGORY_LABELS: Record<string, string> = {
  soap: 'Soap / Body Cleanser (Rinse-Off)',
  shampoo: 'Shampoo / Scalp Care (Rinse-Off)',
  oil: 'Body, Massage & Hair Oil (Leave-On)',
  multivitamin: 'Daily Multivitamin / Prenatal',
  single_nutrient: 'Single Vitamin / Mineral',
  botanical_herbal: 'Herbal / Botanical / Ayurvedic',
  omega_specialty: 'Omega-3 / Specialty Supplement'
};

export const ComparisonReportView: React.FC<ComparisonReportViewProps> = ({
  report
}) => {
  const [ingredientFilter, setIngredientFilter] =
    useState<IngredientFilter>('all');

  const { productA, productB, verdict, activePriorities } = report;

  const filterIngredients = (
    list: IngredientEvaluation[]
  ): IngredientEvaluation[] => {
    if (ingredientFilter === 'couple_priority') {
      return list.filter((i) =>
        i.triggeredPriorities.some((p) => activePriorities.includes(p))
      );
    }
    if (ingredientFilter === 'flagged') {
      return list.filter(
        (i) => i.riskTier === 'High' || i.riskTier === 'Moderate'
      );
    }
    if (ingredientFilter === 'plastic') {
      return list.filter((i) => i.isPlasticOrEndocrineConcern);
    }
    if (ingredientFilter === 'nodata') {
      return list.filter((i) => i.riskTier === 'No authoritative data found');
    }
    return list;
  };

  const renderRiskLabel = (tier: IngredientEvaluation['riskTier']) => {
    if (tier === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
          High Risk
        </span>
      );
    }
    if (tier === 'Moderate') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          Moderate Risk
        </span>
      );
    }
    if (tier === 'Low') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          Low Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        No authoritative data found
      </span>
    );
  };

  const renderClaimStatus = (status: ClaimEvaluation['status']) => {
    if (status === 'Verified Standard') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          Verified Standard
        </span>
      );
    }
    if (status === 'Requires Certifier Proof') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          Requires Certifier Seal
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
        <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
        Misleading / Unregulated
      </span>
    );
  };

  const renderSubScoreRow = (
    subA: SubScoreDetail,
    subB: SubScoreDetail
  ) => {
    const rowTitle =
      subA.label === subB.label
        ? subA.label
        : `${subA.label} / ${subB.label}`;
    return (
      <tr className="border-t border-slate-200">
        <td className="py-3.5 px-4 align-top">
          <div className="text-sm font-medium text-slate-900">{rowTitle}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
            Weight: {subA.weightPercent}% (Product A) · {subB.weightPercent}% (Product B)
          </div>
        </td>
        <td className="py-3.5 px-4 align-top">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-base font-semibold font-mono tabular-nums text-slate-900">
              {subA.score === 'N/A' ? 'N/A' : `${subA.score}/100`}
            </span>
            <span className="text-xs text-slate-500">{subA.tier}</span>
          </div>
          {typeof subA.score === 'number' && (
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full ${
                  subA.score >= 75
                    ? 'bg-emerald-600'
                    : subA.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                }`}
                style={{ width: `${subA.score}%` }}
              />
            </div>
          )}
          <p className="text-xs text-slate-600 mt-1.5">{subA.rationale}</p>
        </td>
        <td className="py-3.5 px-4 align-top">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-base font-semibold font-mono tabular-nums text-slate-900">
              {subB.score === 'N/A' ? 'N/A' : `${subB.score}/100`}
            </span>
            <span className="text-xs text-slate-500">{subB.tier}</span>
          </div>
          {typeof subB.score === 'number' && (
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full ${
                  subB.score >= 75
                    ? 'bg-emerald-600'
                    : subB.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                }`}
                style={{ width: `${subB.score}%` }}
              />
            </div>
          )}
          <p className="text-xs text-slate-600 mt-1.5">{subB.rationale}</p>
        </td>
      </tr>
    );
  };

  const renderProductSnapshotCard = (prod: EvaluatedProduct) => {
    const isWinner = report.verdict.betterChoice === prod.input.slot;
    return (
      <div
        className={`bg-white border rounded-xl p-6 space-y-4 ${
          isWinner
            ? 'border-teal-600 ring-1 ring-teal-600/20'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">
                Product {prod.input.slot} ·{' '}
                {SUB_CATEGORY_LABELS[prod.input.subCategory] ||
                  (prod.input.category === 'personal_care'
                    ? 'Personal Care'
                    : 'Dietary Supplement')}
              </span>
              {isWinner && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 rounded-full">
                  Healthier Choice
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-slate-900 mt-1">
              {prod.input.brand ? `${prod.input.brand} — ` : ''}
              {prod.input.name || `Product ${prod.input.slot}`}
            </h4>
            <div className="text-xs text-slate-500 mt-0.5">
              {prod.scorecard.priceNumeric > 0 &&
              prod.scorecard.quantityNumeric > 0
                ? `$${prod.scorecard.priceNumeric.toFixed(2)} for ${prod.scorecard.quantityNumeric} ${prod.input.quantityUnit} ($${prod.scorecard.unitPrice}/${prod.input.quantityUnit})`
                : prod.scorecard.priceNumeric > 0
                  ? `$${prod.scorecard.priceNumeric.toFixed(2)}`
                  : 'Price optional (not entered)'}
            </div>
          </div>

          <div className="text-right font-mono tabular-nums shrink-0">
            <div className="text-xs text-slate-500">Wellbeing Score</div>
            <div
              className={`text-2xl font-bold ${
                prod.scorecard.wellbeingIndex >= 75
                  ? 'text-emerald-700'
                  : prod.scorecard.wellbeingIndex >= 50
                    ? 'text-amber-700'
                    : 'text-red-700'
              }`}
            >
              {prod.scorecard.wellbeingIndex}
              <span className="text-xs font-normal text-slate-500">/100</span>
            </div>
            {prod.scorecard.profilePenaltyPoints > 0 && (
              <div className="text-[11px] text-amber-800 font-sans">
                Base {prod.scorecard.baseWellbeingIndex} (−
                {prod.scorecard.profilePenaltyPoints} couple profile)
              </div>
            )}
          </div>
        </div>

        {prod.input.unreadableFlags.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
            <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <FileWarning className="w-3.5 h-3.5 text-amber-700" />
              Missing / Unreadable Label Note
            </div>
            {prod.input.unreadableFlags.map((flag, i) => (
              <p key={i} className="text-xs text-amber-800">
                • {flag}
              </p>
            ))}
          </div>
        )}

        {prod.input.category === 'supplement' &&
          prod.input.supplementPanel?.activeIngredientsRaw && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="text-xs font-semibold text-slate-800">
                Active Nutrients & Third-Party Purity
              </div>
              <p className="text-xs text-slate-700">
                {prod.input.supplementPanel.activeIngredientsRaw}
              </p>
              <div className="text-[11px] text-slate-500">
                Serving: {prod.input.supplementPanel.servingSize || 'Not specified'}{' '}
                · Certification:{' '}
                <strong className="text-slate-700">
                  {prod.input.supplementPanel.thirdPartyTesting.toUpperCase()}
                </strong>
              </div>
            </div>
          )}

        <div>
          <div className="text-xs font-semibold text-slate-700 mb-1">
            Packaging Claims Made ({prod.claimsList.length})
          </div>
          {prod.claimsList.length > 0 ? (
            <p className="text-sm text-slate-700">
              {prod.claimsList.join(' · ')}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No front-of-bottle claims declared.
            </p>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-700 mb-1">
            Evaluated Ingredients & Excipients ({prod.ingredientsList.length})
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {prod.ingredientsList.join(', ')}
          </p>
        </div>
      </div>
    );
  };

  const renderHealthRiskBreakdownCard = (prod: EvaluatedProduct) => {
    const explanation = prod.scorecard.healthRiskExplanation;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <div className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              {explanation.exposureRouteLabel}
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              Health Risks & Body Impact: {prod.input.name || `Product ${prod.input.slot}`}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {explanation.exposureExplanation}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-xs font-semibold text-slate-900">
              Risk Overview
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {explanation.overallRiskSummary}
            </p>
            <p className="text-[11px] text-teal-900 font-medium pt-1 border-t border-slate-200/80">
              {explanation.profileAdjustmentSummary}
            </p>
          </div>

          {explanation.primaryHealthRisks.length === 0 ? (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <strong>Clean Household Safety Profile:</strong> None of the
                declared ingredients trigger High or Moderate toxicological,
                endocrine, or allergen warnings across the 9 official regulatory
                bodies.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-800">
                Specific Health Risks Identified ({explanation.primaryHealthRisks.length})
              </div>
              {explanation.primaryHealthRisks.map((risk, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border space-y-1.5 ${
                    risk.severity === 'High'
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {risk.title}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                        risk.severity === 'High'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {risk.severity} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>How It Affects the Body:</strong>{' '}
                    {risk.biologicalMechanism}
                  </p>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    <strong>Why It Matters for Couples:</strong>{' '}
                    {risk.coupleRelevance}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-0.5">
                    Authority Citation: {risk.authorityCitation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* SECTION 0: VERDICT BANNER AT TOP FOR COUPLES */}
      <section className="bg-white border-2 border-teal-700 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
              <Award className="w-4 h-4 text-teal-700" />
              Household & Couples Wellbeing Verdict
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {verdict.headlineSummary}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              {verdict.plainLanguageExplanation}
            </p>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-lg shrink-0 lg:w-80 space-y-1">
            <div className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-teal-700" />
              Couples Shared-Use Guidance
            </div>
            <p className="text-xs text-teal-950 leading-relaxed">
              {verdict.coupleDecisionGuide}
            </p>
          </div>
        </div>

        {/* Key Trade-Offs & Household Precautions Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-xs font-semibold text-slate-900">
              Fertility & Hormone Balance
            </div>
            {verdict.precautions.fertilityAndHormones.map((note, idx) => (
              <p key={idx} className="text-xs text-slate-600 leading-relaxed">
                {note}
              </p>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-xs font-semibold text-slate-900">
              Pregnancy & Nursing Safety
            </div>
            {verdict.precautions.pregnancyAndNursing.map((note, idx) => (
              <p key={idx} className="text-xs text-slate-600 leading-relaxed">
                {note}
              </p>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-xs font-semibold text-slate-900">
              Sensitive Skin, Scalp & Allergies
            </div>
            {verdict.precautions.skinAndAllergies.map((note, idx) => (
              <p key={idx} className="text-xs text-slate-600 leading-relaxed">
                {note}
              </p>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-xs font-semibold text-slate-900">
              Shared Household & Children
            </div>
            {verdict.precautions.householdAndChildren.map((note, idx) => (
              <p key={idx} className="text-xs text-slate-600 leading-relaxed">
                {note}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: PRODUCT SNAPSHOT */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-xl font-semibold text-slate-900">
            01. Side-by-Side Product Snapshot
          </h3>
          <p className="text-sm text-slate-600">
            Overview of product category, dermal or oral exposure route, packaging
            claims, and declared ingredients.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {renderProductSnapshotCard(productA)}
          {renderProductSnapshotCard(productB)}
        </div>
      </section>

      {/* SECTION 2: EXPLAINING THE HEALTH RISKS OF EACH CHOICE */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-xl font-semibold text-slate-900">
            02. Health Risks & Biological Impact of Each Choice
          </h3>
          <p className="text-sm text-slate-600">
            Plain-language explanation of how each product interacts with your body
            (leave-on dermal absorption, rinse-off cleansing, or daily oral
            ingestion) and why specific ingredients pose health or hormone risks.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {renderHealthRiskBreakdownCard(productA)}
          {renderHealthRiskBreakdownCard(productB)}
        </div>
      </section>

      {/* SECTION 3: INGREDIENT-BY-INGREDIENT REGULATORY RISK CHECK */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              03. Full Ingredient-by-Ingredient Regulatory Audit
            </h3>
            <p className="text-sm text-slate-600">
              Every ingredient checked against FDA, USDA, EPA, CDC, NIH, EFSA,
              WHO/IARC, Codex Alimentarius, and FSSAI.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            {(
              [
                { id: 'all', label: 'All Ingredients' },
                { id: 'couple_priority', label: 'Matches Couple Profile' },
                { id: 'flagged', label: 'High / Mod Risk' },
                { id: 'plastic', label: 'Hormone / Plastic' },
                { id: 'nodata', label: 'No Data Found' }
              ] as { id: IngredientFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setIngredientFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  ingredientFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {[productA, productB].map((prod) => {
            const filtered = filterIngredients(prod.ingredientEvaluations);
            return (
              <div
                key={prod.input.slot}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    {prod.input.name || `Product ${prod.input.slot}`}
                  </span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    Showing {filtered.length} of{' '}
                    {prod.ingredientEvaluations.length}
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No ingredients in{' '}
                    {prod.input.name || `Product ${prod.input.slot}`} match the
                    selected filter.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filtered.map((ing) => {
                      const matchedCouplePriorities =
                        ing.triggeredPriorities.filter((p) =>
                          activePriorities.includes(p)
                        );
                      return (
                        <div key={ing.positionIndex} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-xs font-mono text-slate-400 tabular-nums mr-1.5">
                                #{ing.positionIndex}
                              </span>
                              <span className="text-sm font-semibold text-slate-900">
                                {ing.ingredientName}
                              </span>
                              {ing.isPlasticOrEndocrineConcern && (
                                <span className="ml-2 text-xs font-medium text-red-700">
                                  · Endocrine / Plastic Concern
                                </span>
                              )}
                            </div>
                            {renderRiskLabel(ing.riskTier)}
                          </div>

                          {matchedCouplePriorities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {matchedCouplePriorities.map((pId) => {
                                const opt = HOUSEHOLD_PRIORITY_OPTIONS.find(
                                  (o) => o.id === pId
                                );
                                return (
                                  <span
                                    key={pId}
                                    className="px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-900 rounded"
                                  >
                                    Impacts Your Priority:{' '}
                                    {opt?.shortLabel || pId}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          <div className="text-xs text-slate-500">
                            Authority Cited:{' '}
                            <strong className="text-slate-800">
                              {ing.primaryAuthority}
                            </strong>{' '}
                            · Registry: {ing.registryChecked}
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">
                            <span className="font-medium text-slate-900">
                              Regulatory Status:
                            </span>{' '}
                            {ing.regulatoryStatusAndLimit}
                          </p>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-medium text-slate-800">
                              Health Effects & Function:
                            </span>{' '}
                            {ing.sideEffectsSummary}
                          </p>

                          {ing.coupleHealthImpact && (
                            <p className="text-xs text-teal-950 bg-teal-50/70 border border-teal-200 rounded px-2.5 py-1.5">
                              <strong>Household & Couple Relevance:</strong>{' '}
                              {ing.coupleHealthImpact}
                            </p>
                          )}

                          {ing.conflictResolutionNote && (
                            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
                              <strong>When Agencies Disagree:</strong>{' '}
                              {ing.conflictResolutionNote}
                            </p>
                          )}

                          {ing.contextJournalismNote && (
                            <p className="text-[11px] text-slate-500 italic">
                              Consumer Context Note (Not used for score):{' '}
                              {ing.contextJournalismNote}
                            </p>
                          )}

                          {ing.citationUrl && (
                            <div className="pt-0.5">
                              <a
                                href={ing.citationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline"
                              >
                                Official {ing.primaryAuthority} Reference
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: PACKAGING CLAIM VERIFICATION */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-xl font-semibold text-slate-900">
            04. Packaging Claim & Certifier Verification
          </h3>
          <p className="text-sm text-slate-600">
            Cross-checks front-of-bottle marketing claims against statutory
            definitions, independent certifiers (USP, NSF, USDA Organic), and the
            actual ingredient list.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {[productA, productB].map((prod) => (
            <div
              key={prod.input.slot}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {prod.input.name || `Product ${prod.input.slot}`} Claims Audit
                </span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {prod.claimEvaluations.length} Claim(s)
                </span>
              </div>

              {prod.claimEvaluations.length === 0 ? (
                <div className="p-6 text-xs text-slate-500">
                  No packaging claims entered for this product.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {prod.claimEvaluations.map((claim, idx) => (
                    <div key={idx} className="p-4 space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900">
                          “{claim.claimText}”
                        </span>
                        {renderClaimStatus(claim.status)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Authority: {claim.authorityCited} · Certifying Body:{' '}
                        {claim.certifyingBody}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-medium text-slate-900">
                          Regulatory Standard:
                        </span>{' '}
                        {claim.legalDefinition}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-medium text-slate-900">
                          Audit Finding:
                        </span>{' '}
                        {claim.redFlagWarning}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: WELLBEING SCORE (0-100) & QUALITY ROI SCORECARD */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-xl font-semibold text-slate-900">
            05. Wellbeing Score (0–100) & Household Value ROI Breakdown
          </h3>
          <p className="text-sm text-slate-600">
            Tailored scoring for Personal Care (Leave-On Oils vs. Rinse-Off Soaps
            & Shampoos) and Supplements (Ingredient Safety, Excipients & Dyes,
            Active Bioavailability & NIH ODS Dosage Safety, and Claim Integrity).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-700 w-1/4">
                    Wellbeing Dimension
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-900 w-3/8">
                    Product A: {productA.input.name || 'Product A'}
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-900 w-3/8">
                    Product B: {productB.input.name || 'Product B'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50/50">
                  <td className="py-4 px-4 align-top">
                    <div className="text-sm font-bold text-slate-900">
                      Overall Household Wellbeing Score (0–100)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Includes category weights & active Couple Profile
                      adjustments
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                      {productA.scorecard.wellbeingIndex}/100
                    </div>
                    <div className="text-xs font-medium text-slate-600 mt-0.5">
                      {productA.scorecard.wellbeingTier}
                    </div>
                    {productA.scorecard.profilePenaltyPoints > 0 && (
                      <div className="text-xs text-amber-800 mt-0.5">
                        Base Score: {productA.scorecard.baseWellbeingIndex}/100 (−
                        {productA.scorecard.profilePenaltyPoints} pts from Couple
                        Profile)
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {productA.scorecard.efficacyAndSafetyAnchor}
                    </p>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                      {productB.scorecard.wellbeingIndex}/100
                    </div>
                    <div className="text-xs font-medium text-slate-600 mt-0.5">
                      {productB.scorecard.wellbeingTier}
                    </div>
                    {productB.scorecard.profilePenaltyPoints > 0 && (
                      <div className="text-xs text-amber-800 mt-0.5">
                        Base Score: {productB.scorecard.baseWellbeingIndex}/100 (−
                        {productB.scorecard.profilePenaltyPoints} pts from Couple
                        Profile)
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {productB.scorecard.efficacyAndSafetyAnchor}
                    </p>
                  </td>
                </tr>

                {renderSubScoreRow(
                  productA.scorecard.subScores.ingredientSafety,
                  productB.scorecard.subScores.ingredientSafety
                )}
                {renderSubScoreRow(
                  productA.scorecard.subScores.additivesAndExcipients,
                  productB.scorecard.subScores.additivesAndExcipients
                )}
                {renderSubScoreRow(
                  productA.scorecard.subScores.formulationOrDosage,
                  productB.scorecard.subScores.formulationOrDosage
                )}
                {renderSubScoreRow(
                  productA.scorecard.subScores.claimIntegrity,
                  productB.scorecard.subScores.claimIntegrity
                )}

                {/* Quality ROI Row */}
                <tr className="border-t border-slate-200 bg-teal-50/40">
                  <td className="py-4 px-4 align-top">
                    <div className="text-sm font-bold text-slate-900">
                      Household Value & Quality ROI
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5 tabular-nums">
                      Wellbeing Score ÷ Price ÷ Quantity × 100
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="text-xl font-bold font-mono tabular-nums text-teal-900">
                      {productA.scorecard.qualityRoi !== null
                        ? productA.scorecard.qualityRoi
                        : 'Optional'}
                    </div>
                    <div className="text-xs font-mono text-slate-600 mt-1 tabular-nums">
                      {productA.scorecard.qualityRoiFormulaText}
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="text-xl font-bold font-mono tabular-nums text-teal-900">
                      {productB.scorecard.qualityRoi !== null
                        ? productB.scorecard.qualityRoi
                        : 'Optional'}
                    </div>
                    <div className="text-xs font-mono text-slate-600 mt-1 tabular-nums">
                      {productB.scorecard.qualityRoiFormulaText}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Trade-Offs & Disclaimer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="text-sm font-semibold text-slate-900">
            Key Household Trade-Offs Summary
          </div>
          <ul className="space-y-1.5">
            {verdict.keyTradeOffs.map((item, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-700 flex items-start gap-2"
              >
                <span className="text-teal-700 font-bold select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
            {verdict.medicalDisclaimer}
          </div>
        </div>
      </section>
    </div>
  );
};
