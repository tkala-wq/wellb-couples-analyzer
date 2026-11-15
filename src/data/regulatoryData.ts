import {
  AllowedBody,
  FlaggedAdditive,
  GlossaryTerm,
  HouseholdPriorityOption,
  OfficialRegistry,
  ProductInput
} from '../types/product';

export const HOUSEHOLD_PRIORITY_OPTIONS: HouseholdPriorityOption[] = [
  {
    id: 'fertility_conception',
    label: 'Trying to Conceive & Reproductive Health',
    shortLabel: 'Fertility & Reproductive Health',
    description:
      'Applies stricter scoring deductions and callouts for ingredients linked to male sperm quality, female ovarian/hormonal balance, or reproductive toxicity (phthalates, parabens, BPA/BPS, Zinc Pyrithione, BHA/BHT).',
    coupleRelevance:
      'Endocrine disruptors in daily soaps, shampoos, leave-on oils, and supplements affect both male and female fertility parameters.'
  },
  {
    id: 'pregnancy_nursing',
    label: 'Pregnancy & Nursing Safety',
    shortLabel: 'Pregnancy & Nursing',
    description:
      'Penalizes and flags ingredients with fetal neurodevelopmental, transplacental, or lactation concerns (phthalates, formaldehyde releasers, synthetic azo dyes, excess preformed retinol/megadoses).',
    coupleRelevance:
      'Helps expecting or nursing couples audit leave-on body oils, hair care, and prenatal/daily supplements before bringing them home.'
  },
  {
    id: 'hormone_endocrine',
    label: 'Endocrine & Hormone Protection',
    shortLabel: 'Hormone & Endocrine Safe',
    description:
      'Targets xenoestrogens, plasticizers, and thyroid/hormone-interfering compounds across personal care and supplement coatings.',
    coupleRelevance:
      'Shared bathroom staples used daily accumulate dermal and oral exposure for both partners.'
  },
  {
    id: 'sensitive_skin_scalp',
    label: 'Sensitive Skin, Eczema & Scalp Barrier',
    shortLabel: 'Sensitive Skin & Scalp',
    description:
      'Applies heavier deductions for harsh sulfate detergents (SLS/SLES), contact allergens (MI/MCI, DMDM Hydantoin), and synthetic fragrance sensitizers.',
    coupleRelevance:
      'Ensures shared shower soaps, shampoos, and massage/hair oils work comfortably for both partners without triggering dermatitis.'
  },
  {
    id: 'clean_excipients',
    label: 'Clean Supplement Excipients & Dye-Free',
    shortLabel: 'Dye-Free & Clean Fillers',
    description:
      'Penalizes unnecessary tablet coatings, nanoparticle whiteners (Titanium Dioxide E171), synthetic petroleum dyes (Red 40, Yellow 5/6), talc, and carrageenan.',
    coupleRelevance:
      'Keeps daily vitamins and supplements free from synthetic colorants and controversial binders.'
  }
];

export const ALLOWED_BODIES: AllowedBody[] = [
  {
    id: 'WHO/IARC',
    name: 'WHO / IARC',
    fullName: 'World Health Organization & International Agency for Research on Cancer',
    jurisdiction: 'International / UN',
    conflictRank: 1,
    scope: 'Carcinogenicity monographs (Groups 1, 2A, 2B), global public health toxicology, and micronutrient guidelines.',
    url: 'https://monographs.iarc.who.int/'
  },
  {
    id: 'EFSA',
    name: 'EFSA',
    fullName: 'European Food Safety Authority',
    jurisdiction: 'European Union',
    conflictRank: 2,
    scope: 'Precautionary scientific opinions on supplement additives (E-numbers), food/supplement contact plastics (BPA, phthalates), and cosmetic/novel ingredients.',
    url: 'https://www.efsa.europa.eu/'
  },
  {
    id: 'FDA',
    name: 'FDA',
    fullName: 'U.S. Food and Drug Administration',
    jurisdiction: 'United States',
    conflictRank: 3,
    scope: 'Cosmetics (MoCRA), OTC drug monographs (anti-dandruff/antibacterial soaps), Dietary Supplement cGMP (21 CFR Part 111), GRAS Notices, and Import Alerts.',
    url: 'https://www.fda.gov/cosmetics'
  },
  {
    id: 'USDA',
    name: 'USDA (NOP)',
    fullName: 'U.S. Department of Agriculture — National Organic Program',
    jurisdiction: 'United States',
    conflictRank: 4,
    scope: 'National Organic Program (7 CFR Part 205) for certified organic botanical oils, personal care agricultural ingredients, and herbal supplements.',
    url: 'https://www.ams.usda.gov/about-ams/programs-offices/national-organic-program'
  },
  {
    id: 'EPA',
    name: 'EPA',
    fullName: 'U.S. Environmental Protection Agency',
    jurisdiction: 'United States',
    conflictRank: 5,
    scope: 'Safer Choice Chemical Ingredient List for soaps/surfactants, antimicrobial tolerances, and microplastic polymer environmental persistence.',
    url: 'https://www.epa.gov/saferchoice/safer-ingredients'
  },
  {
    id: 'NIH',
    name: 'NIH',
    fullName: 'National Institutes of Health (ODS & NIEHS)',
    jurisdiction: 'United States',
    conflictRank: 6,
    scope: 'Office of Dietary Supplements (ODS) Tolerable Upper Intake Levels (UL), NIEHS endocrine disruptor research, and National Toxicology Program (NTP) monographs.',
    url: 'https://ods.od.nih.gov/'
  },
  {
    id: 'CDC',
    name: 'CDC',
    fullName: 'Centers for Disease Control and Prevention (ATSDR)',
    jurisdiction: 'United States',
    conflictRank: 7,
    scope: 'Human biomonitoring data on phthalates, bisphenols, parabens, heavy metals, and reproductive/household exposure guidance.',
    url: 'https://www.cdc.gov/biomonitoring/'
  },
  {
    id: 'Codex Alimentarius',
    name: 'Codex Alimentarius',
    fullName: 'FAO/WHO Codex Alimentarius Commission',
    jurisdiction: 'International',
    conflictRank: 8,
    scope: 'Guidelines for Vitamin and Mineral Food Supplements (CAC/GL 55), General Standard for Additives, and edible/botanical oil purity standards.',
    url: 'https://www.fao.org/fao-who-codexalimentarius/'
  },
  {
    id: 'FSSAI',
    name: 'FSSAI',
    fullName: 'Food Safety and Standards Authority of India',
    jurisdiction: 'India',
    conflictRank: 9,
    scope: 'Health Supplements & Nutraceutical Regulations and Ayurvedic/botanical standardization (relevant to herbal hair oils, soaps, and Ayurvedic supplements).',
    url: 'https://www.fssai.gov.in/'
  }
];

export const SOURCE_CONFLICT_RULES = [
  {
    title: '1. Precautionary Threshold Precedence (When Agencies Disagree)',
    description:
      'When two official regulatory bodies disagree on an ingredient risk level (for example, Titanium Dioxide E171 banned in supplements/ingestibles by EFSA while still permitted by the FDA, or Zinc Pyrithione banned in EU cosmetics while allowed in FDA OTC shampoos), the stricter precautionary finding sets the Risk Tier, and BOTH official positions are explained side by side.'
  },
  {
    title: '2. Strictly Official Regulatory Authorities Only',
    description:
      'Risk ratings and health explanations cite only FDA, USDA (NOP), EPA, CDC, NIH (ODS/NIEHS/NTP), EFSA, WHO/IARC, Codex Alimentarius, or FSSAI. No consumer blogs, wellness influencers, or proprietary third-party app scores are used.'
  },
  {
    title: '3. Journalism & Media Separation Rule',
    description:
      'Investigative journalism (such as The New York Times or Consumer Reports) may be noted strictly as secondary consumer context and is never used to calculate or justify an ingredient Risk Tier or Wellbeing Score deduction.'
  },
  {
    title: '4. Mandatory Citation & No-Guessing Honesty Rule',
    description:
      'Every health risk explanation names its authoritative source and registry. When no allowed authority has published toxicological or regulatory guidance for a proprietary botanical or novel ingredient, the report states "No authoritative data found" rather than guessing.'
  }
];

