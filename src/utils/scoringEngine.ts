import {
  FLAGGED_ADDITIVES_DB,
  HOUSEHOLD_PRIORITY_OPTIONS,
  SAFE_COMMON_INGREDIENTS
} from '../data/regulatoryData';
import {
  AllowedAuthorityId,
  ClaimEvaluation,
  ComparisonReport,
  ComparisonVerdict,
  EvaluatedProduct,
  GlossaryTerm,
  HouseholdPriorityId,
  IngredientEvaluation,
  ProductHealthRiskExplanation,
  ProductInput,
  ProductScorecard,
  RiskTier,
  SubScoreDetail
} from '../types/product';

export interface AiIngredientAnnotation {
  ingredientName: string;
  riskTier: RiskTier;
  primaryAuthority: AllowedAuthorityId;
  registryChecked: string;
  regulatoryStatusAndLimit: string;
  isPlasticOrEndocrineConcern: boolean;
  sideEffectsSummary: string;
  coupleHealthImpact?: string;
  citationUrl: string;
  conflictResolutionNote?: string;
  vulnerableFlags?: ('children' | 'pregnancy' | 'allergies' | 'fertility')[];
}

export function parseCommaOrLineSeparated(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[,;\n]+/)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => item.length > 0);
}

function deriveTriggeredPriorities(
  vulnerableFlags: ('children' | 'pregnancy' | 'allergies' | 'fertility')[],
  isPlasticOrEndocrineConcern: boolean,
  ingredientName: string,
  riskTier: RiskTier
): HouseholdPriorityId[] {
  if (riskTier === 'Low' || riskTier === 'No authoritative data found') {
    return [];
  }

  const triggered = new Set<HouseholdPriorityId>();
  const lower = ingredientName.toLowerCase();

  if (
    vulnerableFlags.includes('fertility') ||
    isPlasticOrEndocrineConcern ||
    lower.includes('phthalate') ||
    lower.includes('paraben') ||
    lower.includes('fragrance') ||
    lower.includes('parfum') ||
    lower.includes('pyrithione') ||
    lower.includes('triclosan') ||
    lower.includes('bha') ||
    lower.includes('bht')
  ) {
    triggered.add('fertility_conception');
  }

  if (
    vulnerableFlags.includes('pregnancy') ||
    isPlasticOrEndocrineConcern ||
    lower.includes('formaldehyde') ||
    lower.includes('dmdm') ||
    lower.includes('pyrithione') ||
    lower.includes('ashwagandha') ||
    lower.includes('titanium dioxide')
  ) {
    triggered.add('pregnancy_nursing');
  }

  if (
    isPlasticOrEndocrineConcern ||
    vulnerableFlags.includes('fertility') ||
    lower.includes('phthalate') ||
    lower.includes('paraben') ||
    lower.includes('bisphenol') ||
    lower.includes('triclosan') ||
    lower.includes('fragrance') ||
    lower.includes('parfum') ||
    lower.includes('bha') ||
    lower.includes('bht') ||
    lower.includes('red 3')
  ) {
    triggered.add('hormone_endocrine');
  }

  if (
    vulnerableFlags.includes('allergies') ||
    lower.includes('sulfate') ||
    lower.includes('sls') ||
    lower.includes('sles') ||
    lower.includes('methylisothiazolinone') ||
    lower.includes('dmdm') ||
    lower.includes('fragrance') ||
    lower.includes('parfum') ||
    lower.includes('cocamide dea')
  ) {
    triggered.add('sensitive_skin_scalp');
  }

  if (
    lower.includes('titanium dioxide') ||
    lower.includes('e171') ||
    lower.includes('red 40') ||
    lower.includes('yellow 5') ||
    lower.includes('yellow 6') ||
    lower.includes('blue 1') ||
    lower.includes('red 3') ||
    lower.includes('talc') ||
    lower.includes('carrageenan') ||
    lower.includes('hydrogenated') ||
    lower.includes('polysorbate') ||
    lower.includes('aspartame') ||
    lower.includes('sucralose') ||
    lower.includes('bht') ||
    lower.includes('bha')
  ) {
    triggered.add('clean_excipients');
  }

  return Array.from(triggered);
}

