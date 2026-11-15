import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  RotateCcw,
  Scale,
  Sparkles
} from 'lucide-react';
import { ComparisonReportView } from './components/ComparisonReportView';
import { ProductInputCard } from './components/ProductInputCard';
import {
  AdditivesRegistryView,
  ClaimsGlossaryView,
  SourceRulesView
} from './components/ReferenceHubViews';
import {
  FLAGGED_ADDITIVES_DB,
  HOUSEHOLD_PRIORITY_OPTIONS,
  INITIAL_GLOSSARY_TERMS,
  SAFE_COMMON_INGREDIENTS,
  SAMPLE_COUPLE_COMPARISONS,
  SampleCoupleComparison
} from './data/regulatoryData';
import {
  ComparisonReport,
  GlossaryTerm,
  HouseholdPriorityId,
  ProductInput
} from './types/product';
import {
  AiIngredientAnnotation,
  buildComparisonReport,
  parseCommaOrLineSeparated
} from './utils/scoringEngine';

type ActiveNavTab = 'studio' | 'glossary' | 'additives' | 'sources';

const createEmptyProductInput = (slot: 'A' | 'B'): ProductInput => ({
  slot,
  name: '',
  brand: '',
  category: 'personal_care',
  subCategory: 'shampoo',
  inputMode: 'hybrid',
  weblinkOrBarcode: '',
  price: '',
  quantity: '',
  quantityUnit: 'fl oz',
  claimsRaw: '',
  ingredientsRaw: '',
  supplementPanel: {
    servingSize: '',
    activeIngredientsRaw: '',
    thirdPartyTesting: 'none',
    exceedsUpperLimit: false
  },
  unreadableFlags: []
});