export const OFFICIAL_REGISTRIES: OfficialRegistry[] = [
  {
    id: 'nih-ods-fact-sheets',
    name: 'NIH Office of Dietary Supplements (ODS) & NIEHS Endocrine Registries',
    authority: 'NIH',
    url: 'https://ods.od.nih.gov/factsheets/list-all/',
    whatItCovers:
      'Recommended Dietary Allowances (RDA), Tolerable Upper Intake Levels (UL), active vitamin/mineral bioavailability, supplement-drug interactions, and NIEHS endocrine disruptor assessments.',
    howToRead: [
      'Check the chemical form of the vitamin or mineral (e.g., methylated folate vs. unreduced folic acid; chelated magnesium glycinate vs. magnesium oxide).',
      'Compare the per-serving dose against the NIH ODS Tolerable Upper Intake Level (UL) for adult men, adult women, and pregnancy.',
      'Review NIEHS toxicology summaries for phthalate plasticizers, parabens, and bisphenols in personal care.'
    ],
    checkRecordFields: ['Nutrient / Agent Name', 'Chemical Form & Bioavailability', 'Adult & Pregnancy Upper Limit (UL)', 'Endocrine / Interaction Flag']
  },
  {
    id: 'fda-cosmetics-supplements',
    name: 'FDA Cosmetics (MoCRA), OTC Monographs & Dietary Supplement Registry',
    authority: 'FDA',
    url: 'https://www.fda.gov/cosmetics/cosmetics-laws-regulations',
    whatItCovers:
      'Prohibited and restricted cosmetic ingredients (21 CFR Part 700), OTC anti-dandruff and antiseptic soap monographs, and 21 CFR Part 111 cGMP supplement rules.',
    howToRead: [
      'Verify INCI ingredient names in label order (first 5 ingredients make up the bulk of a soap, shampoo, or oil).',
      'Check whether active therapeutic claims (e.g., anti-dandruff, antibacterial) rely on permitted OTC monograph actives.',
      'Inspect excipient and color additive declarations under 21 CFR Part 74/172.'
    ],
    checkRecordFields: ['Registry / 21 CFR Citation', 'Regulatory Status', 'Permitted Concentration Limit', 'Contaminant / Byproduct Advisory']
  },
  {
    id: 'efsa-openfoodtox',
    name: 'EFSA OpenFoodTox & EU Cosmetic Safety Opinions (SCCS)',
    authority: 'EFSA',
    url: 'https://www.efsa.europa.eu/en/data-report/chemical-hazards-database-openfoodtox',
    whatItCovers:
      'Precautionary re-evaluations of supplement excipients (such as E171 Titanium Dioxide), packaging plasticizers (BPA, phthalates), and leave-on vs. rinse-off preservative safety.',
    howToRead: [
      'Search the substance name or E-number (e.g., E171 Titanium Dioxide, Propylparaben, Bisphenol A).',
      'Check whether EFSA has lowered the Tolerable Daily Intake (TDI) or concluded that genotoxicity/endocrine safety cannot be established.'
    ],
    checkRecordFields: ['EFSA Opinion ID', 'Tolerable Intake / Safety Verdict', 'Genotoxicity / Reproductive Flag', 'Publication Year']
  },
  {
    id: 'epa-safer-choice',
    name: 'EPA Safer Choice Chemical Ingredient List',
    authority: 'EPA',
    url: 'https://www.epa.gov/saferchoice/safer-ingredients',
    whatItCovers:
      'Human and environmental toxicology screening for surfactants, chelators, solvents, and fragrances used in soaps, body washes, and shampoos.',
    howToRead: [
      'Look up the surfactant or chelator functional class.',
      'Green Circle / Half-Circle indicates verified low concern for dermal irritation and aquatic bioaccumulation.',
      'Identify persistent synthetic polymers or high-irritation anionic detergents.'
    ],
    checkRecordFields: ['Chemical / INCI Name', 'Functional Class', 'EPA Safer Choice Status', 'Dermal & Aquatic Hazard Note']
  },
  {
    id: 'usda-organic-integrity',
    name: 'USDA Organic Integrity Database',
    authority: 'USDA',
    url: 'https://organic.ams.usda.gov/integrity/',
    whatItCovers:
      'Official registry of certified organic operations for carrier oils (jojoba, argan, coconut, almond), botanical soaps, and organic herbal supplements.',
    howToRead: [
      'Search the brand or certified processor name.',
      'Confirm that personal care oils or herbal supplements claiming "Organic" carry at least 95% certified organic agricultural content (or 70% for "Made with Organic").'
    ],
    checkRecordFields: ['NOP Operation ID', 'Certifying Agent', 'Operation Status', 'Certified Scope']
  }
];

export const INITIAL_GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'term-usp-nsf-verified',
    term: 'USP Verified / NSF Certified Supplement',
    aliases: ['usp verified', 'usp', 'nsf certified', 'nsf', 'consumerlab', 'third-party tested', 'third party tested'],
    category: 'core_label',
    legalDefinition:
      'Under FDA 21 CFR Part 111, dietary supplements do not undergo pre-market FDA approval for efficacy or label accuracy. Independent accreditation by the U.S. Pharmacopeia (USP) or NSF International verifies that the supplement actually contains the declared active potency, disintegrates properly for absorption, and is screened for heavy metals (lead, mercury, arsenic, cadmium) and microbes.',
    certifyingBody: 'U.S. Pharmacopeia (USP) / NSF International',
    authorityCited: 'NIH',
    citationUrl: 'https://ods.od.nih.gov/HealthInformation/DS_WhatYouNeedToKnow.aspx',
    redFlags: [
      'Supplement claims "Third-Party Tested" or "Lab Verified" without naming an independent accrediting body (USP, NSF, or ISO-17025 lab).',
      'Claims "FDA Approved" on a dietary supplement (illegal marketing; FDA does not approve dietary supplements before marketing).'
    ],
    verificationRule: 'Verified if Certified'
  },
  {
    id: 'term-usda-organic',
    term: 'Organic / USDA Organic',
    aliases: ['organic', 'usda organic', '100% organic', 'certified organic'],
    category: 'core_label',
    legalDefinition:
      'Under 7 CFR Part 205, "100% Organic" requires 100% certified organic ingredients; "Organic" requires at least 95% certified organic agricultural ingredients (excluding water and salt), produced without synthetic pesticides, hexane solvent extraction, or ionizing radiation.',
    certifyingBody: 'USDA National Organic Program (NOP) Accredited Certifying Agent (or India Organic / NPOP under FSSAI)',
    authorityCited: 'USDA',
    citationUrl: 'https://www.ams.usda.gov/rules-regulations/organic/labeling',
    redFlags: [
      'Soap, shampoo, or body oil uses "Organic" on the front label while its primary surfactants or preservatives are synthetic petrochemicals.',
      'Front label claims "Organic" without naming an accredited certifying agent on the back panel.'
    ],
    verificationRule: 'Verified if Certified'
  },
  {
    id: 'term-cold-pressed-unrefined',
    term: 'Cold-Pressed / Unrefined Pure Oil',
    aliases: ['cold pressed', 'cold-pressed', 'unrefined', 'virgin oil', 'extra virgin', '100% pure oil', 'hexane free'],
    category: 'personal_care',
    legalDefinition:
      'Under Codex Alimentarius Standard for Named Vegetable Oils (CXS 210-1999), cold-pressed oils are obtained exclusively by mechanical procedures (expeller pressing) without external heat or chemical solvent (hexane) extraction, preserving native tocopherols and fatty acids.',
    certifyingBody: 'Codex Alimentarius / USDA NOP / INCI Single-Ingredient Verification',
    authorityCited: 'Codex Alimentarius',
    citationUrl: 'https://www.fao.org/fao-who-codexalimentarius/',
    redFlags: [
      'Hair or body oil claims "Pure Argan/Almond/Amla Oil" on the front while the #1 ingredient on the back INCI list is Mineral Oil (Paraffinum Liquidum), Cyclopentasiloxane, or Soybean Oil.',
      'Adds synthetic antioxidants (BHT/BHA) or artificial dyes to mimic golden botanical oil color.'
    ],
    verificationRule: 'Regulated Threshold'
  },
  {
    id: 'term-natural',
    term: 'Natural / All-Natural / Plant-Based',
    aliases: ['natural', 'all natural', '100% natural', 'naturally derived', 'nature inspired', 'plant-based'],
    category: 'core_label',
    legalDefinition:
      'In cosmetics, soaps, shampoos, and supplements, "Natural" has zero statutory definition or federal certification under FDA. Brands can legally use "Natural" even when products contain synthetic preservatives, petrochemical surfactants, or undisclosed fragrance.',
    certifyingBody: 'None (No federal certifying body in US/EU for general "Natural" claims)',
    authorityCited: 'FDA',
    citationUrl: 'https://www.fda.gov/cosmetics/cosmetics-labeling-claims',
    redFlags: [
      'Product claims "Natural" on the front while containing parabens, sodium benzoate, phenoxyethanol, SLS/SLES, or synthetic fragrance.',
      'Used to imply hormone safety or organic purity without third-party certification.'
    ],
    verificationRule: 'Unregulated / Marketing Term'
  },
  {
    id: 'term-clean-label',
    term: 'Clean / Clean Beauty / Hormone-Safe Claim',
    aliases: ['clean', 'clean label', 'clean beauty', 'clean formula', 'pure & clean', 'non-toxic'],
    category: 'core_label',
    legalDefinition:
      'No statutory or regulatory definition exists under FDA, USDA, EFSA, or FSSAI. "Clean" and "Non-Toxic" are unregulated marketing terms rather than public health standards.',
    certifyingBody: 'None (Retailer-specific marketing lists only)',
    authorityCited: 'FDA',
    citationUrl: 'https://www.fda.gov/cosmetics/cosmetics-labeling-claims',
    redFlags: [
      'Masks undisclosed fragrance allergens or diethyl phthalate (DEP) under generic "Fragrance / Parfum".',
      'Replaces regulated preservatives with high concentrations of sensitizing essential oils.'
    ],
    verificationRule: 'Unregulated / Marketing Term'
  },
  {
    id: 'term-hypoallergenic-derm',
    term: 'Hypoallergenic / Dermatologist Tested',
    aliases: ['hypoallergenic', 'dermatologist tested', 'dermatologically tested', 'gentle for sensitive skin', 'tear free', 'ph balanced'],
    category: 'personal_care',
    legalDefinition:
      'FDA explicitly states there are no federal standards or definitions governing the use of "hypoallergenic" or "dermatologist tested" on soaps, shampoos, or body oils. Manufacturers are not required to submit clinical proof to FDA.',
    certifyingBody: 'None under FDA regulations',
    authorityCited: 'FDA',
    citationUrl: 'https://www.fda.gov/cosmetics/cosmetics-labeling-claims/hypoallergenic-cosmetics',
    redFlags: [
      'Contains potent contact sensitizers (Methylisothiazolinone, DMDM Hydantoin, Synthetic Fragrance, Cocamide DEA) despite claiming "Hypoallergenic" or "Dermatologist Tested".'
    ],
    verificationRule: 'Unregulated / Marketing Term'
  },
  {
    id: 'term-sulfate-paraben-free',
    term: 'Sulfate-Free / Paraben-Free / Phthalate-Free',
    aliases: ['sulfate free', 'sulfate-free', 'paraben free', 'paraben-free', 'phthalate free', 'phthalate-free', 'no sulfates', 'no parabens'],
    category: 'personal_care',
    legalDefinition:
      'Verifiable ingredient exclusion claim indicating absence of alkyl sulfates (SLS, SLES, ALS), para-hydroxybenzoic acid esters (methyl-, propyl-, butylparaben), or ortho-phthalate plasticizers on the INCI declaration.',
    certifyingBody: 'INCI Ingredient List Verification (FDA / EU Cosmetics Regulation)',
    authorityCited: 'FDA',
    citationUrl: 'https://www.fda.gov/cosmetics/cosmetics-ingredients/parabens-cosmetics',
    redFlags: [
      'Claims "Phthalate-Free" while still listing generic "Fragrance / Parfum" without full transponder disclosure.',
      'Claims "Paraben-Free" while substituting formaldehyde-releasing preservatives (DMDM Hydantoin) or Methylisothiazolinone.'
    ],
    verificationRule: 'Regulated Threshold'
  },
  {
    id: 'term-plastic-free-eco',
    term: 'Biodegradable / Eco-Friendly / Microplastic-Free',
    aliases: ['biodegradable', 'eco-friendly', 'earth friendly', 'microplastic free', 'sustainable formula'],
    category: 'environment_body',
    legalDefinition:
      'Under EPA Safer Choice and EU REACH microplastics rules, environmental impact claims must be substantiated by rapid aerobic biodegradation testing (OECD 301) and absence of synthetic polymer microparticles.',
    certifyingBody: 'EPA Safer Choice / EU Ecolabel',
    authorityCited: 'EPA',
    citationUrl: 'https://www.epa.gov/saferchoice/standard-safer-choice-labeled-products',
    redFlags: [
      'Claims "Eco-Friendly" while ingredient list contains persistent liquid plastics/polymers (Acrylates Copolymer, Carbomer, Dimethicone, Polyquaternium).'
    ],
    verificationRule: 'Regulated Threshold'
  },
  {
    id: 'term-ayurvedic-herbal',
    term: 'Ayurvedic / Herbal Standardized Formula',
    aliases: ['ayurvedic', 'authentic ayurveda', 'herbal active', 'plant protein enriched', 'botanical complex', 'standardized extract'],
    category: 'questioned_claim',
    legalDefinition:
      'Under FSSAI (Ayurveda Aahara / Nutraceuticals) and NIH NCCIH guidelines, authentic botanical supplements and oils must declare exact plant part, standardization percentage, and full excipient/carrier oil bases.',
    certifyingBody: 'FSSAI / NIH ODS / FDA INCI Rules',
    authorityCited: 'FSSAI',
    citationUrl: 'https://www.fssai.gov.in/cms/ayurveda-aahara.php',
    redFlags: [
      'Highlights revered herbs (Ashwagandha, Bhringraj, Amla, Neem) on the front while using Mineral Oil, SLS, synthetic dyes, or unquantified "Proprietary Blend" fillers as the primary base.'
    ],
    verificationRule: 'Regulated Threshold'
  }
];