export function evaluateSingleIngredient(
  ingredientRaw: string,
  index: number,
  aiAnnotationsMap: Record<string, AiIngredientAnnotation>
): IngredientEvaluation {
  const normalized = ingredientRaw.toLowerCase().trim();

  // 1. Check Flagged Additives & Endocrine/Excipient DB first (deterministic authority)
  for (const additive of FLAGGED_ADDITIVES_DB) {
    const matched = additive.synonyms.some(
      (syn) =>
        normalized === syn.toLowerCase() ||
        normalized.includes(syn.toLowerCase())
    );
    if (matched) {
      const triggeredPriorities = deriveTriggeredPriorities(
        additive.vulnerableGroups,
        additive.isPlasticRelated || additive.category === 'plastic_endocrine',
        ingredientRaw,
        additive.riskTier
      );
      return {
        ingredientName: ingredientRaw,
        normalizedMatch: additive.name,
        positionIndex: index + 1,
        riskTier: additive.riskTier,
        primaryAuthority: additive.primaryAuthority,
        registryChecked: additive.registryName,
        regulatoryStatusAndLimit: additive.regulatoryStatusAndLimit,
        isPlasticOrEndocrineConcern:
          additive.isPlasticRelated || additive.category === 'plastic_endocrine',
        sideEffectsSummary: additive.sideEffectsSummary,
        coupleHealthImpact: additive.coupleHealthImpact,
        citationUrl: additive.citationUrl,
        conflictResolutionNote: additive.conflictNote,
        contextJournalismNote: additive.contextJournalismNote,
        vulnerableFlags: additive.vulnerableGroups,
        triggeredPriorities
      };
    }
  }

  // 2. Check known safe baseline ingredients
  for (const [safeKey, safeVal] of Object.entries(SAFE_COMMON_INGREDIENTS)) {
    if (
      normalized === safeKey.toLowerCase() ||
      normalized.includes(safeKey.toLowerCase())
    ) {
      const isNutOrWheatAllergen =
        normalized.includes('wheat') ||
        normalized.includes('almond') ||
        normalized.includes('prunus amygdalus') ||
        normalized.includes('sesam') ||
        normalized.includes('soy');
      const isAshwagandhaPregnancyFlag = normalized.includes('ashwagandha');
      const vulnerableFlags: ('children' | 'pregnancy' | 'allergies' | 'fertility')[] = [];
      if (isNutOrWheatAllergen) vulnerableFlags.push('allergies');
      if (isAshwagandhaPregnancyFlag) vulnerableFlags.push('pregnancy');

      return {
        ingredientName: ingredientRaw,
        normalizedMatch: safeKey,
        positionIndex: index + 1,
        riskTier: 'Low',
        primaryAuthority: safeVal.authority,
        registryChecked: safeVal.registry,
        regulatoryStatusAndLimit: safeVal.status,
        isPlasticOrEndocrineConcern: false,
        sideEffectsSummary: safeVal.note,
        citationUrl: safeVal.url,
        vulnerableFlags,
        triggeredPriorities: isAshwagandhaPregnancyFlag ? ['pregnancy_nursing'] : []
      };
    }
  }

  // 3. Check AI-verified regulatory lookup if available and valid
  const aiMatch = aiAnnotationsMap[normalized];
  if (aiMatch && aiMatch.primaryAuthority && aiMatch.primaryAuthority !== 'None') {
    const vFlags = aiMatch.vulnerableFlags || [];
    const isEndocrine = Boolean(aiMatch.isPlasticOrEndocrineConcern);
    const triggeredPriorities = deriveTriggeredPriorities(
      vFlags,
      isEndocrine,
      ingredientRaw,
      aiMatch.riskTier
    );
    return {
      ingredientName: ingredientRaw,
      positionIndex: index + 1,
      riskTier: aiMatch.riskTier,
      primaryAuthority: aiMatch.primaryAuthority,
      registryChecked:
        aiMatch.registryChecked || `${aiMatch.primaryAuthority} Official Registry`,
      regulatoryStatusAndLimit: aiMatch.regulatoryStatusAndLimit,
      isPlasticOrEndocrineConcern: isEndocrine,
      sideEffectsSummary: aiMatch.sideEffectsSummary,
      coupleHealthImpact: aiMatch.coupleHealthImpact,
      citationUrl: aiMatch.citationUrl || 'https://www.fda.gov/',
      conflictResolutionNote: aiMatch.conflictResolutionNote,
      vulnerableFlags: vFlags,
      triggeredPriorities
    };
  }

  // 4. Mandatory No-Guessing Citation Rule: Say "No authoritative data found" when no allowed source covers it
  return {
    ingredientName: ingredientRaw,
    positionIndex: index + 1,
    riskTier: 'No authoritative data found',
    primaryAuthority: 'None',
    registryChecked: 'Checked FDA, USDA, EPA, CDC, NIH, EFSA, WHO/IARC, Codex, FSSAI',
    regulatoryStatusAndLimit:
      'No authoritative data found in the 9 official regulatory registries.',
    isPlasticOrEndocrineConcern: false,
    sideEffectsSummary:
      'No specific toxicology monograph or numeric threshold published by the 9 allowed regulatory authorities.',
    citationUrl: '',
    vulnerableFlags: [],
    triggeredPriorities: []
  };
}