const GLOSSARY_STORAGE_KEY = 'kyp_custom_glossary_terms_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('studio');
  const [productA, setProductA] = useState<ProductInput>(() =>
    createEmptyProductInput('A')
  );
  const [productB, setProductB] = useState<ProductInput>(() =>
    createEmptyProductInput('B')
  );

  const [activePriorities, setActivePriorities] = useState<
    HouseholdPriorityId[]
  >(['fertility_conception', 'hormone_endocrine']);

  const [glossary, setGlossary] = useState<GlossaryTerm[]>(() => {
    try {
      const saved = localStorage.getItem(GLOSSARY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GlossaryTerm[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...INITIAL_GLOSSARY_TERMS, ...parsed];
        }
      }
    } catch {
      // Ignore storage errors
    }
    return INITIAL_GLOSSARY_TERMS;
  });

  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [lastAiAnnotations, setLastAiAnnotations] = useState<
    Record<string, AiIngredientAnnotation>
  >({});
  const [isComparing, setIsComparing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const reportSectionRef = useRef<HTMLDivElement | null>(null);

  const togglePriority = (id: HouseholdPriorityId) => {
    setActivePriorities((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      if (report) {
        setReport(
          buildComparisonReport(
            productA,
            productB,
            glossary,
            lastAiAnnotations,
            next
          )
        );
      }
      return next;
    });
  };

  const handleLoadSampleComparison = (sample: SampleCoupleComparison) => {
    setValidationError(null);
    setProductA(sample.productA);
    setProductB(sample.productB);
    const generated = buildComparisonReport(
      sample.productA,
      sample.productB,
      glossary,
      {},
      activePriorities
    );
    setReport(generated);
  };

  const handleAddGlossaryTerm = (newTerm: GlossaryTerm) => {
    const updated = [...glossary, newTerm];
    setGlossary(updated);
    try {
      const customOnly = updated.filter((t) => t.id.startsWith('custom-term-'));
      localStorage.setItem(GLOSSARY_STORAGE_KEY, JSON.stringify(customOnly));
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetComparison = () => {
    setProductA(createEmptyProductInput('A'));
    setProductB(createEmptyProductInput('B'));
    setReport(null);
    setValidationError(null);
    setActiveTab('studio');
  };

  const isKnownLocally = (ingRaw: string): boolean => {
    const norm = ingRaw.toLowerCase().trim();
    const inAdditives = FLAGGED_ADDITIVES_DB.some((a) =>
      a.synonyms.some(
        (syn) => norm === syn.toLowerCase() || norm.includes(syn.toLowerCase())
      )
    );
    if (inAdditives) return true;
    return Object.keys(SAFE_COMMON_INGREDIENTS).some(
      (k) => norm === k.toLowerCase() || norm.includes(k.toLowerCase())
    );
  };

  const handleRunComparison = async () => {
    setValidationError(null);

    const listA = [
      ...parseCommaOrLineSeparated(productA.ingredientsRaw),
      ...(productA.category === 'supplement'
        ? parseCommaOrLineSeparated(
            productA.supplementPanel.activeIngredientsRaw
          )
        : [])
    ];
    const listB = [
      ...parseCommaOrLineSeparated(productB.ingredientsRaw),
      ...(productB.category === 'supplement'
        ? parseCommaOrLineSeparated(
            productB.supplementPanel.activeIngredientsRaw
          )
        : [])
    ];

    if (!productA.name.trim() || !productB.name.trim()) {
      setValidationError(
        'Please enter a Product Name for both Product A and Product B before generating the comparison.'
      );
      return;
    }

    if (listA.length === 0 || listB.length === 0) {
      setValidationError(
        'Both products require an ingredient list (either extracted via AI Label OCR or entered in the ingredient / active nutrient fields).'
      );
      return;
    }

    const priceA = parseFloat(productA.price);
    const qtyA = parseFloat(productA.quantity);
    const priceB = parseFloat(productB.price);
    const qtyB = parseFloat(productB.quantity);

    if (
      (productA.price.trim() !== '' && (Number.isNaN(priceA) || priceA <= 0)) ||
      (productA.quantity.trim() !== '' && (Number.isNaN(qtyA) || qtyA <= 0)) ||
      (productB.price.trim() !== '' && (Number.isNaN(priceB) || priceB <= 0)) ||
      (productB.quantity.trim() !== '' && (Number.isNaN(qtyB) || qtyB <= 0))
    ) {
      setValidationError(
        'If entering Price or Quantity, please use a positive number (or leave blank to skip Quality ROI).'
      );
      return;
    }

    setIsComparing(true);

    const aiAnnotationsMap: Record<string, AiIngredientAnnotation> = {
      ...lastAiAnnotations
    };

    try {
      const unknownIngredients = Array.from(
        new Set([...listA, ...listB].filter((i) => !isKnownLocally(i)))
      );

      if (unknownIngredients.length > 0) {
        const response = await fetch('/api/evaluate-ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: unknownIngredients,
            category:
              productA.category === productB.category
                ? `${productA.category} (${productA.subCategory} vs ${productB.subCategory})`
                : `${productA.category} and ${productB.category}`
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.evaluations)) {
            for (const ev of data.evaluations as AiIngredientAnnotation[]) {
              if (ev.ingredientName) {
                aiAnnotationsMap[ev.ingredientName.toLowerCase().trim()] = ev;
              }
            }
          }
        }
      }
    } catch {
      // Offline or API unreachable: deterministic local registries + "No authoritative data found" rule still apply cleanly
    }

    setLastAiAnnotations(aiAnnotationsMap);
    const generated = buildComparisonReport(
      productA,
      productB,
      glossary,
      aiAnnotationsMap,
      activePriorities
    );
    setReport(generated);
    setIsComparing(false);
  };

  useEffect(() => {
    if (report && reportSectionRef.current) {
      reportSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [report?.id]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
          >
            <HeartHandshake className="w-5 h-5 text-teal-700" />
            <span>Know Your Product · Couples & Household Edition</span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'studio'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-teal-700'
                  : 'hover:text-slate-900 hover:underline underline-offset-8'
              }`}
            >
              Couples Comparison Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('glossary')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'glossary'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-teal-700'
                  : 'hover:text-slate-900 hover:underline underline-offset-8'
              }`}
            >
              Claims Glossary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('additives')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'additives'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-teal-700'
                  : 'hover:text-slate-900 hover:underline underline-offset-8'
              }`}
            >
              Flagged Ingredients
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sources')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'sources'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-teal-700'
                  : 'hover:text-slate-900 hover:underline underline-offset-8'
              }`}
            >
              Regulatory Sources
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleResetComparison}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Comparison
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {(
          [
            { id: 'studio', label: 'Comparison Studio' },
            { id: 'glossary', label: 'Claims Glossary' },
            { id: 'additives', label: 'Flagged Ingredients' },
            { id: 'sources', label: 'Regulatory Sources' }
          ] as { id: ActiveNavTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {activeTab === 'studio' && (
          <>
            {/* Intro / Methodology Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="text-xs font-semibold text-teal-800">
                  Built for Married Couples & Shared Households · Personal Care
                  (Soaps, Shampoos, Oils) & Supplements
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Choose the Healthier Product Together — Backed by Science
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Compare two soaps, shampoos, body/hair oils, or daily
                  supplements side by side. Every ingredient is scored from{' '}
                  <strong>0–100 on Household Wellbeing</strong> and audited
                  against 9 official authorities (FDA, NIH, EFSA, WHO/IARC,
                  USDA, EPA, CDC, Codex, FSSAI) to explain the real health,
                  hormone, and skin risks of each choice.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 shrink-0 lg:w-88">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-teal-700" />
                  How We Score Personal Care vs. Supplements
                </div>
                <p className="text-xs text-slate-600">
                  • <strong>Leave-On Oils vs. Rinse-Off Soaps/Shampoos:</strong>{' '}
                  Leave-on oils carry a <span className="font-mono">1.25×</span>{' '}
                  dermal absorption weight for endocrine disruptors.
                </p>
                <p className="text-xs text-slate-600">
                  • <strong>Dedicated Supplement Formula:</strong> Audits active
                  nutrient bioavailability, NIH Upper Limits (UL), 3rd-party
                  seals (USP/NSF), and tablet dyes/fillers.
                </p>
                <p className="text-xs text-slate-600">
                  • <strong>Couple Profile Weighting:</strong> Adjusts penalties
                  for fertility, pregnancy, hormone, or sensitive-skin goals.
                </p>
              </div>
            </div>

            {/* Household / Couple Profile Priority Selector */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-teal-700" />
                    Step 1: Customize Your Household & Couple Wellbeing Profile
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select what matters most to you and your partner. Active
                    priorities apply stricter Wellbeing Score penalties when
                    products contain matching risk ingredients.
                  </p>
                </div>
                <span className="text-xs font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md self-start sm:self-auto shrink-0">
                  {activePriorities.length} Priority Filter(s) Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {HOUSEHOLD_PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = activePriorities.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => togglePriority(opt.id)}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/90 border-teal-700 ring-1 ring-teal-700/20'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-bold text-slate-900 leading-snug">
                            {opt.shortLabel}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-teal-700 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isSelected ? '✓' : '+'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          {opt.coupleRelevance}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick-Load Sample Comparisons for Couples */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  Try a Real-World Couple Comparison Preset (Instant 1-Click
                  Load & Score):
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SAMPLE_COUPLE_COMPARISONS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleLoadSampleComparison(sample)}
                    className="p-3 bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-600 rounded-lg text-left transition-all flex flex-col justify-between gap-2 cursor-pointer group"
                  >
                    <div>
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                        {sample.badge}
                      </span>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900 mt-1.5 leading-snug">
                        {sample.title}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-snug">
                      {sample.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dual Product Input Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <ProductInputCard
                product={productA}
                onChange={setProductA}
                onClearSlot={() => setProductA(createEmptyProductInput('A'))}
              />
              <ProductInputCard
                product={productB}
                onChange={setProductB}
                onClearSlot={() => setProductB(createEmptyProductInput('B'))}
              />
            </div>

            {/* Action Bar to Generate Comparison Report */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-slate-900">
                  Ready to Score Both Products & Explain the Health Risks?
                </div>
                <p className="text-xs text-slate-500">
                  Computes the 0–100 Household Wellbeing Score, applies your{' '}
                  {activePriorities.length} Couple Profile priority filter(s),
                  and explains the biological health risks of each choice.
                </p>
              </div>

              <button
                type="button"
                disabled={isComparing}
                onClick={handleRunComparison}
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isComparing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Auditing Ingredients & Computing Wellbeing Scores...
                  </>
                ) : (
                  <>
                    Score Both Products & Explain Health Risks
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {validationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Comparison Report Output */}
            {report && (
              <div ref={reportSectionRef} className="pt-4 space-y-6">
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-teal-900">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>
                      Couples Wellbeing & Health Risk Report generated using 9
                      official regulatory authorities.
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    Report ID: {report.id}
                  </span>
                </div>

                <ComparisonReportView report={report} />
              </div>
            )}
          </>
        )}

        {activeTab === 'glossary' && (
          <ClaimsGlossaryView
            glossary={glossary}
            onAddTerm={handleAddGlossaryTerm}
          />
        )}

        {activeTab === 'additives' && <AdditivesRegistryView />}

        {activeTab === 'sources' && <SourceRulesView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-5 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Know Your Product — Helping Couples & Households Choose Healthier
            Personal Care (Soaps, Shampoos, Oils) & Supplements
          </div>
          <div>
            Official Sources: FDA · NIH · EFSA · WHO/IARC · USDA · EPA · CDC ·
            Codex Alimentarius · FSSAI
          </div>
        </div>
      </footer>
    </div>
  );
}