export const FLAGGED_ADDITIVES_DB: FlaggedAdditive[] = [
  {
    id: 'add-phthalates',
    name: 'Phthalates & Undisclosed Fragrance (DEP, DBP, DEHP / Parfum)',
    synonyms: ['phthalate', 'diethyl phthalate', 'dibutyl phthalate', 'dehp', 'dbp', 'dep', 'fragrance', 'parfum', 'synthetic fragrance'],
    category: 'plastic_endocrine',
    isPlasticRelated: true,
    riskTier: 'High',
    primaryAuthority: 'NIH',
    registryName: 'NIH NIEHS Endocrine Disruptors & CDC National Biomonitoring Program',
    regulatoryStatusAndLimit:
      'DBP and DEHP are prohibited in cosmetics in the EU (Regulation EC 1223/2009 Annex II). In the US, Diethyl Phthalate (DEP) remains permitted as a fragrance fixative and routinely hides inside generic "Fragrance / Parfum" declarations.',
    conflictNote:
      'EFSA/EU bans DBP and DEHP outright in personal care; FDA does not require disclosure of individual fragrance solvent chemicals inside "Fragrance".',
    sideEffectsSummary:
      'Plasticizer and scent fixative that absorbs through skin and inhalation; linked to endocrine disruption, reduced sperm motility/concentration in men, altered ovarian hormone signaling in women, and allergic contact dermatitis.',
    coupleHealthImpact:
      'High priority for married couples: NIH NIEHS studies link phthalate metabolites directly to longer time-to-pregnancy, male anti-androgenic effects, and altered thyroid/reproductive hormone levels in both partners.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children', 'allergies'],
    citationUrl: 'https://www.niehs.nih.gov/health/topics/agents/phthalates',
    contextJournalismNote: 'Frequently highlighted in consumer packaging investigations regarding hidden plasticizers in scented soaps, shampoos, and body oils.'
  },
  {
    id: 'add-parabens',
    name: 'Parabens (Propylparaben, Butylparaben, Methylparaben)',
    synonyms: ['propylparaben', 'butylparaben', 'methylparaben', 'ethylparaben', 'isobutylparaben', 'isopropylparaben'],
    category: 'plastic_endocrine',
    isPlasticRelated: false,
    riskTier: 'High',
    primaryAuthority: 'EFSA',
    registryName: 'EU Cosmetics Regulation (EC 1223/2009) & CDC Biomonitoring Fact Sheet',
    regulatoryStatusAndLimit:
      'Isopropyl- and isobutylparaben are banned in EU cosmetics; propylparaben and butylparaben are strictly restricted to 0.14% due to endocrine activity. FDA cosmetics regulations impose no mandatory numeric cap.',
    conflictNote:
      'EU strictly restricts long-chain parabens due to estrogenic endocrine activity; FDA maintains current cosmetic preservative concentrations are safe.',
    sideEffectsSummary:
      'Absorbs percutaneously (especially in leave-on oils and lotions) and mimics estrogen (xenoestrogen), potentially interfering with male testosterone/sperm parameters and female cycle regulation.',
    coupleHealthImpact:
      'CDC biomonitoring shows significantly higher urinary paraben levels in households using paraben-preserved personal care products, impacting shared hormonal wellbeing.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children', 'allergies'],
    citationUrl: 'https://www.cdc.gov/biomonitoring/Parabens_FactSheet.html'
  },
  {
    id: 'add-bpa-bps',
    name: 'Bisphenol A (BPA) / Bisphenol S (BPS)',
    synonyms: ['bisphenol a', 'bpa', 'bisphenol s', 'bps', 'polycarbonate resin', 'epoxy resin lining'],
    category: 'plastic_endocrine',
    isPlasticRelated: true,
    riskTier: 'High',
    primaryAuthority: 'EFSA',
    registryName: 'EFSA 2023 Re-evaluation of Bisphenol A',
    regulatoryStatusAndLimit:
      'In April 2023, EFSA reduced the Tolerable Daily Intake (TDI) for BPA by 20,000-fold to 0.2 nanograms/kg body weight/day due to immune and reproductive toxicity.',
    conflictNote:
      'EFSA (2023) concluded dietary/packaging BPA exposure exceeds safe levels across all age groups; FDA maintains non-infant contact uses are safe.',
    sideEffectsSummary:
      'Plastic monomer that leaches from containers; mimics estradiol, disrupts immune Th17 response, metabolic function, and male/female gamete quality.',
    coupleHealthImpact:
      'Potent xenoestrogen affecting both male and female reproductive health, ovarian reserve markers, and fetal immune development.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children'],
    citationUrl: 'https://www.efsa.europa.eu/en/topics/topic/bisphenol'
  },
  {
    id: 'add-triclosan-triclocarban',
    name: 'Triclosan / Triclocarban (Antibacterial Soap Actives)',
    synonyms: ['triclosan', 'triclocarban', 'chloro-2-(2,4-dichlorophenoxy)phenol'],
    category: 'personal_care_preservative',
    isPlasticRelated: false,
    riskTier: 'High',
    primaryAuthority: 'FDA',
    registryName: 'FDA 2016 Final Rule on Consumer Antiseptic Wash Products (21 CFR 310.545)',
    regulatoryStatusAndLimit:
      'Banned by FDA in consumer OTC antibacterial hand and body soaps in 2016 after manufacturers failed to prove they were safe for daily long-term use or more effective than plain soap and water.',
    sideEffectsSummary:
      'Chlorinated aromatic compound linked to thyroid hormone disruption, estrogen/androgen interference, dermal absorption, and antibiotic cross-resistance.',
    coupleHealthImpact:
      'Disrupts thyroid and reproductive hormones in adults while offering zero hygiene benefit over gentle non-antibacterial soap.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children'],
    citationUrl: 'https://www.fda.gov/consumers/consumer-updates/skip-antibacterial-soap-use-plain-soap-and-water'
  },
  {
    id: 'add-sls-sles',
    name: 'Sodium Lauryl Sulfate (SLS) / Sodium Laureth Sulfate (SLES)',
    synonyms: ['sodium lauryl sulfate', 'sodium laureth sulfate', 'sls', 'sles', 'ammonium lauryl sulfate', 'ammonium laureth sulfate', 'sodium c14-16 olefin sulfonate'],
    category: 'surfactant_cleanser',
    isPlasticRelated: false,
    riskTier: 'Moderate',
    primaryAuthority: 'FDA',
    registryName: 'FDA Cosmetic Ingredient Review & 1,4-Dioxane Manufacturing Byproduct Guidance',
    regulatoryStatusAndLimit:
      'Permitted surfactant in rinse-off soaps and shampoos; however, ethoxylated surfactants (SLES, Ammonium Laureth Sulfate) can carry trace 1,4-dioxane (a WHO/IARC Group 2B possible human carcinogen) formed during ethoxylation.',
    sideEffectsSummary:
      'Aggressive anionic detergent that strips natural epidermal and scalp lipids, compromises skin barrier integrity, triggers eczema/contact dermatitis flares, and carries potential 1,4-dioxane trace contamination.',
    coupleHealthImpact:
      'Often causes dry, itchy scalp or body skin irritation for at least one partner in the household, while ethoxylated forms add avoidable contaminant exposure.',
    vulnerableGroups: ['children', 'allergies'],
    citationUrl: 'https://www.fda.gov/cosmetics/potential-contaminants-cosmetics/14-dioxane-cosmetics-manufacturing-byproduct'
  },
  {
    id: 'add-cocamide-dea',
    name: 'Cocamide DEA / Lauramide DEA (Diethanolamine Foam Boosters)',
    synonyms: ['cocamide dea', 'lauramide dea', 'diethanolamine', 'cocamide mea', 'oleamide dea'],
    category: 'surfactant_cleanser',
    isPlasticRelated: false,
    riskTier: 'High',
    primaryAuthority: 'WHO/IARC',
    registryName: 'WHO/IARC Monograph Vol. 101 (Cocamide Diethanolamine Group 2B) & NIH NTP',
    regulatoryStatusAndLimit:
      'Classified by WHO/IARC as Group 2B (possibly carcinogenic to humans) due to free diethanolamine (DEA) and nitrosamine formation. Prohibited in EU cosmetics when nitrosating agents are present.',
    sideEffectsSummary:
      'Foam stabilizer in shampoos and bath soaps that can react with preservatives to form carcinogenic nitrosamines (NDELA) and cause skin sensitization.',
    coupleHealthImpact:
      'Readily absorbed through the scalp and skin during warm showers; poses systemic hepatic and carcinogenic concerns.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children', 'allergies'],
    citationUrl: 'https://monographs.iarc.who.int/list-of-classifications'
  },
  {
    id: 'add-dmdm-formaldehyde',
    name: 'Formaldehyde-Releasing Preservatives (DMDM Hydantoin, Imidazolidinyl Urea)',
    synonyms: ['dmdm hydantoin', 'imidazolidinyl urea', 'diazolidinyl urea', 'quaternium-15', 'bronopol', 'sodium hydroxymethylglycinate'],
    category: 'personal_care_preservative',
    isPlasticRelated: false,
    riskTier: 'High',
    primaryAuthority: 'WHO/IARC',
    registryName: 'WHO/IARC Monograph Vol. 100F (Formaldehyde Group 1) & EU Annex V',
    regulatoryStatusAndLimit:
      'Formaldehyde is classified as a Group 1 known human carcinogen by WHO/IARC. Quaternium-15 is banned in the EU, and EU regulations require formaldehyde warning labels at 0.001% (10 ppm).',
    sideEffectsSummary:
      'Slowly releases free formaldehyde into water-based shampoos and body washes; potent skin allergen linked to scalp dermatitis, hair shedding from follicular inflammation, and respiratory sensitization.',
    coupleHealthImpact:
      'Releases volatile and dermal formaldehyde in warm shower steam, exposing both partners to a Group 1 carcinogen and scalp sensitizer.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children', 'allergies'],
    citationUrl: 'https://monographs.iarc.who.int/list-of-classifications'
  },
  {
    id: 'add-methylisothiazolinone',
    name: 'Methylisothiazolinone (MI) / Methylchloroisothiazolinone (MCI)',
    synonyms: ['methylisothiazolinone', 'methylchloroisothiazolinone', 'kathon cg'],
    category: 'personal_care_preservative',
    isPlasticRelated: false,
    riskTier: 'High',
    primaryAuthority: 'EFSA',
    registryName: 'EU Scientific Committee on Consumer Safety (SCCS) / Regulation 2016/1198',
    regulatoryStatusAndLimit:
      'Banned in all leave-on cosmetics in the EU and restricted to 0.0015% (15 ppm) in rinse-off soaps and shampoos due to severe epidemic contact allergy rates.',
    sideEffectsSummary:
      'High-potency contact allergen linked to acute allergic eczema, eyelid/scalp dermatitis, and neurotoxicity in in-vitro mammalian models.',
    coupleHealthImpact:
      'One of the leading causes of sudden-onset scalp and body rashes from "paraben-free" shampoos and liquid soaps.',
    vulnerableGroups: ['children', 'allergies'],
    citationUrl: 'https://www.fda.gov/cosmetics/cosmetics-ingredients/allergens-cosmetics'
  },
  {
    id: 'add-zinc-pyrithione',
    name: 'Pyrithione Zinc (Zinc Pyrithione Anti-Dandruff Active)',
    synonyms: ['pyrithione zinc', 'zinc pyrithione', 'zpt'],
    category: 'personal_care_preservative',
    isPlasticRelated: false,
    riskTier: 'Moderate',
    primaryAuthority: 'FDA',
    registryName: 'FDA OTC Dandruff Monograph (21 CFR 358.710) vs. EU Omnibus IV Ban (2022)',
    regulatoryStatusAndLimit:
      'Approved by FDA as an OTC anti-dandruff shampoo active (0.3%–2% rinse-off). However, banned in all EU cosmetics since March 2022 following classification as Reprotoxic Category 1B.',
    conflictNote:
      'Major regulatory split: Permitted by FDA as an OTC dandruff active; banned in EU cosmetics under reproductive developmental toxicity hazard classification.',
    sideEffectsSummary:
      'Effective antifungal active for seborrheic dermatitis/dandruff, but carries EU Category 1B reproductive/developmental toxicity classification.',
    coupleHealthImpact:
      'Important trade-off for couples planning pregnancy: while effective for dandruff, EU regulators banned it over developmental reproductive toxicity concerns.',
    vulnerableGroups: ['fertility', 'pregnancy'],
    citationUrl: 'https://www.fda.gov/drugs/status-otc-rulemakings/rulemaking-history-otc-dandruff-seborrheic-dermatitis-and-psoriasis-drug-products'
  },
  {
    id: 'add-mineral-oil-petrolatum',
    name: 'Mineral Oil / Paraffinum Liquidum / Petrolatum (Petroleum Base Oil)',
    synonyms: ['mineral oil', 'paraffinum liquidum', 'petrolatum', 'liquid paraffin', 'light mineral oil', 'white mineral oil'],
    category: 'personal_care_preservative',
    isPlasticRelated: true,
    riskTier: 'Moderate',
    primaryAuthority: 'EFSA',
    registryName: 'EFSA Scientific Opinion on Mineral Oil Hydrocarbons (MOH / MOAH) & WHO/IARC',
    regulatoryStatusAndLimit:
      'Highly refined white mineral oil is permitted by FDA; however, EFSA (2023) raised concern over Mineral Oil Aromatic Hydrocarbons (MOAH) as potentially genotoxic and carcinogenic if refinement is incomplete, and Mineral Oil Saturated Hydrocarbons (MOSH) bioaccumulation.',
    sideEffectsSummary:
      'Cheap petroleum-derived hydrocarbon oil used to dilute hair and body oils; forms an occlusive film without providing essential fatty acids, and lower-grade fractions risk MOAH contamination.',
    coupleHealthImpact:
      'In leave-on body, massage, and hair oils, replaces nutrient-rich botanical oils with a petrochemical occlusive that can trap heat/sweat and clog follicles.',
    vulnerableGroups: ['allergies'],
    citationUrl: 'https://www.efsa.europa.eu/en/topics/topic/mineral-oil-hydrocarbons'
  },
  {
    id: 'add-bha-bht',
    name: 'Butylated Hydroxyanisole (BHA) / Butylated Hydroxytoluene (BHT)',
    synonyms: ['bha', 'butylated hydroxyanisole', 'bht', 'butylated hydroxytoluene', 'e320', 'e321'],
    category: 'plastic_endocrine',
    isPlasticRelated: false,
    riskTier: 'High',
    primaryAuthority: 'WHO/IARC',
    registryName: 'WHO/IARC Monograph Vol. 40 & NIH National Toxicology Program (NTP) Report on Carcinogens',
    regulatoryStatusAndLimit:
      'BHA is classified by WHO/IARC as Group 2B (possibly carcinogenic to humans) and by NIH NTP as "reasonably anticipated to be a human carcinogen". Commonly added to body/hair oils, soaps, and fat-soluble vitamin softgels to prevent rancidity.',
    sideEffectsSummary:
      'Synthetic phenolic antioxidants linked to tumors in animal models, thyroid hormone interference, and suspected reproductive/endocrine disruption (whereas natural Vitamin E / Tocopherol achieves the same preservation safely).',
    coupleHealthImpact:
      'Particularly concerning in leave-on body/hair oils and daily supplement softgels where dermal or oral absorption occurs daily.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children'],
    citationUrl: 'https://ntp.niehs.nih.gov/whatwestudy/assessments/cancer/roc'
  },
  {
    id: 'add-microplastics-acrylates',
    name: 'Synthetic Polymer Microparticles & Silicones (Acrylates / Carbomer / Dimethicone)',
    synonyms: ['acrylates copolymer', 'polyethylene', 'polyquaternium', 'carbomer', 'nylon-12', 'pmma', 'dimethicone', 'cyclopentasiloxane', 'cyclotetrasiloxane'],
    category: 'plastic_endocrine',
    isPlasticRelated: true,
    riskTier: 'Moderate',
    primaryAuthority: 'EPA',
    registryName: 'US Microbead-Free Waters Act (FDA) & EU REACH D4/D5/Microplastics Restriction',
    regulatoryStatusAndLimit:
      'Solid microbeads are banned under the US Microbead-Free Waters Act; cyclic silicones (D4/D5 such as Cyclotetrasiloxane/Cyclopentasiloxane) are restricted in the EU due to bioaccumulation and D4 reproductive toxicity.',
    sideEffectsSummary:
      'Plastic-derived film formers and cyclic silicones that create temporary slip in shampoos and hair oils while accumulating on the scalp and persisting in the environment.',
    coupleHealthImpact:
      'Cyclic silicones (especially D4) carry EU endocrine and fertility warnings, while heavy polymers mask underlying hair/skin dryness.',
    vulnerableGroups: ['fertility', 'allergies'],
    citationUrl: 'https://www.fda.gov/cosmetics/cosmetics-laws-regulations/microbead-free-waters-act-faqs'
  },
  {
    id: 'add-titanium-dioxide',
    name: 'Titanium Dioxide (E171 / CI 77891 Supplement Tablet Whitener)',
    synonyms: ['titanium dioxide', 'e171', 'ci 77891'],
    category: 'supplement_excipient',
    isPlasticRelated: false,
    riskTier: 'High',
    primaryAuthority: 'EFSA',
    registryName: 'EFSA 2021 Safety Assessment of Titanium Dioxide (E171) as Ingested Additive',
    regulatoryStatusAndLimit:
      'Banned in all ingested supplements and foods in the EU since 2022 after EFSA concluded genotoxicity (DNA damage) concerns from nanoparticles could not be ruled out. FDA still allows up to 1% by weight in US supplement tablets and soaps.',
    conflictNote:
      'EFSA considers E171 no longer safe when ingested in supplements due to potential DNA damage and intestinal accumulation; FDA still permits up to 1%.',
    sideEffectsSummary:
      'Purely cosmetic whitening pigment used in supplement tablets/capsules and bar soaps; ingested nanoparticle fraction may accumulate in gut tissue with unresolved genotoxicity risk.',
    coupleHealthImpact:
      'Zero health benefit in a daily vitamin—adds unnecessary nanoparticle exposure to a product taken every single day for wellbeing.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children'],
    citationUrl: 'https://www.efsa.europa.eu/en/news/titanium-dioxide-e171-no-longer-considered-safe-when-used-food-additive'
  },
  {
    id: 'add-synthetic-dyes',
    name: 'Synthetic Petroleum Dyes (Red 40, Yellow 5, Yellow 6, Blue 1, Red 3)',
    synonyms: ['red 40', 'allura red', 'yellow 5', 'tartrazine', 'yellow 6', 'sunset yellow', 'blue 1', 'brilliant blue', 'fd&c red no. 40', 'fd&c yellow no. 5', 'red 3', 'erythrosine', 'ci 19140', 'ci 16035', 'ci 42090'],
    category: 'colorant_sweetener',
    isPlasticRelated: false,
    riskTier: 'High',
    primaryAuthority: 'EFSA',
    registryName: 'EFSA Re-evaluation of Azo Dyes, EU Regulation 1333/2008 & FDA Red No. 3 Revocation',
    regulatoryStatusAndLimit:
      'FDA revoked authorization for Red No. 3 in ingested products due to thyroid tumors in rats; in the EU, ingested products with Yellow 5, Yellow 6, or Red 40 require warning labels.',
    conflictNote:
      'EU mandates warnings on azo dyes; many US multivitamins, gummies, shampoos, and oils still use FD&C dyes purely for visual appeal.',
    sideEffectsSummary:
      'Petroleum-derived colorants with zero nutritional or therapeutic value; linked to thyroid disruption (Red 3), hypersensitivity reactions, and trace benzidine contaminant concerns.',
    coupleHealthImpact:
      'Completely unnecessary in daily supplements, shampoos, or herbal oils; clean formulations use natural plant pigments or uncolored capsules.',
    vulnerableGroups: ['pregnancy', 'children', 'allergies'],
    citationUrl: 'https://www.fda.gov/food/color-additives-information-consumers/color-additives-questions-and-answers-consumers'
  },
  {
    id: 'add-talc-silicate',
    name: 'Talc / Magnesium Silicate (Supplement Tablet Anti-Caking & Soap Filler)',
    synonyms: ['talc', 'hydrated magnesium silicate', 'magnesium silicate', 'talcum'],
    category: 'supplement_excipient',
    isPlasticRelated: false,
    riskTier: 'Moderate',
    primaryAuthority: 'WHO/IARC',
    registryName: 'WHO/IARC 2024 Monograph Vol. 136 (Talc Classified as Group 2A Probably Carcinogenic)',
    regulatoryStatusAndLimit:
      'In July 2024, WHO/IARC classified Talc as Group 2A ("probably carcinogenic to humans") based on ovarian cancer evidence and potential asbestos co-contamination in mined talc deposits.',
    conflictNote:
      'WHO/IARC elevated Talc to Group 2A in 2024; FDA still permits USP-grade talc as a tablet glidant/anti-caking excipient in supplements and soaps.',
    sideEffectsSummary:
      'Mineral glidant used in compressed vitamin tablets and bar soaps; carries WHO/IARC Group 2A classification and potential respiratory/gastrointestinal or perineal exposure concerns.',
    coupleHealthImpact:
      'Couples can easily avoid talc in daily supplements by choosing vegetable capsules using cellulose or rice hull concentrate instead.',
    vulnerableGroups: ['fertility', 'pregnancy', 'children'],
    citationUrl: 'https://monographs.iarc.who.int/'
  },
  {
    id: 'add-carrageenan',
    name: 'Carrageenan (E407 Vegetarian Softgel & Gummy Thickener)',
    synonyms: ['carrageenan', 'e407', 'degraded carrageenan'],
    category: 'supplement_excipient',
    isPlasticRelated: false,
    riskTier: 'Moderate',
    primaryAuthority: 'EFSA',
    registryName: 'EFSA Re-evaluation of Carrageenan (E407) & USDA National Organic List',
    regulatoryStatusAndLimit:
      'Permitted by FDA (21 CFR 172.620); EFSA set a temporary ADI in 2018 while noting uncertainties regarding low-molecular-weight poligeenan breakdown products.',
    sideEffectsSummary:
      'Common gelling agent in vegan omega-3 softgels and supplement gummies that may trigger gastrointestinal inflammation, bloating, or altered gut barrier permeability in sensitive individuals.',
    coupleHealthImpact:
      'In daily supplements taken on an empty stomach, carrageenan can provoke digestive discomfort where tapioca starch, pectin, or hypromellose capsules would not.',
    vulnerableGroups: ['children'],
    citationUrl: 'https://www.efsa.europa.eu/en/efsajournal/pub/5238'
  },
  {
    id: 'add-polysorbate-hydrogenated',
    name: 'Polysorbate 80 / Partially Hydrogenated Soybean or Cottonseed Oil (Supplement Fillers)',
    synonyms: ['polysorbate 80', 'hydrogenated soybean oil', 'partially hydrogenated', 'hydrogenated cottonseed oil', 'hydrogenated palm oil', 'polyethylene glycol', 'peg-40 hydrogenated castor oil'],
    category: 'supplement_excipient',
    isPlasticRelated: false,
    riskTier: 'Moderate',
    primaryAuthority: 'FDA',
    registryName: 'FDA Final Determination on Partially Hydrogenated Oils & EFSA Polysorbate Assessment',
    regulatoryStatusAndLimit:
      'FDA revoked GRAS status for Partially Hydrogenated Oils (industrial trans fats) in food; ethoxylated emulsifiers like Polysorbate 80 and PEG compounds carry ethoxylation byproduct limits.',
    sideEffectsSummary:
      'Synthetic emulsifiers and oxidized/hydrogenated tablet lubricants that can irritate the gut mucosa and introduce unnecessary industrial processing residues into daily supplements.',
    coupleHealthImpact:
      'Lowers the purity of daily vitamins; high-quality supplements use cold-pressed olive, MCT, or sunflower oil carriers instead.',
    vulnerableGroups: ['allergies'],
    citationUrl: 'https://www.fda.gov/food/food-additives-petitions/trans-fat'
  },
  {
    id: 'add-sodium-benzoate',
    name: 'Sodium Benzoate (E211 Liquid Supplement & Personal Care Preservative)',
    synonyms: ['sodium benzoate', 'e211', 'benzoic acid'],
    category: 'personal_care_preservative',
    isPlasticRelated: false,
    riskTier: 'Moderate',
    primaryAuthority: 'FDA',
    registryName: 'FDA 21 CFR 184.1733 & Benzene Formation Advisory',
    regulatoryStatusAndLimit:
      'Permitted preservative up to 0.1% in oral liquids and up to 0.5% in rinse-off cosmetics. When combined with Ascorbic Acid (Vitamin C) or Citric Acid under heat/light, it can form trace benzene (a WHO/IARC Group 1 carcinogen).',
    sideEffectsSummary:
      'Antimicrobial preservative; safe alone at low levels, but warrants caution when paired with Vitamin C or citric acid in liquid supplements, shampoos, or washes due to potential benzene formation.',
    coupleHealthImpact:
      'Check whether the same formula also lists Ascorbic Acid (Vitamin C) or Citric Acid alongside Sodium Benzoate.',
    vulnerableGroups: ['children', 'allergies'],
    citationUrl: 'https://www.fda.gov/food/environmental-contaminants-food/questions-and-answers-occurrence-benzene-soft-drinks-and-other-beverages'
  },
  {
    id: 'add-aspartame-sweeteners',
    name: 'Artificial Sweeteners in Gummy/Chewable Supplements (Aspartame, Sucralose, Acesulfame K)',
    synonyms: ['aspartame', 'sucralose', 'acesulfame potassium', 'acesulfame k', 'ace-k', 'saccharin', 'neotame'],
    category: 'colorant_sweetener',
    isPlasticRelated: false,
    riskTier: 'Moderate',
    primaryAuthority: 'WHO/IARC',
    registryName: 'WHO/IARC & JECFA 2023 Aspartame Hazard Assessment',
    regulatoryStatusAndLimit:
      'In July 2023, WHO/IARC classified Aspartame as Group 2B (possibly carcinogenic), while WHO advised against routine non-sugar sweeteners.',
    conflictNote:
      'WHO/IARC classified aspartame as Group 2B; FDA maintains safety below the 50 mg/kg ADI.',
    sideEffectsSummary:
      'Synthetic high-intensity sweeteners added to chewable or powdered supplements; unnecessary in daily wellness products and linked to gut microbiome shifts.',
    coupleHealthImpact:
      'Capsule or unflavored tablet supplements avoid artificial sweeteners entirely.',
    vulnerableGroups: ['pregnancy', 'children'],
    citationUrl: 'https://www.who.int/news/item/14-07-2023-aspartame-hazard-and-risk-assessment-results-released'
  }
];