export function evaluateClaims(
  input: ProductInput,
  claimsList: string[],
  ingredientEvaluations: IngredientEvaluation[],
  glossary: GlossaryTerm[]
): ClaimEvaluation[] {
  if (claimsList.length === 0) return [];

  const hasHighOrModSynthetic = ingredientEvaluations.some(
    (ing) => ing.riskTier === 'High' || ing.riskTier === 'Moderate'
  );
  const hasPlasticOrEndocrine = ingredientEvaluations.some(
    (ing) => ing.isPlasticOrEndocrineConcern
  );
  const hasSulfates = ingredientEvaluations.some((ing) =>
    ing.ingredientName.toLowerCase().includes('sulfate')
  );
  const hasParabens = ingredientEvaluations.some((ing) =>
    ing.ingredientName.toLowerCase().includes('paraben')
  );
  const hasMineralOilOrSilicone = ingredientEvaluations.some((ing) => {
    const l = ing.ingredientName.toLowerCase();
    return (
      l.includes('mineral oil') ||
      l.includes('paraffinum') ||
      l.includes('petrolatum') ||
      l.includes('siloxane') ||
      l.includes('dimethicone')
    );
  });

  return claimsList.map((rawClaim) => {
    const lowerClaim = rawClaim.toLowerCase().trim();
    const matchedGlossary = glossary.find(
      (g) =>
        g.term.toLowerCase() === lowerClaim ||
        g.aliases.some((alias) => lowerClaim.includes(alias.toLowerCase())) ||
        lowerClaim.includes(g.term.toLowerCase().split('/')[0].trim())
    );

    if (matchedGlossary) {
      let status: ClaimEvaluation['status'] =
        matchedGlossary.verificationRule === 'Verified if Certified'
          ? 'Requires Certifier Proof'
          : matchedGlossary.verificationRule === 'Regulated Threshold'
            ? 'Verified Standard'
            : 'Misleading / Unregulated';

      let redFlagWarning = matchedGlossary.redFlags[0] || '';

      // Cross-check claim against actual ingredients & product details
      if (lowerClaim.includes('sulfate') && lowerClaim.includes('free')) {
        status = hasSulfates ? 'Misleading / Unregulated' : 'Verified Standard';
        redFlagWarning = hasSulfates
          ? 'Contradiction: Ingredient list contains a sulfate surfactant despite Sulfate-Free claim.'
          : 'Confirmed: No alkyl sulfates (SLS/SLES) found on the ingredient declaration.';
      } else if (lowerClaim.includes('paraben') && lowerClaim.includes('free')) {
        status = hasParabens ? 'Misleading / Unregulated' : 'Verified Standard';
        redFlagWarning = hasParabens
          ? 'Contradiction: Ingredient list contains parabens despite Paraben-Free claim.'
          : 'Confirmed: No paraben preservatives detected in the ingredient list.';
      } else if (
        lowerClaim.includes('usp') ||
        lowerClaim.includes('nsf') ||
        lowerClaim.includes('third-party') ||
        lowerClaim.includes('third party')
      ) {
        const cert = input.supplementPanel?.thirdPartyTesting || 'none';
        if (cert === 'usp' || cert === 'nsf' || cert === 'consumerlab') {
          status = 'Verified Standard';
          redFlagWarning = `Confirmed: Product carries recognized independent third-party verification (${cert.toUpperCase()}) for potency and heavy metal purity.`;
        } else {
          status = 'Requires Certifier Proof';
          redFlagWarning =
            'Verify that the bottle displays an official USP Verified or NSF International seal rather than an unaccredited self-claim.';
        }
      } else if (
        (lowerClaim.includes('cold-pressed') ||
          lowerClaim.includes('cold pressed') ||
          lowerClaim.includes('pure oil')) &&
        hasMineralOilOrSilicone
      ) {
        status = 'Misleading / Unregulated';
        redFlagWarning =
          'Contradiction: Claims pure/cold-pressed oil positioning while diluting with petroleum Mineral Oil (Paraffinum Liquidum) or synthetic silicones.';
      } else if (
        (lowerClaim.includes('natural') ||
          lowerClaim.includes('clean') ||
          lowerClaim.includes('hypoallergenic') ||
          lowerClaim.includes('dermatologist')) &&
        hasHighOrModSynthetic
      ) {
        status = 'Misleading / Unregulated';
        redFlagWarning =
          'Product uses unregulated marketing claims while formulating with flagged synthetic surfactants, preservatives, or endocrine-active additives.';
      } else if (
        (lowerClaim.includes('eco') ||
          lowerClaim.includes('biodegradable') ||
          lowerClaim.includes('plastic')) &&
        hasPlasticOrEndocrine
      ) {
        status = 'Misleading / Unregulated';
        redFlagWarning =
          'Environmental claim conflicts with synthetic polymers, silicones, or phthalate/endocrine-linked ingredients in the formula.';
      }

      return {
        claimText: rawClaim,
        status,
        matchedTerm: matchedGlossary.term,
        authorityCited: matchedGlossary.authorityCited,
        certifyingBody: matchedGlossary.certifyingBody,
        legalDefinition: matchedGlossary.legalDefinition,
        redFlagWarning,
        citationUrl: matchedGlossary.citationUrl
      };
    }

    return {
      claimText: rawClaim,
      status: 'Misleading / Unregulated',
      matchedTerm: 'Unlisted Packaging Claim',
      authorityCited: 'FDA',
      certifyingBody: 'No statutory certifying body registered in Claims Glossary',
      legalDefinition:
        'This marketing phrase does not correspond to a defined federal or international standard under FDA, USDA, EFSA, NIH, or FSSAI.',
      redFlagWarning:
        'Unverified marketing claim; rely on the ordered ingredient list and third-party seals rather than front-of-pack promotional copy.',
      citationUrl: 'https://www.fda.gov/cosmetics/cosmetics-labeling-claims'
    };
  });
}

function tierFromScore(score: number): 'Low Risk' | 'Moderate Risk' | 'High Risk' {
  if (score >= 75) return 'Low Risk';
  if (score >= 50) return 'Moderate Risk';
  return 'High Risk';
}

function getSubCategoryLabel(input: ProductInput): string {
  if (input.category === 'personal_care') {
    if (input.subCategory === 'soap') return 'Soap / Body Wash (Rinse-Off)';
    if (input.subCategory === 'oil') return 'Personal Care Oil — Hair, Body & Massage (Leave-On)';
    return 'Shampoo & Scalp Care (Rinse-Off)';
  }
  if (input.subCategory === 'single_nutrient') return 'Single Vitamin / Mineral Supplement';
  if (input.subCategory === 'botanical_herbal') return 'Herbal / Botanical / Ayurvedic Supplement';
  if (input.subCategory === 'omega_specialty') return 'Omega-3 / Probiotic / Specialty Supplement';
  return 'Daily Multivitamin / Couples Wellness Supplement';
}

