export type ProductCategory = 'personal_care' | 'supplement';

export type PersonalCareSubCategory = 'soap' | 'shampoo' | 'oil';

export type SupplementSubCategory =
  | 'multivitamin'
  | 'single_nutrient'
  | 'botanical_herbal'
  | 'omega_specialty';

export type ProductSubCategory = PersonalCareSubCategory | SupplementSubCategory;

export type InputMode = 'photo' | 'link_barcode' | 'hybrid';

export type RiskTier = 'Low' | 'Moderate' | 'High' | 'No authoritative data found';

export type HouseholdPriorityId =
  | 'fertility_conception'
  | 'pregnancy_nursing'
  | 'hormone_endocrine'
  | 'sensitive_skin_scalp'
  | 'clean_excipients';

export interface HouseholdPriorityOption {
  id: HouseholdPriorityId;
  label: string;
  shortLabel: string;
  description: string;
  coupleRelevance: string;
}

export type AllowedAuthorityId =
  | 'FDA'
  | 'USDA'
  | 'EPA'
  | 'CDC'
  | 'NIH'
  | 'EFSA'
  | 'WHO/IARC'
  | 'Codex Alimentarius'
  | 'FSSAI'
  | 'None';

export interface AllowedBody {
  id: AllowedAuthorityId;
  name: string;
  fullName: string;
  jurisdiction: string;
  conflictRank: number;
  scope: string;
  url: string;
}

export interface OfficialRegistry {
  id: string;
  name: string;
  authority: AllowedAuthorityId;
  url: string;
  whatItCovers: string;
  howToRead: string[];
  checkRecordFields: string[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  aliases: string[];
  category: 'core_label' | 'questioned_claim' | 'environment_body' | 'personal_care';
  legalDefinition: string;
  certifyingBody: string;
  authorityCited: AllowedAuthorityId;
  citationUrl: string;
  redFlags: string[];
  verificationRule: 'Verified if Certified' | 'Regulated Threshold' | 'Unregulated / Marketing Term';
}

export interface FlaggedAdditive {
  id: string;
  name: string;
  synonyms: string[];
  category:
    | 'food_additive'
    | 'personal_care_preservative'
    | 'plastic_endocrine'
    | 'colorant_sweetener'
    | 'supplement_excipient'
    | 'surfactant_cleanser';
  isPlasticRelated: boolean;
  riskTier: 'Low' | 'Moderate' | 'High';
  primaryAuthority: AllowedAuthorityId;
  registryName: string;
  regulatoryStatusAndLimit: string;
  conflictNote?: string;
  sideEffectsSummary: string;
  coupleHealthImpact?: string;
  vulnerableGroups: ('children' | 'pregnancy' | 'allergies' | 'fertility')[];
  citationUrl: string;
  contextJournalismNote?: string;
}

export type ThirdPartyCertStatus =
  | 'none'
  | 'usp'
  | 'nsf'
  | 'consumerlab'
  | 'cgmp_only';

export interface SupplementPanelData {
  servingSize: string;
  activeIngredientsRaw: string;
  thirdPartyTesting: ThirdPartyCertStatus;
  exceedsUpperLimit: boolean;
}

export interface ProductInput {
  slot: 'A' | 'B';
  name: string;
  brand: string;
  category: ProductCategory;
  subCategory: ProductSubCategory;
  inputMode: InputMode;
  frontPhotoBase64?: string;
  frontPhotoName?: string;
  backPhotoBase64?: string;
  backPhotoName?: string;
  weblinkOrBarcode: string;
  price: string;
  quantity: string;
  quantityUnit: 'oz' | 'fl oz' | 'ml' | 'g' | 'lb' | 'servings' | 'count';
  claimsRaw: string;
  ingredientsRaw: string;
  supplementPanel: SupplementPanelData;
  unreadableFlags: string[];
}

export interface IngredientEvaluation {
  ingredientName: string;
  normalizedMatch?: string;
  positionIndex: number;
  riskTier: RiskTier;
  primaryAuthority: AllowedAuthorityId;
  registryChecked: string;
  regulatoryStatusAndLimit: string;
  isPlasticOrEndocrineConcern: boolean;
  sideEffectsSummary: string;
  coupleHealthImpact?: string;
  citationUrl: string;
  conflictResolutionNote?: string;
  contextJournalismNote?: string;
  vulnerableFlags: ('children' | 'pregnancy' | 'allergies' | 'fertility')[];
  triggeredPriorities: HouseholdPriorityId[];
}

export interface ClaimEvaluation {
  claimText: string;
  status: 'Verified Standard' | 'Requires Certifier Proof' | 'Misleading / Unregulated';
  matchedTerm?: string;
  authorityCited: AllowedAuthorityId;
  certifyingBody: string;
  legalDefinition: string;
  redFlagWarning: string;
  citationUrl: string;
}

export interface SubScoreDetail {
  label: string;
  score: number | 'N/A';
  weightPercent: number;
  tier: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Not Applicable';
  rationale: string;
}

export interface ProductHealthRiskExplanation {
  exposureRouteLabel: string;
  exposureExplanation: string;
  overallRiskSummary: string;
  primaryHealthRisks: {
    title: string;
    severity: 'High' | 'Moderate' | 'Low';
    biologicalMechanism: string;
    coupleRelevance: string;
    authorityCitation: string;
  }[];
  profileAdjustmentSummary: string;
}

export interface ProductScorecard {
  wellbeingIndex: number;
  baseWellbeingIndex: number;
  profilePenaltyPoints: number;
  wellbeingTier: 'High Wellbeing (75–100)' | 'Moderate Wellbeing (50–74)' | 'Low Wellbeing (0–49)';
  efficacyAndSafetyAnchor: string;
  subScores: {
    ingredientSafety: SubScoreDetail;
    additivesAndExcipients: SubScoreDetail;
    formulationOrDosage: SubScoreDetail;
    claimIntegrity: SubScoreDetail;
  };
  healthRiskExplanation: ProductHealthRiskExplanation;
  priceNumeric: number;
  quantityNumeric: number;
  quantityUnit: string;
  unitPrice: number;
  qualityRoi: number | null;
  qualityRoiFormulaText: string;
}

export interface EvaluatedProduct {
  input: ProductInput;
  claimsList: string[];
  ingredientsList: string[];
  ingredientEvaluations: IngredientEvaluation[];
  claimEvaluations: ClaimEvaluation[];
  scorecard: ProductScorecard;
}

export interface ComparisonVerdict {
  betterChoice: 'A' | 'B' | 'Tie';
  headlineSummary: string;
  plainLanguageExplanation: string;
  coupleDecisionGuide: string;
  keyTradeOffs: string[];
  roiComparisonSummary: string;
  precautions: {
    fertilityAndHormones: string[];
    pregnancyAndNursing: string[];
    skinAndAllergies: string[];
    householdAndChildren: string[];
  };
  medicalDisclaimer: string;
}

export interface ComparisonReport {
  id: string;
  generatedAt: string;
  activePriorities: HouseholdPriorityId[];
  productA: EvaluatedProduct;
  productB: EvaluatedProduct;
  verdict: ComparisonVerdict;
}