export const SAFE_COMMON_INGREDIENTS: Record<
  string,
  {
    authority: AllowedBody['id'];
    registry: string;
    status: string;
    note: string;
    url: string;
  }
> = {
  water: {
    authority: 'FDA',
    registry: 'USP / FDA Cosmetic & Supplement Baseline',
    status: 'Standard purified solvent (Low Risk)',
    note: 'Primary purified water vehicle; zero toxicological concern.',
    url: 'https://www.fda.gov/cosmetics/cosmetics-labeling/cosmetics-labeling-guide'
  },
  aqua: {
    authority: 'FDA',
    registry: 'INCI Standard Nomenclature',
    status: 'Standard solvent (Low Risk)',
    note: 'Purified water vehicle in personal care.',
    url: 'https://www.fda.gov/cosmetics/cosmetics-labeling/cosmetics-labeling-guide'
  },
  glycerin: {
    authority: 'FDA',
    registry: '21 CFR 182.1320 (GRAS) & CIR Safe',
    status: 'Generally Recognized As Safe (GRAS)',
    note: 'Plant-derived humectant that supports skin moisture barrier in soaps and shampoos with a strong safety record.',
    url: 'https://www.cfsanappsexternal.fda.gov/scripts/fdcc/index.cfm?set=SCOGS'
  },
  'citric acid': {
    authority: 'FDA',
    registry: '21 CFR 184.1033 (Affirmed GRAS)',
    status: 'Affirmed GRAS under Good Manufacturing Practice',
    note: 'Gentle organic acid used to balance pH to skin/scalp-friendly levels (pH 4.5–5.5).',
    url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list'
  },
  'aloe barbadensis leaf juice': {
    authority: 'NIH',
    registry: 'NIH NCCIH Botanical Monograph & CIR Assessment',
    status: 'Safe decolorized inner leaf gel in topical applications',
    note: 'Soothing botanical humectant for sensitive skin and scalp.',
    url: 'https://www.nccih.nih.gov/health/aloe-vera'
  },
  'aloe vera': {
    authority: 'NIH',
    registry: 'NIH NCCIH Botanical Monograph',
    status: 'Safe inner leaf gel extract',
    note: 'Traditional skin and scalp conditioning botanical.',
    url: 'https://www.nccih.nih.gov/health/aloe-vera'
  },
  'coco-glucoside': {
    authority: 'EPA',
    registry: 'EPA Safer Choice Chemical Ingredient List (Green Circle)',
    status: 'Verified low concern by EPA Safer Choice',
    note: 'Coconut and fruit-sugar derived non-ionic cleanser with very low skin/eye irritation and zero ethoxylation (no 1,4-dioxane risk).',
    url: 'https://www.epa.gov/saferchoice/safer-ingredients'
  },
  'decyl glucoside': {
    authority: 'EPA',
    registry: 'EPA Safer Choice Chemical Ingredient List (Green Circle)',
    status: 'Verified low concern by EPA Safer Choice',
    note: 'Mild sugar-derived surfactant ideal for sensitive skin, eczema-prone households, and daily shampoos.',
    url: 'https://www.epa.gov/saferchoice/safer-ingredients'
  },
  'lauryl glucoside': {
    authority: 'EPA',
    registry: 'EPA Safer Choice Chemical Ingredient List (Green Circle)',
    status: 'Verified low concern by EPA Safer Choice',
    note: 'Gentle biodegradable plant-sugar cleanser that cleans without stripping epidermal lipids.',
    url: 'https://www.epa.gov/saferchoice/safer-ingredients'
  },
  'sodium cocoyl isethionate': {
    authority: 'EPA',
    registry: 'EPA Safer Choice & CIR Safe Surfactant Assessment',
    status: 'Verified mild coconut fatty acid surfactant',
    note: 'Ultra-gentle "baby foam" cleanser used in syndet bars and sulfate-free shampoos.',
    url: 'https://www.epa.gov/saferchoice/safer-ingredients'
  },
  'potassium cocoate': {
    authority: 'FDA',
    registry: '21 CFR 701.20 (True Saponified Coconut Oil Soap)',
    status: 'Traditional saponified plant oil soap',
    note: 'Authentic castile soap cleanser made by saponifying coconut oil; biodegradable and petrochemical-free.',
    url: 'https://www.fda.gov/cosmetics/cosmetic-products/soap'
  },
  'sodium olivate': {
    authority: 'FDA',
    registry: '21 CFR 701.20 (True Saponified Olive Oil Soap)',
    status: 'Traditional saponified olive oil soap',
    note: 'Gentle castile bar soap base rich in conditioning oleic glycerides.',
    url: 'https://www.fda.gov/cosmetics/cosmetic-products/soap'
  },
  'cocamidopropyl betaine': {
    authority: 'EPA',
    registry: 'EPA Safer Choice & FDA CIR Assessment',
    status: 'Safe amphoteric surfactant in rinse-off formulations',
    note: 'Coconut-derived foam booster; significantly milder than lauryl sulfates.',
    url: 'https://www.epa.gov/saferchoice/safer-ingredients'
  },
  'simmondsia chinensis seed oil': {
    authority: 'USDA',
    registry: 'INCI & USDA NOP Botanical Carrier Oil (Jojoba Oil)',
    status: 'Safe non-comedogenic botanical wax ester',
    note: 'Jojoba oil closely mimics natural human sebum, absorbing cleanly into skin and scalp without clogging pores or disrupting hormones.',
    url: 'https://www.ams.usda.gov/about-ams/programs-offices/national-organic-program'
  },
  'jojoba oil': {
    authority: 'USDA',
    registry: 'INCI & USDA NOP Botanical Carrier Oil',
    status: 'Safe non-comedogenic botanical oil',
    note: 'Balances scalp and skin moisture barrier naturally.',
    url: 'https://www.ams.usda.gov/about-ams/programs-offices/national-organic-program'
  },
  'prunus amygdalus dulcis oil': {
    authority: 'Codex Alimentarius',
    registry: 'Codex CXS 210-1999 & INCI Carrier Oil (Sweet Almond Oil)',
    status: 'Safe nourishing plant oil (Tree nut allergen note)',
    note: 'Rich in Vitamin E and oleic/linoleic fatty acids for body massage and hair nourishment; note tree-nut sensitivity if applicable.',
    url: 'https://www.fao.org/fao-who-codexalimentarius/'
  },
  'sweet almond oil': {
    authority: 'Codex Alimentarius',
    registry: 'Codex CXS 210-1999 Named Vegetable Oil Standard',
    status: 'Safe cold-pressed botanical oil (Tree nut allergen note)',
    note: 'Deeply emollient leave-on body and hair oil base.',
    url: 'https://www.fao.org/fao-who-codexalimentarius/'
  },
  'argania spinosa kernel oil': {
    authority: 'Codex Alimentarius',
    registry: 'Codex CXS 210-1999 & INCI Botanical Oil (Argan Oil)',
    status: 'Safe antioxidant-rich botanical kernel oil',
    note: 'Cold-pressed argan oil restores hair shaft elasticity and skin lipid barrier without synthetic silicones.',
    url: 'https://www.fao.org/fao-who-codexalimentarius/'
  },
  'argan oil': {
    authority: 'Codex Alimentarius',
    registry: 'Codex Named Vegetable Oil Standard',
    status: 'Safe cold-pressed botanical oil',
    note: 'Rich in native tocopherols and squalene.',
    url: 'https://www.fao.org/fao-who-codexalimentarius/'
  },
  'cocos nucifera oil': {
    authority: 'Codex Alimentarius',
    registry: 'Codex CXS 210-1999 & FDA GRAS (Coconut Oil)',
    status: 'Safe lauric-acid rich botanical oil',
    note: 'Reduces protein loss in hair shafts and provides antimicrobial skin barrier support.',
    url: 'https://www.fao.org/fao-who-codexalimentarius/'
  },
  'coconut oil': {
    authority: 'Codex Alimentarius',
    registry: 'Codex CXS 210-1999 Standard',
    status: 'Safe botanical carrier oil',
    note: 'Penetrates hair cortex to prevent hygral fatigue and protein loss.',
    url: 'https://www.fao.org/fao-who-codexalimentarius/'
  },
  'sesamum indicum seed oil': {
    authority: 'FSSAI',
    registry: 'FSSAI / AYUSH Classical Taila Base & Codex CXS 210-1999 (Sesame Oil)',
    status: 'Approved traditional Ayurvedic & culinary oil base',
    note: 'Rich in sesamol and sesamin antioxidants; traditional warming base for Ayurvedic body and scalp oils.',
    url: 'https://www.fssai.gov.in/'
  },
  'sesame oil': {
    authority: 'FSSAI',
    registry: 'FSSAI / Codex Vegetable Oil Standard',
    status: 'Safe antioxidant-rich botanical oil',
    note: 'Traditional nourishing carrier oil.',
    url: 'https://www.fssai.gov.in/'
  },
  'butyrospermum parkii butter': {
    authority: 'FDA',
    registry: '21 CFR 184.1792 (GRAS Shea Butter) & CIR Safe',
    status: 'Affirmed GRAS & safe dermal emollient',
    note: 'Unrefined shea butter deeply conditions dry skin in bar soaps and body care.',
    url: 'https://www.fda.gov/cosmetics'
  },
  'shea butter': {
    authority: 'FDA',
    registry: '21 CFR 184.1792 (GRAS)',
    status: 'Safe botanical lipid emollient',
    note: 'Supports epidermal barrier recovery.',
    url: 'https://www.fda.gov/cosmetics'
  },
  'hydrolyzed wheat protein': {
    authority: 'FDA',
    registry: 'FDA Cosmetic Ingredient Review',
    status: 'Safe hair conditioning protein (Allergen note for Wheat allergy)',
    note: 'Strengthens hair shaft elasticity; flagged for individuals with IgE wheat allergy.',
    url: 'https://www.fda.gov/cosmetics/cosmetics-ingredients/allergens-cosmetics'
  },
  'cicer arietinum seed extract': {
    authority: 'FSSAI',
    registry: 'FSSAI / AYUSH Classical Botanical (Chickpea / Bengal Gram)',
    status: 'Recognized botanical protein source',
    note: 'Natural plant protein conditioning extract without synthetic surfactant toxicity.',
    url: 'https://www.fssai.gov.in/'
  },
  'chickpea extract': {
    authority: 'FSSAI',
    registry: 'FSSAI / AYUSH Classical Botanical',
    status: 'Recognized botanical protein source',
    note: 'Provides gentle amino acid conditioning.',
    url: 'https://www.fssai.gov.in/'
  },
  'phyllanthus emblica fruit extract': {
    authority: 'FSSAI',
    registry: 'FSSAI Ayurveda Aahara & Indian Pharmacopoeia (Amla)',
    status: 'Approved traditional botanical antioxidant',
    note: 'Rich in Vitamin C and polyphenols; supports scalp and nutritional vitality.',
    url: 'https://www.fssai.gov.in/'
  },
  amla: {
    authority: 'FSSAI',
    registry: 'FSSAI Ayurveda Aahara Botanical Schedule',
    status: 'Approved botanical fruit extract (Emblica officinalis)',
    note: 'Traditional hair and nutritional antioxidant.',
    url: 'https://www.fssai.gov.in/'
  },
  bhringraj: {
    authority: 'FSSAI',
    registry: 'FSSAI / AYUSH Classical Botanical (Eclipta alba)',
    status: 'Approved traditional scalp care herb',
    note: 'Used in Ayurvedic hair oils and shampoos to support scalp circulation and hair strength.',
    url: 'https://www.fssai.gov.in/'
  },
  tocopherol: {
    authority: 'NIH',
    registry: 'NIH ODS Vitamin E Fact Sheet & FDA 21 CFR 182.3890 (GRAS)',
    status: 'Generally Recognized As Safe natural antioxidant',
    note: 'Natural Vitamin E that protects oils and softgels from oxidation safely without needing synthetic BHT/BHA.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/'
  },
  panthenol: {
    authority: 'FDA',
    registry: '21 CFR 184.1212 (GRAS Provitamin B5)',
    status: 'Generally Recognized As Safe humectant and nutrient',
    note: 'Provitamin B5 that supports skin barrier and hair moisture retention.',
    url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list'
  },
  'cholecalciferol': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Vitamin D Fact Sheet',
    status: 'Bioavailable Vitamin D3 (Adult UL: 100 mcg / 4,000 IU daily)',
    note: 'Preferred bioavailable form of Vitamin D (D3) supporting immune, bone, and reproductive hormone health in both men and women.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/'
  },
  'vitamin d3': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Vitamin D Fact Sheet',
    status: 'Bioavailable Vitamin D3 (Adult UL: 4,000 IU/day)',
    note: 'Essential fat-soluble vitamin for bone, immune, and fertility health.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/'
  },
  'magnesium glycinate': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Magnesium Fact Sheet',
    status: 'High-bioavailability chelated mineral (Supplemental UL: 350 mg/day)',
    note: 'Amino-acid chelated magnesium that absorbs gently with minimal laxative/GI side effects compared to magnesium oxide.',
    url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/'
  },
  'magnesium bisglycinate': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Magnesium Fact Sheet',
    status: 'High-bioavailability chelated mineral',
    note: 'Supports sleep, stress resilience, and metabolic health without digestive upset.',
    url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/'
  },
  'methylfolate': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Folate Fact Sheet',
    status: 'Bioactive L-5-MTHF Folate (RDA: 400 mcg DFE; Pregnancy: 600 mcg DFE)',
    note: 'Active methylated folate that bypasses MTHFR polymorphism bottlenecks; critical for neural tube development and male/female DNA synthesis.',
    url: 'https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/'
  },
  'l-5-methyltetrahydrofolate': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Folate Fact Sheet',
    status: 'Bioactive methylated folate form',
    note: 'Directly utilizable folate form for preconception and pregnancy.',
    url: 'https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/'
  },
  'methylcobalamin': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Vitamin B12 Fact Sheet',
    status: 'Bioactive coenzyme Vitamin B12 (Low toxicity / No established UL)',
    note: 'Physiologically active form of Vitamin B12 supporting energy, neurological function, and homocysteine metabolism.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/'
  },
  'ascorbic acid': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Vitamin C Fact Sheet',
    status: 'Essential water-soluble antioxidant (Adult UL: 2,000 mg/day)',
    note: 'Supports collagen synthesis, immune defense, and non-heme iron absorption.',
    url: 'https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/'
  },
  'zinc picolinate': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Zinc Fact Sheet',
    status: 'Well-absorbed chelated zinc (Adult UL: 40 mg/day)',
    note: 'Supports immune function, skin repair, and male testosterone/sperm maturation when kept within the 40 mg/day Upper Limit.',
    url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/'
  },
  'omega-3 fish oil': {
    authority: 'NIH',
    registry: 'NIH Office of Dietary Supplements — Omega-3 Fatty Acids Fact Sheet',
    status: 'EPA & DHA essential fatty acids (Safe up to 3–5g/day per FDA/EFSA)',
    note: 'Supports cardiovascular, brain, fetal neurodevelopment, and anti-inflammatory balance when purified for heavy metals/PCBs.',
    url: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/'
  },
  'ashwagandha': {
    authority: 'NIH',
    registry: 'NIH ODS Botanical Fact Sheet & FSSAI Ayurveda Schedule (Withania somnifera)',
    status: 'Standardized adaptogenic root extract (Avoid during pregnancy)',
    note: 'Clinically studied for cortisol and stress reduction and male fertility parameters; NIH ODS advises avoiding during pregnancy.',
    url: 'https://ods.od.nih.gov/factsheets/Ashwagandha-HealthProfessional/'
  },
  'microcrystalline cellulose': {
    authority: 'FDA',
    registry: 'USP / FDA GRAS Inert Plant Fiber Excipient',
    status: 'Safe inert plant-cellulose capsule filler',
    note: 'Purified wood/plant pulp fiber used as a clean, non-absorbed excipient in capsules.',
    url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list'
  },
  'hypromellose': {
    authority: 'FDA',
    registry: '21 CFR 172.874 & USP Vegetarian Capsule Shell (HPMC)',
    status: 'Safe plant-derived vegetarian capsule shell',
    note: 'Clean vegetarian capsule material free from carrageenan, gelatin, and synthetic plasticizers.',
    url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list'
  },
  'vegetable cellulose': {
    authority: 'FDA',
    registry: 'USP / FDA GRAS Vegetarian Capsule Material',
    status: 'Safe plant-derived capsule shell',
    note: 'Clean capsule shell with zero endocrine orgenotoxicity concern.',
    url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list'
  }
};