function buildHealthRiskExplanation(
  input: ProductInput,
  ingredientEvaluations: IngredientEvaluation[],
  activePriorities: HouseholdPriorityId[],
  profilePenaltyPoints: number
): ProductHealthRiskExplanation {
  const isPersonalCare = input.category === 'personal_care';
  const isLeaveOnOil = isPersonalCare && input.subCategory === 'oil';

  const exposureRouteLabel = isPersonalCare
    ? isLeaveOnOil
      ? 'Leave-On Prolonged Dermal Absorption (Personal Care Oil)'
      : `Rinse-Off Dermal & Scalp Exposure (${input.subCategory === 'soap' ? 'Bath Soap / Body Wash' : 'Shampoo / Scalp Cleanser'})`
    : 'Daily Systemic Oral Ingestion (Dietary Supplement)';

  const exposureExplanation = isPersonalCare
    ? isLeaveOnOil
      ? 'Unlike rinse-off cleansers, hair, body, and massage oils remain on the skin and scalp for hours. Lipophilic (fat-soluble) ingredients—including phthalate fragrance solvents, parabens, BHT/BHA, and mineral oil hydrocarbons—absorb more deeply into systemic circulation, carrying a 1.25× exposure weight in our scoring engine.'
      : 'Rinse-off soaps and shampoos contact warm, hydrated skin and scalp follicles in the shower. While brief contact reduces systemic retention compared to leave-on oils, harsh surfactants in the top 5 ingredients can strip the epidermal lipid barrier, and volatile preservatives or fragrances are inhaled in shower steam.'
    : 'Oral supplements are ingested daily for systemic absorption. Every tablet coating, binder, artificial dye, or active nutrient enters the digestive tract and bloodstream directly, making excipient purity, bioavailable nutrient forms, and NIH ODS Tolerable Upper Intake Levels critical for both partners.';

  const flaggedIngredients = ingredientEvaluations.filter(
    (i) => i.riskTier === 'High' || i.riskTier === 'Moderate'
  );

  const primaryHealthRisks: ProductHealthRiskExplanation['primaryHealthRisks'] =
    flaggedIngredients.map((ing) => {
      const matchedPriorityLabels = ing.triggeredPriorities
        .filter((p) => activePriorities.includes(p))
        .map(
          (p) =>
            HOUSEHOLD_PRIORITY_OPTIONS.find((opt) => opt.id === p)?.shortLabel || p
        );

      return {
        title: `${ing.ingredientName} (#${ing.positionIndex} in formula)`,
        severity: ing.riskTier === 'High' ? 'High' : 'Moderate',
        biologicalMechanism: ing.sideEffectsSummary,
        coupleRelevance:
          ing.coupleHealthImpact ||
          (matchedPriorityLabels.length > 0
            ? `Directly impacts your selected household priority: ${matchedPriorityLabels.join(', ')}.`
            : ing.vulnerableFlags.length > 0
              ? `Flagged for household attention regarding: ${ing.vulnerableFlags.join(', ')}.`
              : 'Adds avoidable synthetic chemical load compared to cleaner alternatives.'),
        authorityCitation: `${ing.primaryAuthority} (${ing.registryChecked})`
      };
    });

  if (
    !isPersonalCare &&
    input.supplementPanel?.exceedsUpperLimit
  ) {
    primaryHealthRisks.unshift({
      title: 'Dosage Exceeds NIH ODS Tolerable Upper Intake Level (UL)',
      severity: 'High',
      biologicalMechanism:
        'Consuming fat-soluble vitamins (A, D, E, K) or minerals (Iron, Zinc, Selenium, Vitamin B6) above established NIH Office of Dietary Supplements Upper Limits increases risk of cumulative organ toxicity, hypercalcemia, neuropathy, or teratogenic effects.',
      coupleRelevance:
        'Especially important when couples take multiple overlapping supplements (e.g., a daily multivitamin plus a separate hair/skin or immune booster).',
      authorityCitation: 'NIH Office of Dietary Supplements (ODS) Upper Intake Guidelines'
    });
  }

  const highCount = flaggedIngredients.filter((i) => i.riskTier === 'High').length;
  const modCount = flaggedIngredients.filter((i) => i.riskTier === 'Moderate').length;

  const overallRiskSummary =
    flaggedIngredients.length === 0
      ? `No High- or Moderate-Risk ingredients were identified across the ${ingredientEvaluations.length} declared ingredients. This formulation aligns well with official safety registries for daily household use.`
      : `Identified ${highCount} High-Risk and ${modCount} Moderate-Risk ingredient(s) out of ${ingredientEvaluations.length} declared ingredients (${flaggedIngredients.map((f) => f.ingredientName).join(', ')}). Review the specific biological mechanisms and couple impact notes below.`;

  const activePriorityNames = activePriorities
    .map((id) => HOUSEHOLD_PRIORITY_OPTIONS.find((o) => o.id === id)?.shortLabel)
    .filter(Boolean);

  const profileAdjustmentSummary =
    profilePenaltyPoints > 0
      ? `Household Profile Penalty Applied (−${profilePenaltyPoints} pts): Ingredients in this product triggered your active household priorities (${activePriorityNames.join(', ')}), increasing the safety deduction.`
      : activePriorityNames.length > 0
        ? `Household Profile Checked (0 extra penalty pts): None of the ingredients violated your selected priorities (${activePriorityNames.join(', ')}).`
        : 'No custom Household Profile filters active — scored using baseline regulatory toxicology weights.';

  return {
    exposureRouteLabel,
    exposureExplanation,
    overallRiskSummary,
    primaryHealthRisks,
    profileAdjustmentSummary
  };
}

export function calculateScorecard(
  input: ProductInput,
  ingredientEvaluations: IngredientEvaluation[],
  claimEvaluations: ClaimEvaluation[],
  activePriorities: HouseholdPriorityId[] = []
): ProductScorecard {
  const isPersonalCare = input.category === 'personal_care';
  const isLeaveOnOil = isPersonalCare && input.subCategory === 'oil';

  const highRiskCount = ingredientEvaluations.filter((i) => i.riskTier === 'High').length;
  const modRiskCount = ingredientEvaluations.filter((i) => i.riskTier === 'Moderate').length;
  const plasticOrEndocrineCount = ingredientEvaluations.filter(
    (i) => i.isPlasticOrEndocrineConcern
  ).length;
  const unratedCount = ingredientEvaluations.filter(
    (i) => i.riskTier === 'No authoritative data found'
  ).length;

  // Exposure route multiplier: Leave-on oils stay on skin for hours (1.25x), rinse-off soaps/shampoos (1.0x), ingested supplements (1.15x)
  const exposureMultiplier = isLeaveOnOil ? 1.25 : isPersonalCare ? 1.0 : 1.15;

  // 1. Ingredient Safety (0-100) + Household Profile Sensitivity Penalty
  let baseSafetyDeduction = 0;
  let profileSafetyDeduction = 0;

  ingredientEvaluations.forEach((ing) => {
    const topFiveMultiplier = ing.positionIndex <= 5 ? 1.3 : 1.0;
    let itemDeduction = 0;
    if (ing.riskTier === 'High') {
      itemDeduction = 20 * topFiveMultiplier * exposureMultiplier;
    } else if (ing.riskTier === 'Moderate') {
      itemDeduction = 10 * topFiveMultiplier * exposureMultiplier;
    } else if (ing.riskTier === 'No authoritative data found') {
      itemDeduction = 3;
    }

    baseSafetyDeduction += itemDeduction;

    // Check if this ingredient triggers any of the couple's selected Household Priorities
    const matchedPriorities = ing.triggeredPriorities.filter((p) =>
      activePriorities.includes(p)
    );
    if (matchedPriorities.length > 0 && itemDeduction > 0) {
      // Add +30% extra deduction for the first matched couple priority, +10% for additional matches
      const priorityBoost = Math.min(0.5, 0.3 + (matchedPriorities.length - 1) * 0.1);
      profileSafetyDeduction += itemDeduction * priorityBoost;
    }
  });

  const baseIngredientSafetyScore = Math.max(
    0,
    Math.min(100, Math.round(100 - baseSafetyDeduction))
  );
  const ingredientSafetyScore = Math.max(
    0,
    Math.min(100, Math.round(100 - (baseSafetyDeduction + profileSafetyDeduction)))
  );

  // 2. Additives, Endocrine Disruptors & Excipients (0-100)
  const baseAdditiveDeduction =
    highRiskCount * 22 + modRiskCount * 11 + plasticOrEndocrineCount * 14;
  const profileAdditiveExtra =
    profileSafetyDeduction > 0 ? Math.round(profileSafetyDeduction * 0.6) : 0;
  const baseAdditivesScore = Math.max(
    0,
    Math.min(100, Math.round(100 - baseAdditiveDeduction))
  );
  const additivesScore = Math.max(
    0,
    Math.min(100, Math.round(100 - (baseAdditiveDeduction + profileAdditiveExtra)))
  );

  // 3. Claim Integrity (0-100)
  let claimScore = 88;
  if (claimEvaluations.length > 0) {
    const misleadingCount = claimEvaluations.filter(
      (c) => c.status === 'Misleading / Unregulated'
    ).length;
    const requiresProofCount = claimEvaluations.filter(
      (c) => c.status === 'Requires Certifier Proof'
    ).length;
    const verifiedCount = claimEvaluations.filter(
      (c) => c.status === 'Verified Standard'
    ).length;
    claimScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(90 + verifiedCount * 4 - misleadingCount * 24 - requiresProofCount * 8)
      )
    );
  }
  if (input.unreadableFlags.length > 0) {
    claimScore = Math.max(0, claimScore - 15);
  }

  // 4. Category-Specific 3rd Dimension:
  // - For Personal Care: Dermal Exposure & Barrier Formulation (Weight 15%)
  // - For Supplements: Active Nutrient Bioavailability, Dosage Safety & Third-Party Testing (Weight 25%)
  let formulationOrDosageDetail: SubScoreDetail;
  let wellbeingIndex = 0;
  let baseWellbeingIndex = 0;

  if (isPersonalCare) {
    let barrierScore = 92;
    const lowerRaw = input.ingredientsRaw.toLowerCase();

    if (isLeaveOnOil) {
      // Leave-on oil evaluation: penalize mineral oil, petrolatum, cyclic silicones, BHT, synthetic dyes
      if (lowerRaw.includes('mineral oil') || lowerRaw.includes('paraffinum') || lowerRaw.includes('petrolatum')) {
        barrierScore -= 30;
      }
      if (lowerRaw.includes('siloxane') || lowerRaw.includes('dimethicone')) {
        barrierScore -= 18;
      }
      if (lowerRaw.includes('bht') || lowerRaw.includes('bha')) {
        barrierScore -= 20;
      }
      if (lowerRaw.includes('fragrance') || lowerRaw.includes('parfum')) {
        barrierScore -= 18;
      }
      // Reward cold-pressed nourishing plant oils
      if (
        lowerRaw.includes('jojoba') ||
        lowerRaw.includes('simmondsia') ||
        lowerRaw.includes('argan') ||
        lowerRaw.includes('almond') ||
        lowerRaw.includes('sesam') ||
        lowerRaw.includes('cocos nucifera')
      ) {
        barrierScore += 6;
      }
    } else {
      // Rinse-off soap or shampoo evaluation: check surfactant harshness & barrier support
      if (lowerRaw.includes('sodium lauryl sulfate') || lowerRaw.includes('sls')) {
        barrierScore -= 24;
      } else if (lowerRaw.includes('sodium laureth sulfate') || lowerRaw.includes('sles')) {
        barrierScore -= 18;
      }
      if (lowerRaw.includes('triclosan') || lowerRaw.includes('cocamide dea')) {
        barrierScore -= 25;
      }
      if (
        lowerRaw.includes('glucoside') ||
        lowerRaw.includes('potassium cocoate') ||
        lowerRaw.includes('sodium olivate') ||
        lowerRaw.includes('isethionate') ||
        lowerRaw.includes('glycerin') ||
        lowerRaw.includes('shea')
      ) {
        barrierScore += 6;
      }
    }

    barrierScore = Math.max(10, Math.min(100, Math.round(barrierScore)));

    formulationOrDosageDetail = {
      label: isLeaveOnOil
        ? 'Leave-On Dermal Absorption & Carrier Purity'
        : 'Rinse-Off Cleansing & Skin/Scalp Barrier Balance',
      score: barrierScore,
      weightPercent: 15,
      tier: tierFromScore(barrierScore),
      rationale: isLeaveOnOil
        ? `Evaluates leave-on oil carrier purity (1.25× dermal absorption weight): checks cold-pressed botanical oils vs. petrochemical mineral oil, cyclic silicones, and synthetic antioxidants.`
        : `Evaluates rinse-off ${input.subCategory === 'soap' ? 'bath soap / body cleanser' : 'shampoo'} surfactant mildness, epidermal lipid preservation, and contact sensitizer load.`
    };

    // Personal Care Weights: Ingredient Safety 40%, Additives & Endocrine 30%, Dermal/Barrier 15%, Claim Integrity 15%
    baseWellbeingIndex = Math.round(
      baseIngredientSafetyScore * 0.4 +
        baseAdditivesScore * 0.3 +
        barrierScore * 0.15 +
        claimScore * 0.15
    );
    wellbeingIndex = Math.round(
      ingredientSafetyScore * 0.4 +
        additivesScore * 0.3 +
        barrierScore * 0.15 +
        claimScore * 0.15
    );
  } else {
    // Supplement Active Form, Dosage Safety (NIH ODS) & Third-Party Purity Score (0-100)
    let suppScore = 80;
    const panel = input.supplementPanel || {
      servingSize: '',
      activeIngredientsRaw: '',
      thirdPartyTesting: 'none',
      exceedsUpperLimit: false
    };
    const combinedLower = `${input.ingredientsRaw} ${panel.activeIngredientsRaw}`.toLowerCase();

    // Third-party certification boost/deduction
    if (panel.thirdPartyTesting === 'usp') suppScore += 14;
    else if (panel.thirdPartyTesting === 'nsf') suppScore += 12;
    else if (panel.thirdPartyTesting === 'consumerlab') suppScore += 10;
    else if (panel.thirdPartyTesting === 'cgmp_only') suppScore += 2;
    else suppScore -= 8;

    // Bioavailable nutrient forms vs cheap poorly absorbed forms
    const hasBioavailableForms =
      combinedLower.includes('methylfolate') ||
      combinedLower.includes('5-mthf') ||
      combinedLower.includes('methyltetrahydrofolate') ||
      combinedLower.includes('methylcobalamin') ||
      combinedLower.includes('glycinate') ||
      combinedLower.includes('bisglycinate') ||
      combinedLower.includes('picolinate') ||
      combinedLower.includes('cholecalciferol');
    if (hasBioavailableForms) suppScore += 8;

    const hasLowBioavailableForms =
      combinedLower.includes('magnesium oxide') ||
      combinedLower.includes('zinc oxide') ||
      combinedLower.includes('cyanocobalamin') ||
      combinedLower.includes('synthetic folic acid');
    if (hasLowBioavailableForms) suppScore -= 12;

    if (panel.exceedsUpperLimit) {
      suppScore -= 28;
    }

    // Excipient drag on active delivery
    if (highRiskCount > 0) {
      suppScore -= highRiskCount * 8;
    }

    suppScore = Math.max(10, Math.min(100, Math.round(suppScore)));

    const certLabelMap: Record<string, string> = {
      usp: 'USP Verified',
      nsf: 'NSF Certified',
      consumerlab: 'ConsumerLab Approved',
      cgmp_only: 'cGMP Declared Only',
      none: 'No Independent 3rd-Party Seal Declared'
    };

    formulationOrDosageDetail = {
      label: 'Active Form, Dosage Safety (NIH ODS) & 3rd-Party Purity',
      score: suppScore,
      weightPercent: 25,
      tier: tierFromScore(suppScore),
      rationale: `Serving (${panel.servingSize || 'standard serving'}): ${certLabelMap[panel.thirdPartyTesting] || 'Unverified'}${panel.exceedsUpperLimit ? ' · Flagged for exceeding NIH ODS Upper Intake Level (UL)' : ' · Within NIH ODS safe dosage thresholds'}${hasBioavailableForms ? ' · Uses methylated/chelated bioavailable forms' : ''}.`
    };

    // Supplement Weights: Ingredient Safety 35%, Excipients & Dyes 25%, Active Form & Dosage 25%, Claim Integrity 15%
    baseWellbeingIndex = Math.round(
      baseIngredientSafetyScore * 0.35 +
        baseAdditivesScore * 0.25 +
        suppScore * 0.25 +
        claimScore * 0.15
    );
    wellbeingIndex = Math.round(
      ingredientSafetyScore * 0.35 +
        additivesScore * 0.25 +
        suppScore * 0.25 +
        claimScore * 0.15
    );
  }

  const profilePenaltyPoints = Math.max(0, baseWellbeingIndex - wellbeingIndex);

  const priceNum = parseFloat(input.price);
  const qtyNum = parseFloat(input.quantity);
  const hasValidPriceAndQty =
    !Number.isNaN(priceNum) && priceNum > 0 && !Number.isNaN(qtyNum) && qtyNum > 0;

  // Quality ROI = Wellbeing Index / price / quantity x 100
  const qualityRoi = hasValidPriceAndQty
    ? Number(((wellbeingIndex / priceNum / qtyNum) * 100).toFixed(2))
    : null;

  const unitPrice = hasValidPriceAndQty ? Number((priceNum / qtyNum).toFixed(2)) : 0;

  const wellbeingTier: ProductScorecard['wellbeingTier'] =
    wellbeingIndex >= 75
      ? 'High Wellbeing (75–100)'
      : wellbeingIndex >= 50
        ? 'Moderate Wellbeing (50–74)'
        : 'Low Wellbeing (0–49)';

  const healthRiskExplanation = buildHealthRiskExplanation(
    input,
    ingredientEvaluations,
    activePriorities,
    profilePenaltyPoints
  );

  return {
    wellbeingIndex,
    baseWellbeingIndex,
    profilePenaltyPoints,
    wellbeingTier,
    efficacyAndSafetyAnchor:
      highRiskCount === 0 && modRiskCount <= 1
        ? `Delivers intended ${getSubCategoryLabel(input).toLowerCase()} benefits with minimal regulatory health or endocrine flags.`
        : `Formulation includes ${highRiskCount} High-Risk and ${modRiskCount} Moderate-Risk ingredient flag(s) that pose trade-offs for household wellbeing.`,
    subScores: {
      ingredientSafety: {
        label: 'Ingredient Toxicology & Exposure Safety',
        score: ingredientSafetyScore,
        weightPercent: isPersonalCare ? 40 : 35,
        tier: tierFromScore(ingredientSafetyScore),
        rationale: `${highRiskCount} High-Risk, ${modRiskCount} Moderate-Risk, and ${unratedCount} unrated ingredient(s) across ${ingredientEvaluations.length} total ingredients${isLeaveOnOil ? ' (1.25× leave-on oil dermal weight)' : ''}${profilePenaltyPoints > 0 ? ` — includes Household Profile penalty` : ''}.`
      },
      additivesAndExcipients: {
        label: isPersonalCare
          ? 'Endocrine Disruptors, Preservatives & Surfactants'
          : 'Excipients, Tablet Coatings, Binders & Dyes',
        score: additivesScore,
        weightPercent: isPersonalCare ? 30 : 25,
        tier: tierFromScore(additivesScore),
        rationale: `${plasticOrEndocrineCount} hormone/plastic-linked ingredient(s) and ${highRiskCount + modRiskCount} flagged additive/excipient concern(s).`
      },
      formulationOrDosage: formulationOrDosageDetail,
      claimIntegrity: {
        label: 'Packaging Claim & Certifier Integrity',
        score: claimScore,
        weightPercent: 15,
        tier: tierFromScore(claimScore),
        rationale:
          claimEvaluations.length > 0
            ? `Audited ${claimEvaluations.length} packaging claim(s) against official regulatory definitions and actual ingredients.`
            : 'No front-of-pack promotional claims entered.'
      }
    },
    healthRiskExplanation,
    priceNumeric: !Number.isNaN(priceNum) && priceNum > 0 ? priceNum : 0,
    quantityNumeric: !Number.isNaN(qtyNum) && qtyNum > 0 ? qtyNum : 0,
    quantityUnit: input.quantityUnit,
    unitPrice,
    qualityRoi,
    qualityRoiFormulaText: hasValidPriceAndQty
      ? `${wellbeingIndex} (Wellbeing) ÷ $${priceNum.toFixed(2)} ÷ ${qtyNum} ${input.quantityUnit} × 100 = ${qualityRoi}`
      : 'Price or quantity omitted (optional) — Quality ROI skipped'
  };
}