export interface SampleCoupleComparison {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  productA: ProductInput;
  productB: ProductInput;
}

export const SAMPLE_COUPLE_COMPARISONS: SampleCoupleComparison[] = [
  {
    id: 'sample-shampoo',
    title: 'Daily Shampoo: "Natural" Marketing vs. Gentle Glucoside',
    subtitle: 'Settle the shower shelf debate between two herbal-themed shampoos',
    badge: 'Personal Care · Shampoo',
    productA: {
      slot: 'A',
      brand: 'Botanica Luxe',
      name: 'Herbal Shine & Anti-Flake Daily Shampoo',
      category: 'personal_care',
      subCategory: 'shampoo',
      inputMode: 'hybrid',
      weblinkOrBarcode: '',
      price: '9.99',
      quantity: '12',
      quantityUnit: 'fl oz',
      claimsRaw: 'Natural, Herbal Active, Hypoallergenic, Dermatologist Tested',
      ingredientsRaw:
        'Water, Sodium Laureth Sulfate, Cocamide DEA, Cocamidopropyl Betaine, Pyrithione Zinc, Fragrance, DMDM Hydantoin, Propylparaben, FD&C Yellow No. 5, Aloe Vera',
      supplementPanel: {
        servingSize: '',
        activeIngredientsRaw: '',
        thirdPartyTesting: 'none',
        exceedsUpperLimit: false
      },
      unreadableFlags: []
    },
    productB: {
      slot: 'B',
      brand: 'PureRoot Household',
      name: 'Amla & Chickpea Protein Gentle Shampoo',
      category: 'personal_care',
      subCategory: 'shampoo',
      inputMode: 'hybrid',
      weblinkOrBarcode: '',
      price: '12.50',
      quantity: '12',
      quantityUnit: 'fl oz',
      claimsRaw: 'Sulfate-Free, Paraben-Free, Biodegradable, Ayurvedic',
      ingredientsRaw:
        'Water, Coco-Glucoside, Decyl Glucoside, Glycerin, Aloe Barbadensis Leaf Juice, Cicer Arietinum Seed Extract, Phyllanthus Emblica Fruit Extract, Bhringraj, Panthenol, Tocopherol, Citric Acid',
      supplementPanel: {
        servingSize: '',
        activeIngredientsRaw: '',
        thirdPartyTesting: 'none',
        exceedsUpperLimit: false
      },
      unreadableFlags: []
    }
  },
  {
    id: 'sample-oil',
    title: 'Leave-On Body & Hair Oil: Scented Mineral Blend vs. Cold-Pressed Botanical',
    subtitle: 'Leave-on oils stay on skin for hours — compare dermal absorption & hormone safety',
    badge: 'Personal Care · Oil',
    productA: {
      slot: 'A',
      brand: 'SilkGlow',
      name: 'Nourishing Argan & Almond Body & Hair Oil',
      category: 'personal_care',
      subCategory: 'oil',
      inputMode: 'hybrid',
      weblinkOrBarcode: '',
      price: '11.99',
      quantity: '8',
      quantityUnit: 'fl oz',
      claimsRaw: '100% Natural, Pure & Clean, Hypoallergenic',
      ingredientsRaw:
        'Paraffinum Liquidum (Mineral Oil), Cyclopentasiloxane, Prunus Amygdalus Dulcis Oil, Argania Spinosa Kernel Oil, Parfum (Fragrance), Butylated Hydroxytoluene (BHT), FD&C Red No. 40',
      supplementPanel: {
        servingSize: '',
        activeIngredientsRaw: '',
        thirdPartyTesting: 'none',
        exceedsUpperLimit: false
      },
      unreadableFlags: []
    },
    productB: {
      slot: 'B',
      brand: 'VeraPress Organics',
      name: 'Cold-Pressed Jojoba, Sweet Almond & Sesame Oil',
      category: 'personal_care',
      subCategory: 'oil',
      inputMode: 'hybrid',
      weblinkOrBarcode: '',
      price: '15.99',
      quantity: '8',
      quantityUnit: 'fl oz',
      claimsRaw: 'Cold-Pressed, USDA Organic, Paraben-Free',
      ingredientsRaw:
        'Simmondsia Chinensis Seed Oil, Prunus Amygdalus Dulcis Oil, Sesamum Indicum Seed Oil, Argania Spinosa Kernel Oil, Cocos Nucifera Oil, Tocopherol',
      supplementPanel: {
        servingSize: '',
        activeIngredientsRaw: '',
        thirdPartyTesting: 'none',
        exceedsUpperLimit: false
      },
      unreadableFlags: []
    }
  },
  {
    id: 'sample-soap',
    title: 'Household Bath Soap: Antibacterial Scented Wash vs. Castile & Shea Soap',
    subtitle: 'Compare daily full-body cleansers for skin barrier & endocrine safety',
    badge: 'Personal Care · Soap',
    productA: {
      slot: 'A',
      brand: 'ShieldClean',
      name: 'Total Defense Antibacterial Moisture Body Wash',
      category: 'personal_care',
      subCategory: 'soap',
      inputMode: 'hybrid',
      weblinkOrBarcode: '',
      price: '7.49',
      quantity: '16',
      quantityUnit: 'fl oz',
      claimsRaw: 'Clean Formula, Dermatologist Tested, Eco-Friendly',
      ingredientsRaw:
        'Water, Sodium Lauryl Sulfate, Cocamidopropyl Betaine, Triclosan, Acrylates Copolymer, Fragrance, Methylisothiazolinone, Sodium Benzoate, Citric Acid, Blue 1',
      supplementPanel: {
        servingSize: '',
        activeIngredientsRaw: '',
        thirdPartyTesting: 'none',
        exceedsUpperLimit: false
      },
      unreadableFlags: []
    },
    productB: {
      slot: 'B',
      brand: 'Hearth & Olive',
      name: 'Unscented Olive, Coconut & Shea Castile Soap',
      category: 'personal_care',
      subCategory: 'soap',
      inputMode: 'hybrid',
      weblinkOrBarcode: '',
      price: '10.99',
      quantity: '16',
      quantityUnit: 'fl oz',
      claimsRaw: 'Sulfate-Free, Paraben-Free, Biodegradable',
      ingredientsRaw:
        'Water, Potassium Cocoate, Sodium Olivate, Glycerin, Butyrospermum Parkii Butter, Simmondsia Chinensis Seed Oil, Aloe Barbadensis Leaf Juice, Tocopherol, Citric Acid',
      supplementPanel: {
        servingSize: '',
        activeIngredientsRaw: '',
        thirdPartyTesting: 'none',
        exceedsUpperLimit: false
      },
      unreadableFlags: []
    }
  },
  {
    id: 'sample-supplement',
    title: 'Couples Daily Supplement: Tablet with Dyes & Fillers vs. USP-Verified Capsules',
    subtitle: 'Compare active nutrient bioavailability, tablet coatings, and third-party testing',
    badge: 'Supplements · Multivitamin',
    productA: {
      slot: 'A',
      brand: 'VitaMax Daily',
      name: 'Complete Adult Multivitamin Coated Tablets',
      category: 'supplement',
      subCategory: 'multivitamin',
      inputMode: 'hybrid',
      weblinkOrBarcode: '',
      price: '13.99',
      quantity: '60',
      quantityUnit: 'servings',
      claimsRaw: 'All-Natural, Clean Label',
      ingredientsRaw:
        'Ascorbic Acid, Cholecalciferol, Microcrystalline Cellulose, Titanium Dioxide (E171), Talc, Partially Hydrogenated Soybean Oil, BHT, FD&C Red No. 40, FD&C Yellow No. 6, Polyethylene Glycol',
      supplementPanel: {
        servingSize: '1 coated tablet',
        activeIngredientsRaw:
          'Vitamin C (Ascorbic Acid) 90 mg, Vitamin D3 25 mcg (1000 IU), Synthetic Folic Acid 800 mcg, Magnesium Oxide 100 mg, Zinc Oxide 15 mg',
        thirdPartyTesting: 'none',
        exceedsUpperLimit: false
      },
      unreadableFlags: []
    },
    productB: {
      slot: 'B',
      brand: 'Kinsfolk Nutrients',
      name: 'USP-Verified Couples Essential Daily Multi',
      category: 'supplement',
      subCategory: 'multivitamin',
      inputMode: 'hybrid',
      weblinkOrBarcode: '',
      price: '24.00',
      quantity: '60',
      quantityUnit: 'servings',
      claimsRaw: 'USP Verified, Non-GMO',
      ingredientsRaw:
        'Cholecalciferol, Magnesium Glycinate, L-5-Methyltetrahydrofolate, Methylcobalamin, Ascorbic Acid, Zinc Picolinate, Hypromellose, Microcrystalline Cellulose, Tocopherol',
      supplementPanel: {
        servingSize: '2 vegetable capsules',
        activeIngredientsRaw:
          'Vitamin D3 (Cholecalciferol) 50 mcg (2000 IU), Magnesium Glycinate 200 mg, Folate (L-5-MTHF Methylfolate) 400 mcg DFE, Vitamin B12 (Methylcobalamin) 100 mcg, Vitamin C 150 mg, Zinc Picolinate 15 mg',
        thirdPartyTesting: 'usp',
        exceedsUpperLimit: false
      },
      unreadableFlags: []
    }
  }
];