export function buildComparisonReport(
  inputA: ProductInput,
  inputB: ProductInput,
  glossary: GlossaryTerm[],
  aiAnnotationsMap: Record<string, AiIngredientAnnotation> = {},
  activePriorities: HouseholdPriorityId[] = []
): ComparisonReport {
  const evaluateProduct = (input: ProductInput): EvaluatedProduct => {
    const claimsList = parseCommaOrLineSeparated(input.claimsRaw);
    const baseIngredients = parseCommaOrLineSeparated(input.ingredientsRaw);
    const activeSuppIngredients =
      input.category === 'supplement' && input.supplementPanel?.activeIngredientsRaw
        ? parseCommaOrLineSeparated(input.supplementPanel.activeIngredientsRaw)
        : [];

    // Combine active ingredients and full/other ingredients without duplicates
    const combinedSet = new Set<string>();
    const ingredientsList: string[] = [];
    [...activeSuppIngredients, ...baseIngredients].forEach((item) => {
      const key = item.toLowerCase().trim();
      if (key && !combinedSet.has(key)) {
        combinedSet.add(key);
        ingredientsList.push(item);
      }
    });

    const ingredientEvaluations = ingredientsList.map((ing, idx) =>
      evaluateSingleIngredient(ing, idx, aiAnnotationsMap)
    );
    const claimEvaluations = evaluateClaims(
      input,
      claimsList,
      ingredientEvaluations,
      glossary
    );
    const scorecard = calculateScorecard(
      input,
      ingredientEvaluations,
      claimEvaluations,
      activePriorities
    );

    return {
      input,
      claimsList,
      ingredientsList,
      ingredientEvaluations,
      claimEvaluations,
      scorecard
    };
  };

  const productA = evaluateProduct(inputA);
  const productB = evaluateProduct(inputB);

  const scoreDiff =
    productA.scorecard.wellbeingIndex - productB.scorecard.wellbeingIndex;
  let betterChoice: 'A' | 'B' | 'Tie' = 'Tie';
  if (Math.abs(scoreDiff) >= 3) {
    betterChoice = scoreDiff > 0 ? 'A' : 'B';
  } else if (
    productA.scorecard.qualityRoi !== null &&
    productB.scorecard.qualityRoi !== null &&
    productA.scorecard.qualityRoi !== productB.scorecard.qualityRoi
  ) {
    betterChoice =
      productA.scorecard.qualityRoi > productB.scorecard.qualityRoi ? 'A' : 'B';
  }

  const winner = betterChoice === 'B' ? productB : productA;
  const runnerUp = betterChoice === 'B' ? productA : productB;

  const headlineSummary =
    betterChoice === 'Tie'
      ? `${productA.input.name || 'Product A'} and ${productB.input.name || 'Product B'} achieve comparable Household Wellbeing Scores (${productA.scorecard.wellbeingIndex}/100 vs. ${productB.scorecard.wellbeingIndex}/100).`
      : `${winner.input.brand ? `${winner.input.brand} ` : ''}${winner.input.name} is the healthier choice for your household (${winner.scorecard.wellbeingIndex}/100 vs. ${runnerUp.scorecard.wellbeingIndex}/100).`;

  const highRiskA = productA.ingredientEvaluations.filter(
    (i) => i.riskTier === 'High'
  );
  const highRiskB = productB.ingredientEvaluations.filter(
    (i) => i.riskTier === 'High'
  );

  const bothHaveRoi =
    productA.scorecard.qualityRoi !== null &&
    productB.scorecard.qualityRoi !== null;

  const runnerUpFlaggedNames = runnerUp.ingredientEvaluations
    .filter(
      (i) => i.riskTier !== 'Low' && i.riskTier !== 'No authoritative data found'
    )
    .map((i) => i.ingredientName)
    .slice(0, 4)
    .join(', ');

  const plainLanguageExplanation =
    betterChoice === 'Tie'
      ? bothHaveRoi
        ? `Both products perform similarly across toxicological safety and label honesty. Compare their unit cost ($${productA.scorecard.unitPrice}/${productA.input.quantityUnit} vs. $${productB.scorecard.unitPrice}/${productB.input.quantityUnit}) and review the couple sensitivity notes below to decide together.`
        : `Both products perform similarly across toxicological safety and label honesty. Review the specific couple and household sensitivity callouts below to pick the best fit.`
      : `${winner.input.name} scores ${Math.abs(scoreDiff)} points higher because it avoids the primary health-risk ingredients found in ${runnerUp.input.name} (${runnerUpFlaggedNames || 'flagged synthetic additives'}) while offering cleaner formulation integrity for daily shared use.`;

  const winnerRisks = winner.ingredientEvaluations.filter(
    (i) => i.riskTier === 'High' || i.riskTier === 'Moderate'
  );
  const coupleDecisionGuide =
    betterChoice === 'Tie'
      ? 'Both options carry a similar safety profile—check whether either partner has a specific skin/scalp allergen or supplement sensitivity listed below before buying.'
      : winnerRisks.length === 0
        ? `Safe to share for both partners: ${winner.input.name} contains zero High- or Moderate-Risk flags across official registries, making it an easy household staple.`
        : `${winner.input.name} is the healthier option overall, though couples should still note ${winnerRisks.length} flag(s) (${winnerRisks.map((r) => r.ingredientName).join(', ')}) if either partner is specifically sensitive.`;

  const keyTradeOffs: string[] = [
    `Health Risk Comparison: ${productA.input.name || 'Product A'} carries ${highRiskA.length} High-Risk and ${productA.ingredientEvaluations.filter((i) => i.riskTier === 'Moderate').length} Moderate-Risk flag(s), whereas ${productB.input.name || 'Product B'} carries ${highRiskB.length} High-Risk and ${productB.ingredientEvaluations.filter((i) => i.riskTier === 'Moderate').length} Moderate-Risk flag(s).`
  ];

  if (
    productA.scorecard.profilePenaltyPoints > 0 ||
    productB.scorecard.profilePenaltyPoints > 0
  ) {
    keyTradeOffs.push(
      `Couple Profile Impact: Your active Household Profile priorities adjusted ${productA.input.name || 'Product A'} by −${productA.scorecard.profilePenaltyPoints} pts (from ${productA.scorecard.baseWellbeingIndex} to ${productA.scorecard.wellbeingIndex}) and ${productB.input.name || 'Product B'} by −${productB.scorecard.profilePenaltyPoints} pts (from ${productB.scorecard.baseWellbeingIndex} to ${productB.scorecard.wellbeingIndex}).`
    );
  }

  if (bothHaveRoi) {
    keyTradeOffs.push(
      `Household Budget & Quality ROI: ${productA.input.name || 'Product A'} costs $${productA.scorecard.priceNumeric.toFixed(2)} for ${productA.scorecard.quantityNumeric} ${productA.input.quantityUnit} ($${productA.scorecard.unitPrice}/${productA.input.quantityUnit}, ROI ${productA.scorecard.qualityRoi}), compared to $${productB.scorecard.priceNumeric.toFixed(2)} for ${productB.scorecard.quantityNumeric} ${productB.input.quantityUnit} ($${productB.scorecard.unitPrice}/${productB.input.quantityUnit}, ROI ${productB.scorecard.qualityRoi}) for ${productB.input.name || 'Product B'}.`
    );
  }

  if (
    productA.input.unreadableFlags.length > 0 ||
    productB.input.unreadableFlags.length > 0
  ) {
    keyTradeOffs.push(
      'Unreadable Label Notice: At least one product had partially illegible label sections flagged during intake; scores reflect only verified readable text without guessing.'
    );
  }

  const roiComparisonSummary = bothHaveRoi
    ? `${productA.input.name || 'Product A'} achieves a Quality ROI of ${productA.scorecard.qualityRoi} versus ${productB.scorecard.qualityRoi} for ${productB.input.name || 'Product B'}.`
    : 'Price/quantity optional — verdict is based on the Household Wellbeing Score (0–100). Add price and size anytime to compare Quality ROI.';

  const gatherPrecautions = (
    group: 'fertility' | 'pregnancy' | 'allergies' | 'children',
    emptyMessage: string
  ): string[] => {
    const notes: string[] = [];
    [productA, productB].forEach((prod) => {
      const flagged = prod.ingredientEvaluations.filter((ing) =>
        ing.vulnerableFlags.includes(group)
      );
      if (flagged.length > 0) {
        const names = flagged
          .map((f) => `${f.ingredientName} (${f.primaryAuthority})`)
          .join(', ');
        const impactDetail =
          flagged.find((f) => f.coupleHealthImpact)?.coupleHealthImpact ||
          flagged[0].sideEffectsSummary;
        notes.push(
          `${prod.input.name || `Product ${prod.input.slot}`}: Flagged for ${names}. ${impactDetail}`
        );
      }
    });
    if (notes.length === 0) {
      notes.push(emptyMessage);
    }
    return notes;
  };

  const verdict: ComparisonVerdict = {
    betterChoice,
    headlineSummary,
    plainLanguageExplanation,
    coupleDecisionGuide,
    keyTradeOffs,
    roiComparisonSummary,
    precautions: {
      fertilityAndHormones: gatherPrecautions(
        'fertility',
        'Neither product contains ingredients flagged for male or female reproductive/endocrine disruption.'
      ),
      pregnancyAndNursing: gatherPrecautions(
        'pregnancy',
        'No specific pregnancy or nursing regulatory red flags identified in the declared ingredients of either product.'
      ),
      skinAndAllergies: gatherPrecautions(
        'allergies',
        'No common contact sensitizers, harsh sulfate detergents, or declared allergens flagged in either product.'
      ),
      householdAndChildren: gatherPrecautions(
        'children',
        'No child-specific toxicological warnings identified if shared with younger family members.'
      )
    },
    medicalDisclaimer:
      'Informational Household Label Analysis — Not Medical Advice: This comparison translates official regulatory registries (FDA, USDA, EPA, CDC, NIH, EFSA, WHO/IARC, Codex Alimentarius, FSSAI) into plain language to help couples and households compare personal care and supplement labels. It does not diagnose, treat, or replace personalized guidance from your physician, OB-GYN, dermatologist, or pharmacist.'
  };

  return {
    id: `cmp-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    activePriorities,
    productA,
    productB,
    verdict
  };
}
